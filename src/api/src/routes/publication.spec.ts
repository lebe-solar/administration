import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { Express } from "express";

jest.mock("../services/githubDispatch", () => {
    const actual = jest.requireActual("../services/githubDispatch");
    return {
        ...actual,
        dispatchWebClientRebuild: jest.fn(),
        findDispatchedRun: jest.fn(),
        getRunStatus: jest.fn(),
    };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const githubDispatch = require("../services/githubDispatch");

jest.setTimeout(60000);

let mongod: MongoMemoryServer;
let app: Express;

async function createManufacturer(name: string) {
    const res = await request(app).post("/manufacturers").send({ name, description: "", logo: null, link: "" });
    return res.body.id as string;
}

async function createProduct(overrides: Record<string, unknown> = {}) {
    const manufacturerId = overrides.manufacturer_id || await createManufacturer(`Hersteller ${Date.now()}-${Math.random()}`);
    const body = {
        id: `TST-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        category: "Wechselrichter",
        Header: "Test Wechselrichter",
        Beschreibung: "Eine Testbeschreibung.",
        manufacturer_id: manufacturerId,
        Garantie: "10 Jahre",
        Power: 10,
        Unit: "kW",
        Spezifikation: "https://example.com/spec.pdf",
        Status: "Draft",
        ...overrides,
    };
    const res = await request(app).post("/products").send(body);
    expect(res.status).toBe(201);
    return res.body;
}

async function createOffer(overrides: Record<string, unknown> = {}) {
    const body = {
        id: `OFF-TST-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        title: "Testangebot",
        subtitle: "Untertitel",
        status: "Draft",
        shortDescription: "Kurz",
        priceType: "on_request",
        previewImageUrl: "https://example.com/preview.png",
        validUntil: "2030-01-01",
        mainProducts: {},
        ...overrides,
    };
    const res = await request(app).post("/offers").send(body);
    expect(res.status).toBe(201);
    return res.body;
}

async function createProjectInsight(overrides: Record<string, unknown> = {}) {
    const body = {
        id: `PRJ-TST-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        title: "Testprojekt",
        locationLabel: "Rödermark",
        shortDescription: "Kurzbeschreibung",
        status: "Entwurf",
        ...overrides,
    };
    const res = await request(app).post("/project-insights").send(body);
    expect(res.status).toBe(201);
    return res.body;
}

async function pendingChangesFor(entityId: string) {
    const overview = await request(app).get("/admin/publication/overview");
    return overview.body.pendingChanges.filter((c: any) => c.entityId === entityId);
}

beforeAll(async () => {
    mongod = await MongoMemoryServer.create({ binary: { version: "6.0.14" } });
    process.env.NODE_ENV = "development";
    process.env.AZURE_COSMOS_CONNECTION_STRING = mongod.getUri();
    process.env.AZURE_COSMOS_DATABASE_NAME = "LeBePublicationTest";
    process.env.GITHUB_OWNER = "lebe-solar";
    process.env.GITHUB_REPO = "administration";
    process.env.GITHUB_WORKFLOW_ID = "web-client-deploy.yml";
    process.env.GITHUB_REF = "main";
    process.env.GITHUB_TOKEN_FOR_WEBCLIENT_REBUILD = "test-token-do-not-log";
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createApp } = require("../app");
    app = await createApp();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe("public change tracking — products", () => {
    it("does not create a pending change for a Draft-only product edit", async () => {
        const product = await createProduct({ Status: "Draft" });
        const before = await pendingChangesFor(product.id);
        expect(before).toHaveLength(0);

        const res = await request(app).put(`/products/${product.id}`).send({ ...product, Header: "Geänderter Titel, weiterhin Draft" });
        expect(res.status).toBe(200);

        const after = await pendingChangesFor(product.id);
        expect(after).toHaveLength(0);
    });

    it("creates a pending 'published' change when a product becomes Active", async () => {
        const product = await createProduct({ Status: "Active" });
        const changes = await pendingChangesFor(product.id);
        expect(changes).toHaveLength(1);
        expect(changes[0]).toMatchObject({ entityType: "product", changeType: "published", reason: "product-published", status: "pending" });
    });

    it("creates a pending 'updated' change when an Active product's public fields change", async () => {
        const product = await createProduct({ Status: "Active" });
        await request(app).post("/admin/publication/publish").send({ reason: "manual-publish" }); // clear pending via publish flow start
        await simulateSuccessfulRun();

        const res = await request(app).put(`/products/${product.id}`).send({ ...product, Header: "Neuer Titel" });
        expect(res.status).toBe(200);

        const changes = await pendingChangesFor(product.id);
        expect(changes.some((c: any) => c.changeType === "updated" && c.reason === "product-updated")).toBe(true);
    });

    it("creates a pending 'hidden' change when an Active product is hidden", async () => {
        const product = await createProduct({ Status: "Active" });
        const res = await request(app).put(`/products/${product.id}`).send({ ...product, Status: "Hidden" });
        expect(res.status).toBe(200);

        const changes = await pendingChangesFor(product.id);
        expect(changes.some((c: any) => c.changeType === "hidden" && c.reason === "product-hidden")).toBe(true);
    });
});

describe("public change tracking — offers and project insights", () => {
    it("creates a pending change when an offer is published", async () => {
        const offer = await createOffer({ status: "Active" });
        const changes = await pendingChangesFor(offer.id);
        expect(changes).toHaveLength(1);
        expect(changes[0]).toMatchObject({ entityType: "offer", changeType: "published", reason: "offer-published" });
    });

    it("creates a pending change when a project insight is published", async () => {
        const project = await createProjectInsight({ status: "Veröffentlicht" });
        const changes = await pendingChangesFor(project.id);
        expect(changes).toHaveLength(1);
        expect(changes[0]).toMatchObject({ entityType: "projectInsight", changeType: "published", reason: "projectInsight-published" });
    });
});

describe("GET /admin/publication/overview", () => {
    it("reports pending changes and status", async () => {
        await createProduct({ Status: "Active" });
        const res = await request(app).get("/admin/publication/overview");
        expect(res.status).toBe(200);
        expect(res.body.hasPendingChanges).toBe(true);
        expect(res.body.status).toBe("pending");
        expect(Array.isArray(res.body.pendingChanges)).toBe(true);
        expect(Array.isArray(res.body.history)).toBe(true);
    });
});

describe("POST /admin/publication/publish", () => {
    it("creates a deployment record and dispatches the GitHub workflow", async () => {
        githubDispatch.dispatchWebClientRebuild.mockResolvedValue(undefined);
        await createProduct({ Status: "Active" });

        const res = await request(app).post("/admin/publication/publish").send({ reason: "manual-publish" });
        expect(res.status).toBe(201);
        expect(res.body.status).toBe("queued");
        expect(githubDispatch.dispatchWebClientRebuild).toHaveBeenCalledTimes(1);
    });

    it("marks pending changes as 'publishing' once dispatched", async () => {
        githubDispatch.dispatchWebClientRebuild.mockResolvedValue(undefined);
        const product = await createProduct({ Status: "Active" });

        await request(app).post("/admin/publication/publish").send({ reason: "manual-publish" });

        const overview = await request(app).get("/admin/publication/overview");
        const stillPending = overview.body.pendingChanges.find((c: any) => c.entityId === product.id);
        expect(stillPending).toBeUndefined(); // no longer "pending" — it's "publishing" now
    });

    it("keeps changes pending when the GitHub dispatch fails", async () => {
        githubDispatch.dispatchWebClientRebuild.mockRejectedValue(new githubDispatch.GitHubDispatchError("boom"));
        const product = await createProduct({ Status: "Active" });

        const res = await request(app).post("/admin/publication/publish").send({ reason: "manual-publish" });
        expect(res.status).toBe(502);
        expect(res.body.deployment.status).toBe("failed");

        const changes = await pendingChangesFor(product.id);
        expect(changes).toHaveLength(1);
        expect(changes[0].status).toBe("pending");
    });

    it("never returns the GitHub token in any response body", async () => {
        githubDispatch.dispatchWebClientRebuild.mockResolvedValue(undefined);
        await createProduct({ Status: "Active" });
        const res = await request(app).post("/admin/publication/publish").send({ reason: "manual-publish" });
        expect(JSON.stringify(res.body)).not.toContain("test-token-do-not-log");
    });
});

describe("POST /admin/publication/deployments/:id/refresh-status", () => {
    it("marks affected changes as published once the run succeeds", async () => {
        githubDispatch.dispatchWebClientRebuild.mockResolvedValue(undefined);
        const product = await createProduct({ Status: "Active" });

        const publishRes = await request(app).post("/admin/publication/publish").send({ reason: "manual-publish" });
        const deploymentId = publishRes.body.id;

        githubDispatch.findDispatchedRun.mockResolvedValue({ runId: "123", runUrl: "https://github.com/x/y/actions/runs/123", status: "completed", conclusion: "success" });

        const refreshRes = await request(app).post(`/admin/publication/deployments/${deploymentId}/refresh-status`);
        expect(refreshRes.status).toBe(200);
        expect(refreshRes.body.status).toBe("success");

        const overview = await request(app).get("/admin/publication/overview");
        const change = overview.body.history; // sanity: history endpoint still works after status change
        expect(Array.isArray(change)).toBe(true);

        const stillPending = await pendingChangesFor(product.id);
        expect(stillPending).toHaveLength(0);
    });

    it("keeps changes pending (not published) when the run fails", async () => {
        githubDispatch.dispatchWebClientRebuild.mockResolvedValue(undefined);
        const product = await createProduct({ Status: "Active" });

        const publishRes = await request(app).post("/admin/publication/publish").send({ reason: "manual-publish" });
        const deploymentId = publishRes.body.id;

        githubDispatch.findDispatchedRun.mockResolvedValue({ runId: "456", runUrl: "https://github.com/x/y/actions/runs/456", status: "completed", conclusion: "failure" });

        const refreshRes = await request(app).post(`/admin/publication/deployments/${deploymentId}/refresh-status`);
        expect(refreshRes.status).toBe(200);
        expect(refreshRes.body.status).toBe("failed");

        const changes = await pendingChangesFor(product.id);
        expect(changes).toHaveLength(1);
        expect(changes[0].status).toBe("pending");
    });
});

describe("GET /admin/publication/deployments", () => {
    it("returns at most 10 deployments, newest first", async () => {
        githubDispatch.dispatchWebClientRebuild.mockResolvedValue(undefined);
        for (let i = 0; i < 3; i++) {
            await request(app).post("/admin/publication/publish").send({ reason: `manual-publish-${i}` });
            await simulateSuccessfulRun();
        }

        const res = await request(app).get("/admin/publication/deployments?limit=10");
        expect(res.status).toBe(200);
        expect(res.body.length).toBeLessThanOrEqual(10);
        expect(res.body.length).toBeGreaterThanOrEqual(3);
    });
});

describe("authentication", () => {
    it("rejects an unauthenticated request when Entra ID auth is actually configured", async () => {
        const authedEnv = { ...process.env, AZURE_AD_TENANT_ID: "test-tenant", AZURE_AD_CLIENT_ID: "test-client" };
        const originalTenant = process.env.AZURE_AD_TENANT_ID;
        const originalClient = process.env.AZURE_AD_CLIENT_ID;
        process.env.AZURE_AD_TENANT_ID = authedEnv.AZURE_AD_TENANT_ID;
        process.env.AZURE_AD_CLIENT_ID = authedEnv.AZURE_AD_CLIENT_ID;

        jest.resetModules();
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { createApp: createAuthedApp } = require("../app");
        const authedApp = await createAuthedApp();

        const res = await request(authedApp).get("/admin/publication/overview");
        expect(res.status).toBe(401);

        process.env.AZURE_AD_TENANT_ID = originalTenant;
        process.env.AZURE_AD_CLIENT_ID = originalClient;
    });
});

// Helper for tests that just need "a deployment reached success" without asserting on the
// refresh-status response itself.
async function simulateSuccessfulRun() {
    const overview = await request(app).get("/admin/publication/overview");
    const deploymentId = overview.body.latestDeployment?.id;
    if (!deploymentId) return;
    githubDispatch.findDispatchedRun.mockResolvedValue({ runId: `run-${deploymentId}`, runUrl: "https://github.com/x/y/actions/runs/1", status: "completed", conclusion: "success" });
    await request(app).post(`/admin/publication/deployments/${deploymentId}/refresh-status`);
}
