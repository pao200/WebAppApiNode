const express = require("express");
const request = require("supertest");

jest.mock("../database", () => ({
  serialize: jest.fn(),
  run: jest.fn(),
  get: jest.fn()
}));

jest.mock("fs", () => ({
  copyFile: jest.fn(),
  existsSync: jest.fn()
}));

const db = require("../database");
const fs = require("fs");
const adminRoutes = require("../routes/admin.routes");

const app = express();

app.use(express.json());
app.use("/api/admin", adminRoutes);

describe("Pruebas de endpoints administrativos", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    db.serialize.mockImplementation((callback) => {
      callback();
    });
  });

  test(
    "POST /api/admin/backup debe crear un backup y devolver 200",
    async () => {
      fs.copyFile.mockImplementation(
        (origen, destino, callback) => {
          callback(null);
        }
      );

      const response = await request(app)
        .post("/api/admin/backup");

      expect(response.statusCode).toBe(200);

      expect(response.body.statusCode).toBe(200);

      expect(response.body.data.message).toBe(
        "Backup creado correctamente"
      );

      expect(response.body.data.archivo).toContain(
        "backup-"
      );

      expect(response.body.data.archivo).toContain(
        ".db"
      );
    }
  );

  test(
    "POST /api/admin/backup debe devolver 500 si falla la copia del archivo",
    async () => {
      fs.copyFile.mockImplementation(
        (origen, destino, callback) => {
          callback(
            new Error("Error al copiar base de datos")
          );
        }
      );

      const response = await request(app)
        .post("/api/admin/backup");

      expect(response.statusCode).toBe(500);

      expect(response.body).toEqual({
        statusCode: 500,
        data: [],
        error: "Error al copiar base de datos"
      });
    }
  );

  test(
    "GET /api/admin/resumen debe devolver el resumen y estado 200",
    async () => {
      const resumen = {
        categorias: 3,
        productos: 10
      };

      db.get.mockImplementation(
        (sql, params, callback) => {
          callback(null, resumen);
        }
      );

      const response = await request(app)
        .get("/api/admin/resumen");

      expect(response.statusCode).toBe(200);

      expect(response.body).toEqual({
        statusCode: 200,
        data: resumen
      });
    }
  );

  test(
    "GET /api/admin/resumen debe devolver 500 si falla la base de datos",
    async () => {
      db.get.mockImplementation(
        (sql, params, callback) => {
          callback(
            new Error("Base de datos no disponible")
          );
        }
      );

      const response = await request(app)
        .get("/api/admin/resumen");

      expect(response.statusCode).toBe(500);

      expect(response.body).toEqual({
        statusCode: 500,
        data: [],
        error: "Base de datos no disponible"
      });
    }
  );

  test(
    "DELETE /api/admin/vaciar debe vaciar productos y categorías y devolver 200",
    async () => {
      db.run
        .mockImplementationOnce(
          (sql, callback) => {
            callback(null);
          }
        )
        .mockImplementationOnce(
          (sql, callback) => {
            callback(null);
          }
        );

      const response = await request(app)
        .delete("/api/admin/vaciar");

      expect(response.statusCode).toBe(200);

      expect(response.body).toEqual({
        statusCode: 200,
        data: {
          message:
            "Base de datos vaciada correctamente"
        }
      });

      expect(db.run).toHaveBeenCalledTimes(2);
    }
  );

  test(
    "DELETE /api/admin/vaciar debe devolver 500 si falla al eliminar productos",
    async () => {
      db.run.mockImplementationOnce(
        (sql, callback) => {
          callback(
            new Error("Error al eliminar productos")
          );
        }
      );

      const response = await request(app)
        .delete("/api/admin/vaciar");

      expect(response.statusCode).toBe(500);

      expect(response.body).toEqual({
        statusCode: 500,
        data: [],
        error: "Error al eliminar productos"
      });
    }
  );

  test(
    "DELETE /api/admin/vaciar debe devolver 500 si falla al eliminar categorías",
    async () => {
      db.run
        .mockImplementationOnce(
          (sql, callback) => {
            callback(null);
          }
        )
        .mockImplementationOnce(
          (sql, callback) => {
            callback(
              new Error(
                "Error al eliminar categorías"
              )
            );
          }
        );

      const response = await request(app)
        .delete("/api/admin/vaciar");

      expect(response.statusCode).toBe(500);

      expect(response.body).toEqual({
        statusCode: 500,
        data: [],
        error: "Error al eliminar categorías"
      });
    }
  );
});