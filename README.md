# Registry — student records

A small, deliberate student register. React (Vite) on the front, Spring Boot 3 +
JPA on the back, MySQL in production and H2 on a laptop. Deploys to AWS with a
single `docker compose up`.

```
student-registry/
├── backend/          Spring Boot 3.3 · Java 21 · JPA · Bean Validation
├── frontend/         React 18 · Vite 5 · hand-written CSS (no UI kit)
├── deploy/aws.md     EC2 / S3 / CloudFront / RDS walkthrough
├── docker-compose.yml
└── .env.example
```

## Run it locally

**Backend** (needs Java 21; Maven optional — `./mvnw` is included):

```bash
cd backend
./mvnw spring-boot:run          # http://localhost:8080
```

Uses an H2 file database at `backend/data/registry.mv.db`. Nothing to install,
data survives restarts. The H2 console is at `/h2-console` (JDBC URL
`jdbc:h2:file:./data/registry`, user `sa`, empty password).

**Frontend:**

```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

Vite proxies `/api` to `localhost:8080`, so the browser never sees CORS in dev.
If the API isn't running, the UI says so and falls back to a local sandbox so you
can still click around — it never silently pretends to be the database.

**Or run the whole stack:**

```bash
cp .env.example .env
docker compose up -d --build    # http://localhost
```

## Data model

| Field | Column | Rules |
| --- | --- | --- |
| Student name | `full_name` | required, 2–120 chars, letters/spaces/`.'-` |
| Student ID | `student_id` | required, **unique**, 3–40 chars, `A-Z 0-9 -` |
| Roll number | `roll_no` | required, 1–40 chars, `A-Z 0-9 - /` |
| Phone number | `phone` | required, 8–15 digits, optional leading `+` |
| Email (Gmail) | `email` | required, **unique**, valid address, stored lowercase |

Phone numbers are normalised on write (`+91 98765 43210` → `+919876543210`) and
formatted again for display.

## API

Base path `/api/students`.

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/students` | Sorted by name. `?q=anita` searches every column. |
| `GET` | `/api/students/{id}` | `404` if missing |
| `POST` | `/api/students` | `201` + `Location` header |
| `PUT` | `/api/students/{id}` | Full replace |
| `DELETE` | `/api/students/{id}` | `204` |
| `GET` | `/api/students/stats` | `{ total, addedThisWeek }` |
| `GET` | `/actuator/health` | Health probe |

Errors share one shape, and field-level messages are what the form renders:

```json
{
  "timestamp": "2026-10-28T10:39:43Z",
  "status": 409,
  "message": "Student ID STU-2024-001 is already registered",
  "fieldErrors": { "studentId": "Student ID STU-2024-001 is already registered" }
}
```

Status codes: `400` validation, `404` not found, `409` duplicate ID/email,
`500` unexpected.

```bash
curl -X POST localhost:8080/api/students \
  -H 'Content-Type: application/json' \
  -d '{"studentId":"STU-2024-001","rollNo":"CS-21/047","fullName":"Ananya Rao",
       "email":"ananya.rao@gmail.com","phone":"+91 98765 43210"}'
```

## Configuration

| Env var | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8080` | Server port (Elastic Beanstalk sets this) |
| `SPRING_PROFILES_ACTIVE` | – | `mysql` switches to MySQL |
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | local MySQL | Connection, used with the `mysql` profile |
| `APP_CORS_ALLOWED_ORIGINS` | localhost dev ports | Comma separated; only needed when UI and API are on different origins |
| `VITE_API_BASE_URL` | `/api` | Frontend build-time API location |

## Deploy

See [`deploy/aws.md`](deploy/aws.md). The short version:

```bash
cp .env.example .env && nano .env
docker compose up -d --build
```

nginx serves the built React app and proxies `/api` to the Spring Boot container;
MySQL lives in a named volume. For a CDN split, build the frontend with
`VITE_API_BASE_URL` pointing at the API host, upload `dist/` to S3 behind
CloudFront, and set `APP_CORS_ALLOWED_ORIGINS` to the CDN domain.

## Design notes

Warm paper (`#F7F4EC`), one terracotta accent used sparingly, Instrument Serif for
display and JetBrains Mono for anything that behaves like data — IDs, roll
numbers, phone numbers, labels. No gradients on buttons, no glass cards, no
emoji. Sorting lives in the column headers, row actions appear on hover, and the
table collapses into labelled cards under 860px.

## Tests

```bash
cd backend && ./mvnw test
```

`StudentControllerTest` covers create, validation failure, duplicate detection,
search and delete against the real HTTP layer.
