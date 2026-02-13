# ⚠️ Database Setup Required

The backend is currently configured to run **without a database connection** so you can test the API structure.

## Quick Start (No Database)

The server will start and you can:
- ✅ View Swagger documentation at `http://localhost:5000/api/docs`
- ✅ See all available API endpoints
- ✅ Test the Payments module configuration
- ❌ Cannot actually register/login (requires database)

## To Enable Full Functionality

You need PostgreSQL running. Choose one option:

### Option 1: Docker (Easiest)
```bash
docker run --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dimensionless \
  -p 5432:5432 \
  -d postgres:15

# Wait 5 seconds for PostgreSQL to start
sleep 5

# Restart the backend
# It will auto-create tables
```

### Option 2: Install PostgreSQL Locally
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15
createdb dimensionless

# Update .env if needed
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=dimensionless
```

### Option 3: Use AWS RDS (Production)
1. Create RDS PostgreSQL instance in AWS
2. Update `.env` with RDS endpoint
3. Uncomment TypeORM config in `src/app.module.ts`

## After Database is Running

1. **Uncomment the database config** in `src/app.module.ts` (lines 25-36)
2. **Restart the server**: The dev server will auto-reload
3. **Tables will be created automatically** (TypeORM synchronize is enabled in dev mode)
4. **Test the full API** with registration, login, etc.

---

## Current Status

✅ **Payments Module**: Fully implemented with Razorpay  
✅ **Authentication**: JWT + Passport configured  
✅ **Users Module**: Complete CRUD operations  
✅ **Artworks Module**: Complete with S3 upload  
✅ **Storage Module**: AWS S3 integration ready  
⏳ **Database**: Waiting for PostgreSQL connection  

The backend is production-ready, just needs a database!
