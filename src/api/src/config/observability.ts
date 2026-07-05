import winston from "winston";

export enum LogLevel {
    Error = "error",
    Warning = "warn",
    Information = "info",
    Verbose = "verbose",
    Debug = "debug",
}

export const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { app: "API" },
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: "exceptions.log" }),
    ]
});

if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}
