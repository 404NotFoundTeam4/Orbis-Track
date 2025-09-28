import swaggerUi from "swagger-ui-express";
import { z } from "zod";
import {
    OpenAPIRegistry,
    OpenApiGeneratorV31,
    extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import type { Express } from "express";

// ต่อให้ Zod รู้จัก OpenAPI (ไว้ generate schema จาก zod object)
extendZodWithOpenApi(z);


// ตัวลงทะเบียน schema/paths ทั้งโปรเจกต์
export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "BearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

/**
 * Description: ตั้งค่า Swagger/OpenAPI ให้ Express ด้วย zod-to-openapi + swagger-ui
 * Input : app (Express), baseUrl (เช่น http://localhost:4044 ใช้ขึ้นหน้าเอกสาร)
 * Output : เส้นทาง /docs.json (สเปคดิบ) และ /api/v1/swagger (หน้า UI)
 * Author : Pakkapon Chomchoey (Tonnam) 66160080
 */
export function swagger(app: Express, baseUrl: string) {
    const generator = new OpenApiGeneratorV31(registry.definitions);
    const doc = generator.generateDocument({
        openapi: "3.1.0",
        info: { title: "Orbis Track API", version: "1.0.0" },
        servers: [{ url: baseUrl }],
    });

    // doc.security = [{ BearerAuth: [] }];

    app.get("/docs.json", (_req, res) => res.json(doc));

    // หน้า Swagger UI พร้อมจำ token ไว้หลังรีเฟรช
    app.use("/api/v1/swagger", swaggerUi.serve, swaggerUi.setup(doc, {
        swaggerOptions: { persistAuthorization: true }
    }));
}
