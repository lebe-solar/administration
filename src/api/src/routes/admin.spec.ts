import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { Express } from "express";
import { createApp } from "../app";

jest.setTimeout(60000);

let mongod: MongoMemoryServer;
let app: Express;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create({ binary: { version: "6.0.14" } });
    process.env.NODE_ENV = "development";
    process.env.AZURE_COSMOS_CONNECTION_STRING = mongod.getUri();
    process.env.AZURE_COSMOS_DATABASE_NAME = "LeBeAdminTest";
    app = await createApp();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

describe("categories", () => {
    it("lists the 5 static categories", async () => {
        const res = await request(app).get("/categories");
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(5);
        expect(res.body.map((c: any) => c.key)).toContain("Solarmodule");
    });
});

describe("manufacturers + products (seeded)", () => {
    it("seeds 9 manufacturers and 25 products on first boot", async () => {
        const man = await request(app).get("/manufacturers");
        expect(man.status).toBe(200);
        expect(man.body).toHaveLength(9);

        const products = await request(app).get("/products");
        expect(products.status).toBe(200);
        expect(products.body).toHaveLength(25);
    });

    it("rejects a duplicate manufacturer name", async () => {
        const res = await request(app).post("/manufacturers").send({ name: "Solarfabrik" });
        expect(res.status).toBe(422);
        expect(res.body.errors.name).toBeDefined();
    });

    it("blocks deleting a manufacturer with linked products", async () => {
        const man = await request(app).get("/manufacturers");
        const solarfabrik = man.body.find((m: any) => m.name === "Solarfabrik");
        const del = await request(app).delete(`/manufacturers/${solarfabrik.id}`);
        expect(del.status).toBe(409);
    });
});

describe("product lifecycle", () => {
    let manufacturerId: string;

    beforeAll(async () => {
        const man = await request(app).post("/manufacturers").send({ name: "Test Manufacturer GmbH", description: "", logo: null, link: "" });
        manufacturerId = man.body.id;
    });

    it("generates the next product id per category", async () => {
        const res = await request(app).get("/products/next-id?category=Solarmodule");
        expect(res.status).toBe(200);
        expect(res.body.id).toMatch(/^MOD-\d{3}$/);
    });

    it("creates, renames, and deletes a product", async () => {
        const nextId = await request(app).get("/products/next-id?category=Solarmodule");
        const id = nextId.body.id;

        const created = await request(app).post("/products").send({
            id,
            category: "Solarmodule",
            Header: "Test Modul 500W",
            Beschreibung: "Ein Testprodukt.",
            manufacturer_id: manufacturerId,
            Power: "500",
            Unit: "Watt",
            Status: "Draft",
            panelHeightMeters: "1.8",
            panelWidthMeters: "1.134",
        });
        expect(created.status).toBe(201);
        expect(created.body.id).toBe(id);
        expect(created.body.Hersteller).toBe("Test Manufacturer GmbH");

        // Renaming the id should recreate the document under the new id.
        const renamed = await request(app).put(`/products/${id}`).send({
            ...created.body,
            id: `${id}-RENAMED`,
            manufacturer_id: manufacturerId,
        });
        expect(renamed.status).toBe(200);
        expect(renamed.body.id).toBe(`${id}-RENAMED`);

        const oldGone = await request(app).get(`/products/${id}`);
        expect(oldGone.status).toBe(404);

        const del = await request(app).delete(`/products/${id}-RENAMED`);
        expect(del.status).toBe(204);
    });

    it("requires spec PDF and description when not saving as a draft", async () => {
        const nextId = await request(app).get("/products/next-id?category=Wechselrichter");
        const res = await request(app).post("/products").send({
            id: nextId.body.id,
            category: "Wechselrichter",
            Header: "Test Inverter",
            manufacturer_id: manufacturerId,
            Status: "Active",
        });
        expect(res.status).toBe(422);
        expect(res.body.errors.Beschreibung).toBeDefined();
        expect(res.body.errors.Spezifikation).toBeDefined();
    });
});

describe("offers", () => {
    it("lists the 4 seeded offers and filters by status", async () => {
        const all = await request(app).get("/offers");
        expect(all.body).toHaveLength(4);

        const drafts = await request(app).get("/offers?status=Draft");
        expect(drafts.body.every((o: any) => o.status === "Draft")).toBe(true);
    });

    it("duplicates an offer as a new Draft with a new id", async () => {
        const dup = await request(app).post("/offers/OFF-005/duplicate");
        expect(dup.status).toBe(201);
        expect(dup.body.status).toBe("Draft");
        expect(dup.body.title).toContain("(Copy)");
        expect(dup.body.id).not.toBe("OFF-005");
    });

    it("rejects an offer referencing a product that doesn't exist", async () => {
        const nextId = await request(app).get("/offers/next-id");
        const res = await request(app).post("/offers").send({
            id: nextId.body.id,
            title: "Ungültiges Angebot",
            status: "Draft",
            products: { solarModuleId: "MOD-DOES-NOT-EXIST", solarModuleCount: 1 },
        });
        expect(res.status).toBe(422);
        expect(res.body.errors.products).toBeDefined();
    });
});

describe("system components (Systemkomponenten)", () => {
    it("lists the 15 seeded components and supports full CRUD", async () => {
        const list = await request(app).get("/system-components");
        expect(list.status).toBe(200);
        expect(list.body).toHaveLength(15);

        const created = await request(app).post("/system-components").send({ name: "Test Komponente" });
        expect(created.status).toBe(201);

        const updated = await request(app).put(`/system-components/${created.body.id}`).send({ name: "Test Komponente (geändert)" });
        expect(updated.status).toBe(200);
        expect(updated.body.name).toBe("Test Komponente (geändert)");

        const del = await request(app).delete(`/system-components/${created.body.id}`);
        expect(del.status).toBe(204);
    });
});

describe("services (Inklusivleistungen)", () => {
    it("lists the 17 seeded services and supports full CRUD + duplicate", async () => {
        const list = await request(app).get("/services");
        expect(list.status).toBe(200);
        expect(list.body).toHaveLength(17);

        const created = await request(app).post("/services").send({
            name: "Test Leistung",
            descriptionLines: ["Eine Testzeile"],
        });
        expect(created.status).toBe(201);

        const dup = await request(app).post(`/services/${created.body.id}/duplicate`);
        expect(dup.status).toBe(201);
        expect(dup.body.name).toContain("(Copy)");

        const del = await request(app).delete(`/services/${created.body.id}`);
        expect(del.status).toBe(204);
    });
});

describe("requirement templates", () => {
    it("lists the 17 seeded templates and supports create + delete", async () => {
        const list = await request(app).get("/requirement-templates");
        expect(list.status).toBe(200);
        expect(list.body).toHaveLength(17);

        const created = await request(app).post("/requirement-templates").send({ title: "Test Voraussetzung" });
        expect(created.status).toBe(201);

        const del = await request(app).delete(`/requirement-templates/${created.body.id}`);
        expect(del.status).toBe(204);
    });
});
