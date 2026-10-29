# House of Delicious (HOD) — Web Platform

Official web application for **House of Delicious (HOD)** — a popular, budget-friendly fusion and fast-food café located opposite Somaiya College Gate 1 in Vidyavihar East, Mumbai.

---

## 📁 Production Directory Structure

```text
├── public/                     # Static website assets and web pages
│   ├── _next/                  # Next.js optimized bundles, chunks, and CSS
│   ├── burgers/                # High-resolution dish photos
│   ├── img/                    # Illustrations, stickers, brand graphics
│   ├── img-webp/               # WebP images & graphics
│   ├── 4a2af2c9fb33a07b/       # Analytics scripts
│   ├── index.html              # Home page
│   ├── menu.html               # Menu & Signature items page
│   ├── spices.html             # Kitchen & Ingredients page
│   ├── contact.html            # Location & Contact page
│   ├── manifest.webmanifest    # Web App Manifest
│   └── favicon.ico             # Site icon
│
├── src/                        # Application Source Code
│   └── server.js               # Production HTTP server with caching & security headers
│
├── config/                     # Deployment & Server Configurations
│   ├── ecosystem.config.js     # PM2 cluster process management
│   └── nginx.conf              # Reverse proxy, gzip, and SSL configuration
│
├── scripts/                    # Automation & Maintenance Scripts
│   └── healthcheck.js          # Healthcheck monitor for Docker & uptime
│
├── Dockerfile                  # Production container definition (Node 20 Alpine)
├── docker-compose.yml          # Container orchestration configuration
├── .dockerignore               # Docker build exclusions
├── .gitignore                  # Git tracking exclusions
├── .env.example                # Environment variables template
├── package.json                # Project dependencies & scripts
├── server.js                   # Root entry-point proxy
└── README.md                   # Documentation
```

---

## 🚀 Running the Application

### 1. Local Development
Start the server locally:
```bash
npm run dev
# or
npm start
```

Open in your browser:
- **Home**: [http://localhost:3000](http://localhost:3000)
- **Menu**: [http://localhost:3000/menu](http://localhost:3000/menu)
- **Kitchen & Ingredients**: [http://localhost:3000/spices](http://localhost:3000/spices)
- **Contact & Location**: [http://localhost:3000/contact](http://localhost:3000/contact)
- **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)

### 2. Production with PM2 (Cluster Mode)
Run with automatic restarts and zero-downtime clustering:
```bash
npm run pm2:start
npm run pm2:logs
npm run pm2:stop
```

### 3. Docker Deployment
Run using Docker Compose:
```bash
docker compose up -d --build
```
Check container status:
```bash
docker compose ps
```

---

## 🛡️ Production Features
- **Zero-Dependency Core**: Fast, lightweight native Node.js HTTP implementation.
- **Dynamic Image Pipeline**: Native support for Next.js image optimization routes (`/_next/image?url=...`).
- **Security Headers**: Includes `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy`.
- **Intelligent Caching**: Long-term immutable caching (`max-age=31536000`) for static chunks and images; revalidation for HTML.
- **Healthcheck Endpoint**: `/health` reporting uptime and service status.
- **Graceful Shutdown**: Handles `SIGINT` and `SIGTERM` gracefully.
