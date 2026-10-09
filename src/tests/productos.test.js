const express = require("express");
const request = require("supertest");

jest.mock("../database", () => ({
  all: jest.fn(),
  get: jest.fn(),
  run: jest.fn()
}));

const db = require("../database");
const productosRoutes = require("../routes/productos.routes");

const app = express();

app.use(express.json());
app.use("/api/productos", productosRoutes);

describe("Pruebas de endpoints de productos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(
    "GET /api/productos debe devolver productos y estado 200",
    async () => {
      const productos = [
        {
          id: 1,
          nombre: "Pestañas volumen",
          precio: 500,
          stock: 5,
          categoria_id: 3,
          categoria: "Pestañas"
        }
      ];

      db.all.mockImplementation(
        (sql, params, callback) => {
          callback(null, productos);
        }
      );

      const response = await request(app)
        .get("/api/productos");

      expect(response.statusCode).toBe(200);

      expect(response.body).toEqual({
        statusCode: 200,
        data: productos
      });
    }
  );

  test(
    "GET /api/productos debe devolver 500 si falla la base de datos",
    async () => {
      db.all.mockImplementation(
        (sql, params, callback) => {
          callback(
            new Error("Base de datos no disponible")
          );
        }
      );

      const response = await request(app)
        .get("/api/productos");

      expect(response.statusCode).toBe(500);

      expect(response.body).toEqual({
        statusCode: 500,
        data: [],
        error: "Base de datos no disponible"
      });
    }
  );

  test(
    "GET /api/productos/:id debe devolver un producto y estado 200",
    async () => {
      const producto = {
        id: 2,
        nombre: "Pestañas híbridas",
        precio: 450,
        stock: 8,
        categoria_id: 3,
        categoria: "Pestañas"
      };

      db.get.mockImplementation(
        (sql, params, callback) => {
          callback(null, producto);
        }
      );

      const response = await request(app)
        .get("/api/productos/2");

      expect(response.statusCode).toBe(200);

      expect(response.body).toEqual({
        statusCode: 200,
        data: producto
      });
    }
  );

  test(
    "GET /api/productos/:id debe devolver 404 si el producto no existe",
    async () => {
      db.get.mockImplementation(
        (sql, params, callback) => {
          callback(null, undefined);
        }
      );

      const response = await request(app)
        .get("/api/productos/999");

      expect(response.statusCode).toBe(404);

      expect(response.body).toEqual({
        statusCode: 404,
        data: [],
        error: "Producto no encontrado"
      });
    }
  );

  test(
    "GET /api/productos/:id debe devolver 500 si falla la base de datos",
    async () => {
      db.get.mockImplementation(
        (sql, params, callback) => {
          callback(
            new Error("Error al consultar producto")
          );
        }
      );

      const response = await request(app)
        .get("/api/productos/2");

      expect(response.statusCode).toBe(500);

      expect(response.body).toEqual({
        statusCode: 500,
        data: [],
        error: "Error al consultar producto"
      });
    }
  );

  test(
    "POST /api/productos debe crear un producto y devolver 201",
    async () => {
      db.run.mockImplementation(
        (sql, params, callback) => {
          callback.call(
            {
              lastID: 20
            },
            null
          );
        }
      );

      const nuevoProducto = {
        nombre: "Pestañas clásica",
        precio: 350,
        stock: 10,
        categoria_id: 3
      };

      const response = await request(app)
        .post("/api/productos")
        .send(nuevoProducto);

      expect(response.statusCode).toBe(201);

      expect(response.body).toEqual({
        statusCode: 201,
        data: {
          id: 20,
          ...nuevoProducto
        }
      });
    }
  );

  test(
    "POST /api/productos debe devolver 400 si faltan campos",
    async () => {
      const response = await request(app)
        .post("/api/productos")
        .send({
          nombre: "Pestañas clásica",
          precio: 350
        });

      expect(response.statusCode).toBe(400);

      expect(response.body).toEqual({
        statusCode: 400,
        data: [],
        error: "Todos los campos son obligatorios"
      });

      expect(db.run).not.toHaveBeenCalled();
    }
  );

  test(
    "POST /api/productos debe devolver 500 si SQLite genera un error",
    async () => {
      db.run.mockImplementation(
        (sql, params, callback) => {
          callback(
            new Error(
              "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed"
            )
          );
        }
      );

      const response = await request(app)
        .post("/api/productos")
        .send({
          nombre: "Producto prueba",
          precio: 400,
          stock: 5,
          categoria_id: 999
        });

      expect(response.statusCode).toBe(500);

      expect(response.body.statusCode).toBe(500);

      expect(response.body.error).toContain(
        "SQLITE_CONSTRAINT"
      );
    }
  );

  test(
    "PUT /api/productos/:id debe actualizar un producto y devolver 200",
    async () => {
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

      const productoActualizado = {
        nombre: "Pestañas volumen premium",
        precio: 600,
        stock: 7,
        categoria_id: 3
      };

      const response = await request(app)
        .put("/api/productos/2")
        .send(productoActualizado);

      expect(response.statusCode).toBe(200);

      expect(response.body).toEqual({
        statusCode: 200,
        data: {
          id: 2,
          ...productoActualizado
        }
      });
    }
  );

  test(
    "PUT /api/productos/:id debe devolver 400 si faltan campos",
    async () => {
      const response = await request(app)
        .put("/api/productos/2")
        .send({
          nombre: "Pestañas volumen"
        });

      expect(response.statusCode).toBe(400);

      expect(response.body).toEqual({
        statusCode: 400,
        data: [],
        error: "Todos los campos son obligatorios"
      });

      expect(db.run).not.toHaveBeenCalled();
    }
  );

  test(
    "PUT /api/productos/:id debe devolver 404 si el producto no existe",
    async () => {
      db.run.mockImplementation(
        (sql, params, callback) => {
          callback.call(
            {
              changes: 0
            },
            null
          );
        }
      );

      const response = await request(app)
        .put("/api/productos/999")
        .send({
          nombre: "Producto inexistente",
          precio: 500,
          stock: 5,
          categoria_id: 3
        });

      expect(response.statusCode).toBe(404);

      expect(response.body).toEqual({
        statusCode: 404,
        data: [],
        error: "Producto no encontrado"
      });
    }
  );

  test(
    "PUT /api/productos/:id debe devolver 500 si falla la base de datos",
    async () => {
      db.run.mockImplementation(
        (sql, params, callback) => {
          callback(
            new Error("Error al actualizar producto")
          );
        }
      );

      const response = await request(app)
        .put("/api/productos/2")
        .send({
          nombre: "Pestañas volumen",
          precio: 500,
          stock: 5,
          categoria_id: 3
        });

      expect(response.statusCode).toBe(500);

      expect(response.body).toEqual({
        statusCode: 500,
        data: [],
        error: "Error al actualizar producto"
      });
    }
  );

  test(
    "DELETE /api/productos/:id debe eliminar un producto y devolver 200",
    async () => {
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
        .delete("/api/productos/2");

      expect(response.statusCode).toBe(200);

      expect(response.body).toEqual({
        statusCode: 200,
        data: {
          message:
            "Producto eliminado correctamente"
        }
      });
    }
  );

  test(
    "DELETE /api/productos/:id debe devolver 404 si el producto no existe",
    async () => {
      db.run.mockImplementation(
        (sql, params, callback) => {
          callback.call(
            {
              changes: 0
            },
            null
          );
        }
      );

      const response = await request(app)
        .delete("/api/productos/999");

      expect(response.statusCode).toBe(404);

      expect(response.body).toEqual({
        statusCode: 404,
        data: [],
        error: "Producto no encontrado"
      });
    }
  );

  test(
    "DELETE /api/productos/:id debe devolver 500 si falla la base de datos",
    async () => {
      db.run.mockImplementation(
        (sql, params, callback) => {
          callback(
            new Error("Error al eliminar producto")
          );
        }
      );

      const response = await request(app)
        .delete("/api/productos/2");

      expect(response.statusCode).toBe(500);

      expect(response.body).toEqual({
        statusCode: 500,
        data: [],
        error: "Error al eliminar producto"
      });
    }
  );
});