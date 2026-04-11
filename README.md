# AMW Career Point — REST API

**Base URL:** `http://localhost:3000/api/v1`  
**Stack:** Node.js · Express · MongoDB (Mongoose)

---

## 🚀 Quick Start

### 1. Make sure MongoDB is running
```bash
# Windows: Start MongoDB locally
mongod --dbpath "C:\data\db"
```

### 2. Seed the admin user (first time only)
```bash
npm run seed
```
This creates: `admin@amwcareerpoint.com` / `Admin@123456`

### 3. Start the server
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

---

## 📦 Project Structure

```
node/
├── server.js               ← Entry point
├── .env                    ← Environment variables
├── src/
│   ├── config/db.js        ← MongoDB connection
│   ├── middleware/
│   │   ├── auth.js         ← JWT auth + blacklist
│   │   ├── errorHandler.js ← Global error handler
│   │   └── upload.js       ← Multer file upload
│   ├── models/             ← Mongoose schemas
│   ├── controllers/        ← Business logic
│   ├── routes/             ← Express routers
│   └── scripts/seed.js     ← Admin user seeder
└── uploads/                ← Uploaded images (auto-created)
```

---

## 🔐 Authentication

Admin-only endpoints require:
```
Authorization: Bearer <token>
```

1. `POST /api/v1/auth/login` — Get token
2. `POST /api/v1/auth/refresh` — Refresh token
3. `POST /api/v1/auth/logout` — Invalidate token

---

## 📡 All Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/countries` | No | List countries |
| GET | `/api/v1/countries/:slug` | No | Country detail + universities |
| POST | `/api/v1/countries` | ✅ | Create country |
| PUT | `/api/v1/countries/reorder` | ✅ | Reorder countries |
| PUT | `/api/v1/countries/:id` | ✅ | Update country |
| DELETE | `/api/v1/countries/:id` | ✅ | Delete country |
| GET | `/api/v1/universities` | No | List universities |
| GET | `/api/v1/universities/:slug` | No | University detail |
| POST | `/api/v1/universities` | ✅ | Create university |
| PUT | `/api/v1/universities/:id` | ✅ | Update university |
| DELETE | `/api/v1/universities/:id` | ✅ | Delete university |
| GET | `/api/v1/counsellors` | No | List counsellors |
| POST | `/api/v1/counsellors` | ✅ | Create counsellor |
| PUT | `/api/v1/counsellors/:id` | ✅ | Update counsellor |
| DELETE | `/api/v1/counsellors/:id` | ✅ | Delete counsellor |
| GET | `/api/v1/reviews` | No | List reviews + meta |
| POST | `/api/v1/reviews` | ✅ | Create review |
| PUT | `/api/v1/reviews/meta` | ✅ | Update avg rating & total |
| PUT | `/api/v1/reviews/:id` | ✅ | Update review |
| DELETE | `/api/v1/reviews/:id` | ✅ | Delete review |
| GET | `/api/v1/blogs` | No | List blogs |
| GET | `/api/v1/blogs/:slug` | No | Blog detail + related posts |
| POST | `/api/v1/blogs` | ✅ | Create blog post |
| PUT | `/api/v1/blogs/:id` | ✅ | Update blog post |
| DELETE | `/api/v1/blogs/:id` | ✅ | Delete blog post |
| GET | `/api/v1/blog-categories` | No | List blog categories |
| POST | `/api/v1/blog-categories` | ✅ | Create category |
| PUT | `/api/v1/blog-categories/:id` | ✅ | Update category |
| DELETE | `/api/v1/blog-categories/:id` | ✅ | Delete category |
| GET | `/api/v1/blog-authors` | No | List authors |
| POST | `/api/v1/blog-authors` | ✅ | Create author |
| POST | `/api/v1/enquiries` | No | Submit enquiry (public form) |
| GET | `/api/v1/enquiries` | ✅ | List enquiries |
| PUT | `/api/v1/enquiries/:id` | ✅ | Update enquiry status |
| POST | `/api/v1/media/upload` | ✅ | Upload image |

---

## 🖼️ Image Upload

```
POST /api/v1/media/upload
Content-Type: multipart/form-data

Fields:
  file   → image file (JPG/PNG/WebP, max 5MB)
  folder → countries | universities | blogs | counsellors
```

Uploaded images are served at: `http://localhost:3000/uploads/<folder>/<filename>`

---

## ⚙️ Environment Variables (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/amwcareerpoint` | MongoDB connection string |
| `JWT_SECRET` | — | **Change in production!** |
| `REFRESH_SECRET` | — | **Change in production!** |
| `JWT_EXPIRES` | `24h` | Access token lifetime |
| `REFRESH_EXPIRES` | `7d` | Refresh token lifetime |
| `BASE_URL` | `http://localhost:3000` | Used for uploaded file URLs |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |
| `ADMIN_EMAIL` | `admin@amwcareerpoint.com` | Seed admin email |
| `ADMIN_PASSWORD` | `Admin@123456` | Seed admin password |
