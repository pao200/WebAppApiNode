# WebApp API Node - Pipeline CI/CD

Proyecto integrador que implementa un proceso de integración y despliegue continuo para una API REST desarrollada con Node.js y Express.

El proyecto automatiza la ejecución de pruebas, generación de cobertura, construcción de una imagen Docker, publicación en Docker Hub y despliegue automático en una instancia de AWS EC2 mediante GitHub Actions.

---

## Arquitectura del proyecto

El flujo general del proyecto es el siguiente:

```text
Desarrollador
     |
     | git push
     v
GitHub
     |
     v
GitHub Actions
     |
     |-- 1. Pruebas con Jest y Supertest
     |-- 2. Validación de cobertura
     |-- 3. Construcción de imagen Docker
     |-- 4. Publicación en Docker Hub
     |-- 5. Conexión SSH con AWS EC2
     |
     v
Docker Hub
     |
     v
AWS EC2
     |
     v
API REST pública