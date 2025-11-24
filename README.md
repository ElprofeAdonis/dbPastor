# dbPastor
aplicacion movil

# API con Autenticación JWT – Documentación

Este proyecto implementa una API en Node.js con autenticación basada en **JSON Web Tokens (JWT)**.  
Incluye rutas públicas y rutas protegidas que requieren un token válido para acceder.

---

## 🛠 Tecnologías utilizadas
- **Node.js**
- **Express**
- **MySQL** o cualquier base de datos configurada
- **jsonwebtoken**
- **bcryptjs**
- **dotenv**
- **cors**

---

## 📂 Estructura del proyecto



## apd@MacBook-Pro-de-APD dbPastor % npm run prisma:generate

> apivisitas@1.0.0 prisma:generate
> npx prisma generate

Loaded Prisma config from prisma.config.ts.

Prisma config detected, skipping environment variable loading.
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.19.0) to ./node_modules/@prisma/client in 63ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Want to turn off tips and other hints? https://pris.ly/tip-4-nohints

## apd@MacBook-Pro-de-APD dbPastor % npm run prisma:migrate

> apivisitas@1.0.0 prisma:migrate
> npx prisma migrate dev --name init_union_fiel

Loaded Prisma config from prisma.config.ts.

Prisma config detected, skipping environment variable loading.
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "dbApd", schema "public" at "localhost:5432"

Applying migration `20251123234426_init`

The following migration(s) have been applied:

migrations/
  └─ 20251123234426_init/
    └─ migration.sql

⚠️  Warnings for the current datasource:

  • A unique constraint covering the columns `[codigo]` on the table `Iglesia` will be added. If there are existing duplicate values, this will fail.
  • A unique constraint covering the columns `[usuarioId]` on the table `Miembro` will be added. If there are existing duplicate values, this will fail.
  • A unique constraint covering the columns `[codigoMiembro]` on the table `Miembro` will be added. If there are existing duplicate values, this will fail.
  • A unique constraint covering the columns `[usuarioId]` on the table `Pastor` will be added. If there are existing duplicate values, this will fail.
  • A unique constraint covering the columns `[tokenAutoregistro]` on the table `Pastor` will be added. If there are existing duplicate values, this will fail.
  • A unique constraint covering the columns `[telefono]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  • A unique constraint covering the columns `[codigoUnico]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

✔ Are you sure you want to create and apply this migration? … yes
Applying migration `20251124160410_init_union_fiel`


The following migration(s) have been created and applied from new schema changes:

prisma/migrations/
  └─ 20251124160410_init_union_fiel/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (v6.19.0) to ./node_modules/@prisma/client in 56ms

---

## 🔑 Generación de Token (Login)
Para obtener un token JWT, debes hacer una petición POST a tu ruta de login:

### **POST /login**
## http://localhost:3000/api/auth/login
**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "123456"
}

{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

## 🔒 Cómo acceder a rutas protegidas

Debes enviar el token en el header Authorization:

Authorization: Bearer TU_TOKEN_AQUI

{
  "ok": true,
  "message": "Acceso concedido",
  "usuario": {
    "id": 3,
    "rol": "Miembro",
    "referenciaId": 1
  }
}
