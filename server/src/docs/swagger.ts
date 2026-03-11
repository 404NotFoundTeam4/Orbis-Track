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
  app.get("/docs.json", (_req, res) => {
    const doc = generator.generateDocument({
      openapi: "3.1.0",
      info: { title: "Orbis Track API", version: "1.0.0" },
      // Use relative path or env API_URL passed from app.ts
      // This forces the browser to use the domain it is currently on, bypassing any Nginx header missing issues.
      servers: [{ url: baseUrl }],
    });

    res.json(doc);
  });

  // หน้า Swagger UI พร้อม options ที่ปรับแต่งแล้ว
  // ใช้ url: "/docs.json" แทนการ embed spec ใน HTML โดยตรง
  // เพื่อให้ SwaggerUI fetch spec แบบ dynamic ทุกครั้งที่โหลดหน้า
  // → แก้ปัญหา server URL ผิดเมื่อ API_URL เปลี่ยนแต่ HTML ถูก cache
  app.use(
    "/api/v1/swagger",
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: "/docs.json",
        persistAuthorization: true,
        tryItOutEnabled: true,
        displayRequestDuration: true,
      },
    }),
  );
}
