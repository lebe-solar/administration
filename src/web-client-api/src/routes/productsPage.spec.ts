import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { Express } from "express";
import { createApp } from "../app";
import { ProductModel } from "../models/product";
import { ManufacturerModel } from "../models/manufacturer";

jest.setTimeout(60000);

let mongod: MongoMemoryServer;
let app: Express;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create({ binary: { version: "6.0.14" } });
    process.env.NODE_ENV = "development";
    process.env.AZURE_COSMOS_CONNECTION_STRING = mongod.getUri();
    process.env.AZURE_COSMOS_DATABASE_NAME = "LeBeWebClientApiTest";
    app = await createApp();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

beforeEach(async () => {
    await ProductModel.deleteMany({});
    await ManufacturerModel.deleteMany({});
});

async function seedManufacturer(overrides: Record<string, unknown> = {}) {
    return ManufacturerModel.create({ name: "Aiko", description: "Solarmodul-Hersteller", logo: "/brands/aiko.svg", link: "https://aiko-solar.com", ...overrides });
}

describe("GET /api/products-page", () => {
    it("only returns Active products — Draft and Hidden are excluded", async () => {
        const manufacturer = await seedManufacturer();
        await ProductModel.create([
            { _id: "P-ACTIVE", category: "Solarmodule", Header: "Aktives Modul", manufacturer_id: String(manufacturer.id), Hersteller: "Aiko", Status: "Active" },
            { _id: "P-DRAFT", category: "Solarmodule", Header: "Entwurf-Modul", manufacturer_id: String(manufacturer.id), Hersteller: "Aiko", Status: "Draft" },
            { _id: "P-HIDDEN", category: "Solarmodule", Header: "Verstecktes Modul", manufacturer_id: String(manufacturer.id), Hersteller: "Aiko", Status: "Hidden" },
        ]);

        const res = await request(app).get("/api/products-page");
        expect(res.status).toBe(200);
        expect(res.body.products).toHaveLength(1);
        expect(res.body.products[0].id).toBe("P-ACTIVE");
        expect(res.body.products[0].name).toBe("Aktives Modul");
    });

    it("does not expose admin-only fields (manufacturer_id, Status, hasSpec) on products", async () => {
        const manufacturer = await seedManufacturer();
        await ProductModel.create({
            _id: "P-1", category: "Solarmodule", Header: "Modul", manufacturer_id: String(manufacturer.id),
            Hersteller: "Aiko", Status: "Active",
        });

        const res = await request(app).get("/api/products-page");
        const product = res.body.products[0];
        expect(product).not.toHaveProperty("manufacturer_id");
        expect(product).not.toHaveProperty("Status");
        expect(product).not.toHaveProperty("hasSpec");
        expect(product).toMatchObject({
            id: "P-1", name: "Modul", category: "Solarmodule", manufacturer: "Aiko",
        });
    });

    it("derives manufacturers from active products, with correct linkedProducts counts", async () => {
        const active = await seedManufacturer({ name: "Aiko" });
        const onlyDraft = await seedManufacturer({ name: "Bauer" });

        await ProductModel.create([
            { _id: "P-1", category: "Solarmodule", Header: "Modul 1", manufacturer_id: String(active.id), Hersteller: "Aiko", Status: "Active" },
            { _id: "P-2", category: "Solarmodule", Header: "Modul 2", manufacturer_id: String(active.id), Hersteller: "Aiko", Status: "Active" },
            { _id: "P-3", category: "Solarmodule", Header: "Modul 3", manufacturer_id: String(onlyDraft.id), Hersteller: "Bauer", Status: "Draft" },
        ]);

        const res = await request(app).get("/api/products-page");
        const manufacturerNames = res.body.manufacturers.map((m: any) => m.name);
        expect(manufacturerNames).toContain("Aiko");
        expect(manufacturerNames).not.toContain("Bauer"); // no Active products reference it

        const aiko = res.body.manufacturers.find((m: any) => m.name === "Aiko");
        expect(aiko.linkedProducts).toBe(2);
    });

    it("groups products by category", async () => {
        const manufacturer = await seedManufacturer();
        await ProductModel.create([
            { _id: "P-1", category: "Solarmodule", Header: "Modul", manufacturer_id: String(manufacturer.id), Hersteller: "Aiko", Status: "Active" },
            { _id: "P-2", category: "Wechselrichter", Header: "Wechselrichter", manufacturer_id: String(manufacturer.id), Hersteller: "Aiko", Status: "Active" },
        ]);

        const res = await request(app).get("/api/products-page");
        const solar = res.body.groupedProducts.find((g: any) => g.category === "Solarmodule");
        const inverter = res.body.groupedProducts.find((g: any) => g.category === "Wechselrichter");
        expect(solar.products).toHaveLength(1);
        expect(inverter.products).toHaveLength(1);
        expect(res.body.groupedProducts).toHaveLength(5); // all 5 categories always present, even if empty
    });

    it("returns an empty products array (not an error) when nothing is published", async () => {
        const res = await request(app).get("/api/products-page");
        expect(res.status).toBe(200);
        expect(res.body.products).toEqual([]);
        expect(res.body.manufacturers).toEqual([]);
        expect(res.body.schemaVersion).toBe("productsPage.v1");
    });
});
