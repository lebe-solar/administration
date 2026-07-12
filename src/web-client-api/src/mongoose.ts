import mongoose from "mongoose";

export async function configureMongoose(connectionString: string, databaseName: string): Promise<void> {
    mongoose.set("toJSON", {
        virtuals: true,
        versionKey: false,
        transform: (_doc, converted: Record<string, unknown>) => {
            converted.id = converted._id;
            delete converted._id;
        },
    });

    await mongoose.connect(connectionString, { dbName: databaseName });
}
