const express = require("express");
const router = express.Router();
const db = require("../database");

const fs = require("fs");
const path = require("path");

// POST - Crear backup de la base de datos
router.post("/backup", (req, res) => {
  const databasePath = path.join(
    __dirname,
    "..",
    "..",
    "database",
    "webapp.db"
  );

  const backupPath = path.join(
    __dirname,
    "..",
    "..",
    "database",
    `backup-${Date.now()}.db`
  );

  fs.copyFile(databasePath, backupPath, (err) => {
    if (err) {
      return res.status(500).json({
        statusCode: 500,
        data: [],
        error: err.message
      });
    }

    res.status(200).json({
      statusCode: 200,
      data: {
        message: "Backup creado correctamente",
        archivo: path.basename(backupPath)
      }
    });
  });
});

// GET - Crear y descargar backup
router.get("/backup/descargar", (req, res) => {
  const databasePath = path.join(
    __dirname,
    "..",
    "..",
    "database",
    "webapp.db"
  );

  const nombreBackup = `backup-${Date.now()}.db`;

  const backupPath = path.join(
    __dirname,
    "..",
    "..",
    "database",
    nombreBackup
  );

  if (!fs.existsSync(databasePath)) {
    return res.status(404).json({
      statusCode: 404,
      data: [],
      error: "No se encontró la base de datos"
    });
  }

  fs.copyFile(databasePath, backupPath, (err) => {
    if (err) {
      return res.status(500).json({
        statusCode: 500,
        data: [],
        error: err.message
      });
    }

    res.download(backupPath, nombreBackup, (err) => {
      if (err) {
        console.error("Error al descargar backup:", err);
      }
    });
  });
});

// DELETE - Vaciar la base de datos
router.delete("/vaciar", (req, res) => {
  db.serialize(() => {
    db.run("DELETE FROM productos", (err) => {
      if (err) {
        return res.status(500).json({
          statusCode: 500,
          data: [],
          error: err.message
        });
      }

      db.run("DELETE FROM categorias", (err) => {
        if (err) {
          return res.status(500).json({
            statusCode: 500,
            data: [],
            error: err.message
          });
        }

        res.status(200).json({
          statusCode: 200,
          data: {
            message: "Base de datos vaciada correctamente"
          }
        });
      });
    });
  });
});

// GET - Resumen de la base de datos
router.get("/resumen", (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM categorias) AS categorias,
      (SELECT COUNT(*) FROM productos) AS productos
  `;

  db.get(sql, [], (err, row) => {
    if (err) {
      return res.status(500).json({
        statusCode: 500,
        data: [],
        error: err.message
      });
    }

    res.status(200).json({
      statusCode: 200,
      data: row
    });
  });
});

module.exports = router;