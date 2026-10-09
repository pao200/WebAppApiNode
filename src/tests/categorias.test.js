const express = require("express");
const request = require("supertest");

jest.mock("../database", () => ({
  all: jest.fn(),
  run: jest.fn()
}));

const db = require("../database");
const categoriasRoutes = require("../routes/categorias.routes");

const app = express();

app.use(express.json());
app.use("/api/categorias", categoriasRoutes);

describe("Pruebas de endpoints de categorías", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/categorias debe devolver las categorías y estado 200", async () => {

    const categorias = [
      {
        id: 1,
        nombre: "Pestañas"
      },
      {
        id: 2,
        nombre: "Accesorios"
      }
    ];

    db.all.mockImplementation((sql, params, callback) => {
      callback(null, categorias);
    });

    const response = await request(app)
      .get("/api/categorias");

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      statusCode: 200,
      data: categorias
    });
  });

  test("GET /api/categorias debe devolver 500 si falla la base de datos", async () => {

    db.all.mockImplementation((sql, params, callback) => {
      callback(
        new Error("Base de datos no disponible")
      );
    });

    const response = await request(app)
      .get("/api/categorias");

    expect(response.statusCode).toBe(500);

    expect(response.body).toEqual({
      statusCode: 500,
      data: [],
      error: "Base de datos no disponible"
    });
  });

  test("POST /api/categorias debe crear una categoría y devolver 201", async () => {

    db.run.mockImplementation(
      (sql, params, callback) => {
        callback.call(
          {
            lastID: 10
          },
          null
        );
      }
    );

    const response = await request(app)
      .post("/api/categorias")
      .send({
        nombre: "Pestañas"
      });

    expect(response.statusCode).toBe(201);

    expect(response.body).toEqual({
      statusCode: 201,
      data: {
        id: 10,
        nombre: "Pestañas"
      }
    });
  });

  test("POST /api/categorias debe devolver 400 si falta el nombre", async () => {

    const response = await request(app)
      .post("/api/categorias")
      .send({});

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
      statusCode: 400,
      data: [],
      error: "El nombre es obligatorio"
    });

    expect(db.run).not.toHaveBeenCalled();
  });

  test("POST /api/categorias debe devolver 500 si SQLite genera un error", async () => {

    db.run.mockImplementation(
      (sql, params, callback) => {
        callback(
          new Error(
            "SQLITE_CONSTRAINT: UNIQUE constraint failed"
          )
        );
      }
    );

    const response = await request(app)
      .post("/api/categorias")
      .send({
        nombre: "Pestañas"
      });

    expect(response.statusCode).toBe(500);

    expect(response.body.statusCode).toBe(500);

    expect(response.body.error).toContain(
      "SQLITE_CONSTRAINT"
    );
  });

  test("DELETE /api/categorias/:id debe eliminar una categoría y devolver 200", async () => {

    db.run.mockImplementation(
      (sql, params, callback) => {
        callback.call(
          {
            changes: 1
          },
          null
        );
      }
    );

    const response = await request(app)
      .delete("/api/categorias/3");

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      statusCode: 200,
      data: {
        message:
          "Categoría eliminada correctamente"
      }
    });
  });

  test("DELETE /api/categorias/:id debe devolver 500 si falla la base de datos", async () => {

    db.run.mockImplementation(
      (sql, params, callback) => {
        callback(
          new Error("Error al eliminar categoría")
        );
      }
    );

    const response = await request(app)
      .delete("/api/categorias/3");

    expect(response.statusCode).toBe(500);

    expect(response.body).toEqual({
      statusCode: 500,
      data: [],
      error: "Error al eliminar categoría"
    });
  });

});