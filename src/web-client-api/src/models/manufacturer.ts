import mongoose, { Schema } from "mongoose";

// Read-only mirror of src/api/src/models/manufacturer.ts — see product.ts for why this is
// duplicated rather than imported.
export type Manufacturer = {
    id: string
    name: string
    description?: string
    logo?: string | null
    link?: string
}

const schema = new Schema({
    name: { type: String },
    description: { type: String },
    logo: { type: String },
    link: { type: String },
});

export const ManufacturerModel = mongoose.model<Manufacturer>("Manufacturer", schema, "Manufacturers");
