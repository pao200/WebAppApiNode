const express = require("express");

const categoriasRoutes = require("./routes/categorias.routes");
const productosRoutes = require("./routes/productos.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Ruta principal
app.get("/", (req, res) => {
  res.status(200).json({
    statusCode: 200,
    data: {
      message: "WebApp API actualizada mediante CI/CD"
    }
  });
});


app.get("/api/health", (req, res) => {
  res.status(200).json({
    statusCode: 200,
    data: {
      status: "OK",
      message: "API funcionando correctamente mediante CI/CD 2"
    }
  });
});

// Rutas de la API
app.use("/api/categorias", categoriasRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/admin", adminRoutes);

// Iniciar servidor únicamente cuando app.js se ejecuta directamente
if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Servidor HTTP ejecutándose en puerto ${PORT}`
    );
  });
}

module.exports = app;