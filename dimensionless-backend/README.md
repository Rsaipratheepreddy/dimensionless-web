# Dimensionless Backend - NestJS API

Backend API for Dimensionless Studio, migrated from Supabase to AWS infrastructure.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (AWS RDS or local)
- AWS account with S3 bucket configured

### Installation

```bash
cd dimensionless-backend
npm install
```

### Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update `.env` with your credentials:
```env
# Database (AWS RDS or local PostgreSQL)
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=dimensionless

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=dimensionless-storage

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# CORS (your frontend URL)
CORS_ORIGIN=http://localhost:3000
```

### Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at:
- **API**: `http://localhost:5000/api`
- **Swagger Docs**: `http://localhost:5000/api/docs`

---

## 📁 Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── auth/                   # Authentication & authorization
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── strategies/         # Passport strategies (JWT, Local)
│   ├── guards/             # Auth guards
│   └── decorators/         # Custom decorators (@Roles)
├── users/                  # User management
│   ├── entities/user.entity.ts
│   ├── users.service.ts
│   └── users.controller.ts
├── artworks/               # Artwork management
│   ├── entities/
│   │   ├── artwork.entity.ts
│   │   └── artwork-image.entity.ts
│   ├── artworks.service.ts
│   └── artworks.controller.ts
├── storage/                # AWS S3 file uploads
│   ├── s3.service.ts
│   └── storage.service.ts
├── events/                 # Events & competitions (TODO)
├── tattoos/                # Tattoo booking system (TODO)
├── piercings/              # Piercing booking system (TODO)
├── payments/               # Razorpay integration (TODO)
├── categories/             # Categories management (TODO)
├── bookings/               # Booking management (TODO)
└── art-classes/            # Art classes (TODO)
```

---

## ✅ Completed Modules

### 1. Authentication (`/api/auth`)
- ✅ POST `/auth/register` - User registration
- ✅ POST `/auth/login` - User login (returns JWT token)
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Employee, Creator, Member)

### 2. Users (`/api/users`)
- ✅ GET `/users/profile` - Get current user profile
- ✅ PATCH `/users/profile` - Update current user profile
- ✅ GET `/users` - List all users (Admin/Employee only)
- ✅ GET `/users/:id` - Get user by ID
- ✅ PATCH `/users/:id` - Update user (Admin only)
- ✅ DELETE `/users/:id` - Delete user (Admin only)

### 3. Artworks (`/api/artworks`)
- ✅ GET `/artworks` - List artworks (with filters: status, category, artist_id)
- ✅ GET `/artworks/:id` - Get artwork details
- ✅ POST `/artworks` - Create artwork (Creator/Admin only)
- ✅ PATCH `/artworks/:id` - Update artwork (Creator/Admin only)
- ✅ DELETE `/artworks/:id` - Delete artwork (Creator/Admin only)
- ✅ POST `/artworks/:id/images` - Upload artwork image
- ✅ DELETE `/artworks/images/:imageId` - Delete artwork image

### 4. Storage (AWS S3)
- ✅ File upload to S3
- ✅ File validation (type, size)
- ✅ Presigned URL generation
- ✅ File deletion

---

## 🔨 TODO: Remaining Modules

The following modules need to be implemented based on your Supabase schema:

### Events Module
- [ ] Event categories
- [ ] Events CRUD
- [ ] Event registrations
- [ ] Payment integration for events

### Tattoos Module
- [ ] Tattoo designs CRUD
- [ ] Tattoo slots management
- [ ] Tattoo bookings
- [ ] Payment integration

### Piercings Module
- [ ] Piercing designs CRUD
- [ ] Piercing slots management
- [ ] Piercing bookings
- [ ] Payment integration

### Payments Module
- [ ] Razorpay checkout
- [ ] Payment verification
- [ ] Refund processing

### Categories Module
- [ ] Categories CRUD
- [ ] Interest categories

### Bookings Module
- [ ] Unified booking management
- [ ] Booking status updates

### Art Classes Module
- [ ] Art classes CRUD
- [ ] Class registrations

---

## 🔐 Authentication Flow

### Registration
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "phone": "+1234567890"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "member"
  }
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: Same as registration
```

### Using the Token
```bash
GET /api/users/profile
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📦 Database Setup

### Option 1: AWS RDS (Production)
1. Create PostgreSQL instance in AWS RDS
2. Update `.env` with RDS endpoint
3. Run migrations (auto-sync enabled in dev mode)

### Option 2: Local PostgreSQL (Development)
```bash
# Install PostgreSQL
brew install postgresql  # macOS
# or use Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Create database
createdb dimensionless

# Update .env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=dimensionless
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 🚢 Deployment

### AWS EC2 (Free Tier)
```bash
# Build the application
npm run build

# Start with PM2
npm install -g pm2
pm2 start dist/main.js --name dimensionless-api

# Set up nginx reverse proxy
# Configure SSL with Let's Encrypt
```

### AWS ECS Fargate
```bash
# Build Docker image
docker build -t dimensionless-backend .

# Push to ECR
# Deploy to ECS
```

### AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize and deploy
eb init
eb create dimensionless-api
eb deploy
```

---

## 📊 API Documentation

Once the server is running, visit:
**http://localhost:5000/api/docs**

This provides interactive Swagger/OpenAPI documentation for all endpoints.

---

## 🔄 Migration from Supabase

### Data Migration Steps

1. **Export from Supabase**:
```bash
# Export all tables
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > supabase_dump.sql
```

2. **Transform Data**:
   - Update file URLs from Supabase Storage to S3
   - Hash passwords for local storage
   - Convert Supabase auth users

3. **Import to AWS RDS**:
```bash
psql -h your-rds-endpoint.rds.amazonaws.com -U postgres -d dimensionless < transformed_data.sql
```

4. **Migrate Files to S3**:
```bash
# Use AWS CLI or migration script
aws s3 sync ./supabase-files s3://dimensionless-storage/
```

---

## 🛠️ Development Tips

### Hot Reload
The dev server automatically reloads on file changes:
```bash
npm run start:dev
```

### Database Sync
In development, TypeORM auto-syncs the schema:
```typescript
// app.module.ts
synchronize: process.env.NODE_ENV === 'development'
```

⚠️ **Warning**: Disable `synchronize` in production! Use migrations instead.

### Adding New Modules
```bash
# Generate module
nest g module events
nest g service events
nest g controller events

# Generate entity
nest g class events/entities/event.entity --no-spec
```

---

## 📝 Next Steps

1. ✅ **Backend Structure Created** - You are here!
2. ⏳ **Complete Remaining Modules** - Implement Events, Tattoos, Piercings, etc.
3. ⏳ **Set Up AWS Infrastructure** - RDS, S3, EC2/ECS
4. ⏳ **Migrate Data** - Export from Supabase, import to AWS
5. ⏳ **Update Frontend** - Replace Supabase calls with API calls
6. ⏳ **Deploy & Test** - Deploy to AWS, end-to-end testing

---

## 🆘 Support

For issues or questions:
1. Check the Swagger docs at `/api/docs`
2. Review the implementation plan
3. Check TypeORM documentation for database queries
4. AWS SDK documentation for S3 operations

---

## 📄 License

Private - Dimensionless Studio
