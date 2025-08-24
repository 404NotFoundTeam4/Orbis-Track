import swaggerUi from "swagger-ui-express";
import { z } from "zod";
import {
    OpenAPIRegistry,
    OpenApiGeneratorV31,
    extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import type { Express } from "express";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "BearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

export function swagger(app: Express, baseUrl: string) {
    const generator = new OpenApiGeneratorV31(registry.definitions);
    const doc = generator.generateDocument({
        openapi: "3.1.0",
        info: { title: "Orbis Track API", version: "1.0.0" },
        servers: [{ url: baseUrl }],
    });

    // doc.security = [{ BearerAuth: [] }];

    app.get("/docs.json", (_req, res) => res.json(doc));
    app.use("/api/v1/swagger", swaggerUi.serve, swaggerUi.setup(doc, {
        swaggerOptions: { persistAuthorization: true }
    }));
}
