# API Testing Guide

## 🚀 Server Status

The NestJS backend is running at:
- **API Base URL**: `http://localhost:5000/api`
- **Swagger Docs**: `http://localhost:5000/api/docs`

---

## ✅ Available Endpoints

### Authentication
```bash
# Register
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "full_name": "Test User"
}

# Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Users
```bash
# Get Profile (requires auth token)
GET http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_TOKEN_HERE

# Update Profile
PATCH http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "full_name": "Updated Name"
}
```

### Artworks
```bash
# Get all artworks
GET http://localhost:5000/api/artworks

# Get artwork by ID
GET http://localhost:5000/api/artworks/{id}

# Create artwork (Creator/Admin only)
POST http://localhost:5000/api/artworks
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "My Artwork",
  "description": "Beautiful artwork",
  "purchase_price": 5000,
  "status": "published"
}
```

### Payments (Razorpay)
```bash
# Get Razorpay config
GET http://localhost:5000/api/payments/config/razorpay

# Create order
POST http://localhost:5000/api/payments/create-order
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "amount": 500,
  "currency": "INR"
}

# Verify payment
POST http://localhost:5000/api/payments/verify
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

---

## 🧪 Quick Test

1. **Open Swagger UI**: http://localhost:5000/api/docs
2. **Test Registration**:
   - Click on `POST /api/auth/register`
   - Click "Try it out"
   - Enter test data
   - Execute
3. **Copy the access_token** from the response
4. **Authorize**:
   - Click the "Authorize" button at the top
   - Paste your token
5. **Test Protected Endpoints**:
   - Try `GET /api/users/profile`
   - Try creating an artwork

---

## 📝 Notes

- **Database**: Currently set to localhost PostgreSQL
- **AWS S3**: Not configured yet (will need AWS credentials)
- **Razorpay**: Not configured yet (will need Razorpay keys)

To configure these, edit `.env` file with your credentials.
