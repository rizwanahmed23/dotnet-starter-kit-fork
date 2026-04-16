# Local Development Setup

Steps to get the full stack (API + Admin App) running locally after cloning the repo.

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js >= 20](https://nodejs.org/) (with corepack enabled for pnpm)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL and Redis containers via Aspire)
- [pnpm](https://pnpm.io/) (`corepack enable` then `corepack prepare pnpm@latest --activate`)

## 1. Install Admin App Dependencies

The Next.js admin app uses pnpm workspaces. Dependencies are **not** checked in and must be installed before Aspire can start the app.

```bash
cd clients/admin
pnpm install
cd ../..
```

## 2. Create Admin App Environment Files

NextAuth v5 requires `AUTH_SECRET` and `NEXTAUTH_URL` to be configured. These files are gitignored and must be created manually.

### `clients/admin/.env`

```env
# Shared config -- committed to repo. Secrets go in .env.local (gitignored).

# API endpoints
FSH_API_URL=https://localhost:7030
NEXT_PUBLIC_FSH_API_URL=https://localhost:7030

# NextAuth
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# Allow self-signed certs in development
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### `clients/admin/.env.local`

```env
# Secrets only -- never commit this file.
AUTH_SECRET=your-dev-secret-key-min-32-chars-change-in-production
```

## 3. Verify Aspire User Secrets

The AppHost stores database and cache passwords in .NET user secrets. After cloning, verify they exist:

```bash
dotnet user-secrets list --project src/Playground/FSH.Starter.AppHost
```

You should see entries for `Parameters:postgres-password`, `Parameters:redis-password`, and `AppHost:*` keys. If missing, initialize them:

```bash
dotnet user-secrets set "Parameters:postgres-password" "$(openssl rand -base64 16)" --project src/Playground/FSH.Starter.AppHost
dotnet user-secrets set "Parameters:redis-password" "$(openssl rand -base64 16)" --project src/Playground/FSH.Starter.AppHost
```

## 4. Launch with Aspire

```bash
dotnet run --project src/Playground/FSH.Starter.AppHost
```

This starts:
- **PostgreSQL** container (persistent volume `fsh-postgres-data`, database `fsh`)
- **Redis** container (persistent volume `fsh-redis-data`)
- **FSH.Starter.Api** on `https://localhost:7030` / `http://localhost:5030`
- **Admin App** (Next.js) on `http://localhost:3000`

The Aspire dashboard URL with login token is printed to the console.

## 5. Default Login Credentials

| Field    | Value             |
|----------|-------------------|
| Tenant   | `root`            |
| Email    | `admin@root.com`  |
| Password | `123Pa$$word!`    |

## Known Issues on Windows

### Admin App Installer Fails to Start

Aspire's `AddJavaScriptApp()` with `.WithNpm()` or `.WithPnpm()` does not work reliably on Windows due to `.cmd` shim issues with the DCP process spawner. The fix is to use `AddExecutable()` with the full path to `node.exe`:

```csharp
var nodeExe = OperatingSystem.IsWindows()
    ? Environment.ExpandEnvironmentVariables(@"%ProgramFiles%\nodejs\node.exe")
    : "node";
builder.AddExecutable("fsh-admin", nodeExe, "../../../clients/admin",
        "node_modules/next/dist/bin/next", "dev", "-p", "3000")
```

### HTTP to HTTPS Redirect Breaks CORS

The API redirects HTTP requests to HTTPS, which causes browser CORS preflight (`OPTIONS`) requests to fail with 503. Always configure the admin app to use the **HTTPS** API endpoint (`https://localhost:7030`), not HTTP.

## API Endpoint Reference

The admin app API client must match the backend route structure:

| Concern        | Endpoint                              |
|----------------|---------------------------------------|
| Issue token    | `POST /api/v1/identity/token/issue`   |
| Refresh token  | `POST /api/v1/identity/token/refresh` |
| List tenants   | `GET /api/v1/tenants`                 |
| List users     | `GET /api/v1/identity/users/search`   |
| List roles     | `GET /api/v1/identity/roles`          |

### Tenant Header

The multitenancy header name is **`tenant`** (lowercase), not `X-Tenant`.

### Token Response Shape

The token endpoint returns `accessToken` (not `token`):

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "...",
  "accessTokenExpiresAt": "...",
  "refreshTokenExpiresAt": "..."
}
```
