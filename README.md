# SecureVault Password Manager

Full-stack password manager with AES-256 encryption, JWT authentication, and PIN-protected password reveal.

## Tech Stack

| Layer     | Technology                                               |
| --------- | -------------------------------------------------------- |
| Frontend  | React 18, Vite, Tailwind CSS, React Router, Axios        |
| Backend   | Spring Boot 3.3, Spring Security, Spring Data JPA        |
| Auth      | JWT (access + refresh tokens), BCrypt password hashing   |
| Database  | MySQL 8                                                  |
| Encryption| AES-256-GCM (javax.crypto) for vault secrets             |
| Build     | Maven (backend), npm/Vite (frontend)                     |
| Deploy    | Docker + Docker Compose                                  |

## Project Structure

```
SecureVault Password Manager/
├── securevault-backend/          # Spring Boot API
│   ├── src/main/java/com/securevault/
│   │   ├── config/               # SecurityConfig, CORS
│   │   ├── controller/           # REST controllers
│   │   ├── dto/                  # Request/Response DTOs
│   │   ├── entity/               # JPA entities
│   │   ├── exception/            # Custom exceptions & global handler
│   │   ├── repository/           # Spring Data repositories
│   │   ├── security/             # JWT service, filter, UserDetailsService
│   │   ├── service/              # Business logic
│   │   └── util/                 # AES encryption, password generator
│   ├── src/main/resources/
│   │   └── application.yml       # App configuration
│   └── pom.xml
├── securevault-frontend/         # React SPA
│   ├── src/
│   │   ├── api/                  # Axios instance + API modules
│   │   ├── components/           # Reusable UI components
│   │   ├── contexts/             # AuthContext
│   │   ├── pages/                # Route pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
├── docker-compose.yml            # Local dev with MySQL + backend + frontend
└── README.md
```

## Features

- **User auth:** Register, login, refresh tokens, forgot/reset password
- **4-digit PIN:** Required to reveal or copy stored passwords; rate-limited
- **Vault CRUD:** Create, read, update, delete credential entries
- **AES-256-GCM encryption:** Server-side encryption with per-record IV
- **Password generator:** Strong random passwords via API or client
- **Sharing:** Share vault items with other registered users
- **Audit log:** Tracks CREATED, VIEWED, COPIED, MODIFIED, SHARED, DELETED
- **Rate limiting:** In-memory rate limiter on login and PIN attempts
- **Search:** Full-text search across vault items

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint              | Description                     |
| ------ | --------------------- | ------------------------------- |
| POST   | `/register`           | Register new user               |
| POST   | `/login`              | Login, returns JWT pair         |
| POST   | `/refresh`            | Refresh access token            |
| POST   | `/verify-pin`         | Verify 4-digit PIN              |
| POST   | `/change-password`    | Change account password         |
| POST   | `/forgot-password`    | Send password reset token       |
| POST   | `/reset-password`     | Reset password with token       |

### Vault (`/api/vault`)
| Method | Endpoint                   | Description                   |
| ------ | -------------------------- | ----------------------------- |
| GET    | `/`                        | List vault items (?search=)   |
| POST   | `/`                        | Create vault item             |
| GET    | `/{id}`                    | Get vault item                |
| PUT    | `/{id}`                    | Update vault item             |
| DELETE | `/{id}`                    | Delete vault item             |
| POST   | `/{id}/reveal`             | Decrypt & return password     |
| POST   | `/{id}/copy`               | Log copy action               |
| POST   | `/{id}/share`              | Share with another user       |
| GET    | `/generate-password`       | Generate strong password      |

### User (`/api/users`)
| Method | Endpoint   | Description         |
| ------ | ---------- | ------------------- |
| GET    | `/me`      | Get current profile |
| PUT    | `/me`      | Update profile      |

### Audit (`/api/audit`)
| Method | Endpoint            | Description              |
| ------ | ------------------- | ------------------------ |
| GET    | `/`                 | List user's audit logs   |
| GET    | `/item/{vaultId}`   | Logs for specific item   |

## Quick Start

### Prerequisites
- Java 17+
- Node.js 20+
- MySQL 8 (or Docker)
- Maven

### Local Development

**1. Start MySQL:**
```bash
docker run -d --name securevault-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=securevault \
  -p 3306:3306 mysql:8.0
```

**2. Start Backend:**
```bash
cd securevault-backend
mvn spring-boot:run
```
The API will be available at `http://localhost:8080`.

**3. Start Frontend:**
```bash
cd securevault-frontend
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

### Docker Compose (All-in-One)
```bash
docker-compose up -d
```
This starts MySQL, backend (8080), and frontend (5173).

## Environment Variables

| Variable               | Description                        | Default                                        |
| ---------------------- | -----------------------------------| ---------------------------------------------- |
| `DB_URL`               | MySQL JDBC URL                     | `jdbc:mysql://localhost:3306/securevault`       |
| `DB_USER`              | MySQL username                     | `root`                                          |
| `DB_PASSWORD`          | MySQL password                     | `password`                                      |
| `JWT_SECRET`           | HMAC-SHA256 signing key (base64)   | (dev default in application.yml)                |
| `VAULT_ENCRYPTION_KEY` | AES-256 key (32 bytes, base64)     | (dev default in application.yml)                |
| `FRONTEND_URL`         | CORS allowed origin                | `http://localhost:5173`                         |
| `MAIL_HOST`            | SMTP host (for password reset)     | `smtp.gmail.com`                                |
| `MAIL_USERNAME`        | SMTP username                      | —                                               |
| `MAIL_PASSWORD`        | SMTP password                      | —                                               |

## Security

- BCrypt hashing for account password and PIN
- AES-256-GCM encryption for vault secrets (key never logged/stored)
- JWT signed with HMAC-SHA256 (access: 15 min, refresh: 7 days)
- HTTPS required in production
- CORS locked to frontend origin
- Rate limiting on login (5 attempts / 15 min) and PIN (5 attempts / 15 min)
- `.env` files excluded via `.gitignore`

## Deployment

- **Backend:** Containerize with provided Dockerfile, deploy to Railway/Render/AWS
- **Frontend:** Deploy to Vercel/Netlify, set `VITE_API_BASE_URL` to backend URL
- **Database:** Managed MySQL (PlanetScale, AWS RDS, Railway)

## License

MIT
