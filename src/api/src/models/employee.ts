import mongoose, { Schema } from "mongoose";

// Stand-in for the company's GraphQL employee directory (not available in this
// environment). Backed by the same Mongo/Cosmos database so the rest of the app's
// data-access patterns stay consistent; swap the routes/employees.ts implementation
// for a real GraphQL client without touching callers once that API exists.
export type Employee = {
    id: string
    name: string
    email: string
    role: string
    active: boolean
}

const schema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: "" },
    active: { type: Boolean, default: true },
});

export const EmployeeModel = mongoose.model<Employee>("Employee", schema, "Employees");
