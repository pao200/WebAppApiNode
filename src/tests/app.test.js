const request = require("supertest");
const app = require("../app");

describe("Pruebas generales de la API", () => {
  test("GET / debe responder con estado 200", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      statusCode: 200,
      data: {
        message: "WebApp API actualizada mediante CI/CD"
      }
    });
  });

  test("GET /api/health debe indicar que la API está funcionando", async () => {
    const response = await request(app).get("/api/health");

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      statusCode: 200,
      data: {
        status: "OK",
        message: "API funcionando correctamente mediante CI/CD 2"
      }
    });
  });
});