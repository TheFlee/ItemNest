# ItemNest

A full-stack lost-and-found platform where users can post lost or found items, contact each other, and track matches automatically.

---

## Features

- Register / login with email or Google OAuth
- Create lost and found posts with up to 5 images (stored on AWS S3)
- Automatic matching engine — links lost and found posts for the same item
- Favorites — save posts for later
- Contact requests — send, accept, reject, cancel
- Reports — report suspicious posts
- Admin panel — manage users, posts, and reports
- Bilingual UI — English and Azerbaijani
- Role-based access control (User / Admin)

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Backend    | ASP.NET Core 9, EF Core 9, SQL Server           |
| Auth       | JWT, ASP.NET Identity, Google OAuth             |
| Storage    | AWS S3 (AWSSDK.S3)                              |
| Frontend   | React 19, Vite, TypeScript, Tailwind CSS        |
| i18n       | react-i18next (English + Azerbaijani)           |
| Validation | FluentValidation                                |
| Mapping    | AutoMapper                                      |
| Testing    | xUnit, FluentAssertions, EF In-Memory           |

---

## Project Structure

```
ItemNest/
├── ItemNest.Api/               # ASP.NET Core Web API + React frontend
│   └── itemnest-front/         # Vite + React + TypeScript
├── ItemNest.Application/       # DTOs, interfaces, validators, mappings
├── ItemNest.Domain/            # Entities, enums
├── ItemNest.Infrastructure/    # EF Core DbContext, services, seeders
└── ItemNest.Tests/             # xUnit unit tests
```

---

## Setup

### Prerequisites
- .NET 9 SDK
- Node.js 18+
- SQL Server (LocalDB works fine)
- AWS S3 bucket (with public read access on uploaded objects)

### 1. Backend

**Configure `appsettings.json`** in `ItemNest.Api/`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=ItemNestDb;..."
  },
  "Jwt": {
    "Key": "your-jwt-secret-key",
    "Issuer": "ItemNestAPI",
    "Audience": "ItemNestClient",
    "ExpiryMinutes": 60
  },
  "GoogleAuth": {
    "ClientId": "your-google-client-id"
  },
  "Aws": {
    "AccessKeyId": "your-aws-access-key-id",
    "SecretAccessKey": "your-aws-secret-access-key",
    "Region": "us-east-1",
    "BucketName": "your-s3-bucket-name"
  }
}
```

**Apply migrations and run:**

```bash
cd ItemNest.Api
dotnet ef database update
dotnet run
```

The API will be available at `https://localhost:7212`.  
Swagger UI: `https://localhost:7212/swagger`

On first run in Development mode, the following seed data is created automatically:
- Admin user
- Test categories, users, posts, contact requests, and reports

### 2. Frontend

```bash
cd ItemNest.Api/itemnest-front
cp .env.example .env
# Edit .env if your API runs on a different port
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Default Admin Account

| Field    | Value                  |
|----------|------------------------|
| Email    | admin@itemnest.com     |
| Password | Admin123!              |

---

## Running Tests

```bash
cd ItemNest.Tests
dotnet test
```
