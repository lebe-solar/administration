import mongoose, { Schema } from "mongoose";

export type Manufacturer = {
    id: string
    name: string
    description?: string
    logo?: string | null
    link?: string
}

const schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    logo: {
        type: String,
        default: null,
    },
    link: {
        type: String,
        default: "",
    },
});

export const ManufacturerModel = mongoose.model<Manufacturer>("Manufacturer", schema, "Manufacturers");
