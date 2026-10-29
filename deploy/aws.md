# Deploying to AWS

Two supported shapes. **Option A** is one box running everything — fastest and
cheapest for a college project or internal tool. **Option B** splits the frontend
onto S3/CloudFront when you want a CDN and a managed database.

---

## Option A — Single EC2 instance with Docker Compose

Everything (nginx + React, Spring Boot, MySQL) runs on one instance.

### 1. Launch the instance

| Setting | Value |
| --- | --- |
| AMI | Ubuntu Server 24.04 LTS |
| Type | `t3.small` (2 GB RAM) — `t3.micro` works but is tight with MySQL |
| Storage | 20 GB gp3 |
| Security group | inbound 22 (your IP), 80 (0.0.0.0/0), 443 (0.0.0.0/0) |

### 2. Install Docker

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER && newgrp docker
```

### 3. Ship the code

```bash
git clone <your-repo-url> student-registry
cd student-registry
cp .env.example .env
nano .env          # change MYSQL_PASSWORD, MYSQL_ROOT_PASSWORD, WEB_PORT=80
docker compose up -d --build
```

Check it:

```bash
docker compose ps
curl -s localhost/api/students        # [] on a fresh database
docker compose logs -f api            # Spring Boot startup log
```

Open `http://<ec2-public-ip>/`. The nginx container proxies `/api/*` to the
`api` service over the internal Docker network, so no CORS is involved.

### 4. HTTPS (do this before real users)

Point an A record at the Elastic IP, then:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d registry.example.com
```

Certbot rewrites the nginx config on the host — but nginx runs **inside** the
container. Either terminate TLS on the host nginx (recommended) and proxy to
`127.0.0.1:80`, or put an ALB + ACM certificate in front and skip certbot.

Simplest host-level setup:

```nginx
# /etc/nginx/sites-available/registry
server {
    listen 443 ssl;
    server_name registry.example.com;
    ssl_certificate     /etc/letsencrypt/live/registry.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/registry.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;   # docker publish: WEB_PORT=8080
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 5. Day-to-day

```bash
docker compose pull && docker compose up -d --build   # redeploy
docker compose exec db mysqldump -u root -p student_registry > backup.sql
docker compose down                                   # stop (data volume survives)
```

---

## Option B — S3 + CloudFront frontend, API on EC2

Use this when you want the UI served from a CDN.

### 1. Build the frontend against the public API

```bash
cd frontend
VITE_API_BASE_URL=https://api.example.com/api npm run build
```

### 2. Upload to S3

```bash
aws s3 mb s3://student-registry-ui
aws s3 sync dist/ s3://student-registry-ui --delete \
  --cache-control "public,max-age=31536000,immutable" --exclude "index.html"
aws s3 cp dist/index.html s3://student-registry-ui/index.html \
  --cache-control "no-cache"
```

Block public access on the bucket and serve it through CloudFront with an
Origin Access Control.

### 3. CloudFront settings that matter

- **Default root object:** `index.html`
- **Custom error responses:** 403 and 404 → `/index.html` with response code 200
  (this is what makes client-side routing work)
- **Cache policy:** `CachingOptimized`; forward nothing but `Host`

### 4. Allow the CDN origin on the API

On the EC2 box, in `.env`:

```env
APP_CORS_ALLOWED_ORIGINS=https://d111111abcdef8.cloudfront.net
```

Then `docker compose up -d api`. This is the only reason CORS exists in this
project — same-origin deployments never hit it.

---

## Production database: RDS instead of the MySQL container

1. Create an RDS MySQL 8.4 instance, `db.t3.micro`, **not publicly accessible**,
   in the same VPC and security group as EC2 (port 3306 open only to that SG).
2. Remove the `db` service from `docker-compose.yml` (or keep it as a local
   fallback) and point the API at RDS:

```env
SPRING_PROFILES_ACTIVE=mysql
DB_URL=jdbc:mysql://registry.xxxxx.ap-south-1.rds.amazonaws.com:3306/student_registry?useSSL=true&serverTimezone=UTC
DB_USERNAME=registry
DB_PASSWORD=<strong-password>
```

3. Turn on automated backups and a 7-day retention window.

---

## Checklist before you call it live

- [ ] `.env` is **not** committed (it is already in `.gitignore`)
- [ ] MySQL passwords are long and random, not `change-me`
- [ ] HTTPS works and HTTP redirects to it
- [ ] Security group exposes only 22 / 80 / 443 — not 8080 or 3306
- [ ] RDS is not publicly accessible
- [ ] `docker compose restart: unless-stopped` is in place (it is)
- [ ] A backup cron exists for the database
- [ ] `/actuator` is only exposing `health` and `info` (it is)

## What this stack costs (ap-south-1, on-demand, rough)

| Item | Monthly |
| --- | --- |
| t3.small EC2 | ~$17 |
| 20 GB gp3 EBS | ~$1.60 |
| Elastic IP (attached) | $0 |
| S3 + CloudFront (Option B) | ~$1 |
| RDS db.t3.micro (optional) | ~$15 |

A `t3.micro` with the H2 file database (drop the `db` service and run the API
with the default profile) runs for roughly $8/month — fine for a demo, not for
real data.
