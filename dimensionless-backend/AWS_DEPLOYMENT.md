# AWS Deployment Guide - CLI Method

This guide will help you deploy your NestJS backend to AWS using the AWS CLI and set up S3 for file storage.

## Prerequisites

1. **Install AWS CLI**
```bash
# macOS
brew install awscli

# Verify installation
aws --version
```

2. **Configure AWS CLI**
```bash
# Configure with your AWS credentials
aws configure

# You'll be prompted for:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., ap-south-1 for Mumbai)
# - Default output format (json)
```

---

## Deployment Options

We'll use **AWS Elastic Beanstalk** - it's the easiest CLI-based deployment method for NestJS apps.

### Why Elastic Beanstalk?
- ✅ Simple CLI deployment
- ✅ Auto-scaling and load balancing
- ✅ Automatic health monitoring
- ✅ Easy environment management
- ✅ Integrated with RDS, S3, CloudWatch

---

## Step 1: Install Elastic Beanstalk CLI

```bash
# Install EB CLI
pip3 install awsebcli --upgrade --user

# Verify installation
eb --version
```

---

## Step 2: Initialize Elastic Beanstalk

```bash
# Navigate to your backend directory
cd /Users/ramireddysaipratheepreddy/development/dimensionless-web/dimensionless-backend

# Initialize EB application
eb init

# Follow the prompts:
# 1. Select region: ap-south-1 (Mumbai) or your preferred region
# 2. Create new application: dimensionless-backend
# 3. Platform: Node.js
# 4. Platform version: Node.js 18 or 20 (latest LTS)
# 5. Setup SSH: Yes (recommended for debugging)
```

---

## Step 3: Create S3 Bucket for File Storage

```bash
# Create S3 bucket (bucket names must be globally unique)
aws s3 mb s3://dimensionless-uploads --region ap-south-1

# Enable versioning (optional but recommended)
aws s3api put-bucket-versioning \
  --bucket dimensionless-uploads \
  --versioning-configuration Status=Enabled

# Set CORS configuration for web uploads
aws s3api put-bucket-cors \
  --bucket dimensionless-uploads \
  --cors-configuration file://s3-cors.json

# Make bucket private (recommended - use presigned URLs for access)
aws s3api put-public-access-block \
  --bucket dimensionless-uploads \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

---

## Step 4: Create RDS Database (PostgreSQL)

```bash
# Create a security group for RDS
aws ec2 create-security-group \
  --group-name dimensionless-db-sg \
  --description "Security group for Dimensionless PostgreSQL database" \
  --region ap-south-1

# Get the security group ID (save this)
SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=dimensionless-db-sg" \
  --query "SecurityGroups[0].GroupId" \
  --output text)

# Allow PostgreSQL access from Elastic Beanstalk (you'll update this after EB deployment)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 5432 \
  --cidr 0.0.0.0/0

# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier dimensionless-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.5 \
  --master-username postgres \
  --master-user-password "YourSecurePassword123!" \
  --allocated-storage 20 \
  --vpc-security-group-ids $SG_ID \
  --backup-retention-period 7 \
  --region ap-south-1 \
  --publicly-accessible

# Wait for database to be available (this takes 5-10 minutes)
aws rds wait db-instance-available --db-instance-identifier dimensionless-db

# Get database endpoint
aws rds describe-db-instances \
  --db-instance-identifier dimensionless-db \
  --query "DBInstances[0].Endpoint.Address" \
  --output text
```

---

## Step 5: Configure Environment Variables

Create a file `.ebextensions/environment.config` (already created in this guide) with your production environment variables.

You can also set them via CLI:

```bash
# Set environment variables for Elastic Beanstalk
eb setenv \
  NODE_ENV=production \
  PORT=8080 \
  DATABASE_HOST=your-rds-endpoint.rds.amazonaws.com \
  DATABASE_PORT=5432 \
  DATABASE_USER=postgres \
  DATABASE_PASSWORD=YourSecurePassword123! \
  DATABASE_NAME=dimensionless \
  JWT_SECRET=your-super-secret-jwt-key-change-this \
  AWS_REGION=ap-south-1 \
  AWS_S3_BUCKET=dimensionless-uploads \
  RAZORPAY_KEY_ID=your_razorpay_key_id \
  RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

## Step 6: Create Elastic Beanstalk Environment

```bash
# Create production environment
eb create dimensionless-prod \
  --instance-type t3.small \
  --platform "Node.js 20" \
  --region ap-south-1 \
  --envvars NODE_ENV=production

# This will:
# 1. Create EC2 instances
# 2. Set up load balancer
# 3. Configure auto-scaling
# 4. Deploy your application
# Takes about 5-10 minutes
```

---

## Step 7: Deploy Your Application

```bash
# Build your application
npm run build

# Deploy to Elastic Beanstalk
eb deploy

# Open your application in browser
eb open

# Check application health
eb health

# View logs
eb logs
```

---

## Step 8: Run Database Migrations

```bash
# SSH into your EB instance
eb ssh

# Once connected, navigate to app directory
cd /var/app/current

# Run migrations
npm run migration:run

# Exit SSH
exit
```

---

## Step 9: Set Up Custom Domain (Optional)

```bash
# If you have a domain, you can configure it
# First, get your EB environment URL
eb status

# Then create a CNAME record in your DNS provider:
# api.yourdomain.com -> your-eb-env.ap-south-1.elasticbeanstalk.com
```

---

## Useful Commands

### Monitoring & Logs
```bash
# View real-time logs
eb logs --stream

# Check application health
eb health --refresh

# View environment status
eb status

# SSH into instance
eb ssh
```

### Updates & Scaling
```bash
# Deploy new version
eb deploy

# Scale instances
eb scale 2  # Run 2 instances

# Update environment variables
eb setenv KEY=value

# Restart application
eb restart
```

### Cleanup
```bash
# Terminate environment (when you want to shut down)
eb terminate dimensionless-prod

# Delete S3 bucket
aws s3 rb s3://dimensionless-uploads --force

# Delete RDS instance
aws rds delete-db-instance \
  --db-instance-identifier dimensionless-db \
  --skip-final-snapshot
```

---

## Cost Estimation (Mumbai Region)

- **Elastic Beanstalk**: Free (you only pay for underlying resources)
- **EC2 t3.small**: ~$15/month
- **RDS db.t3.micro**: ~$15/month
- **S3 Storage**: $0.023/GB/month
- **Data Transfer**: First 1GB free, then $0.09/GB

**Total**: ~$30-40/month for a small production setup

---

## Security Best Practices

1. **Never commit `.env` files** - Use environment variables
2. **Use IAM roles** - Attach IAM role to EB instances instead of hardcoding AWS credentials
3. **Enable HTTPS** - Use AWS Certificate Manager (free SSL certificates)
4. **Restrict database access** - Update RDS security group to only allow EB instances
5. **Use presigned URLs** - For S3 file access instead of making bucket public
6. **Enable CloudWatch** - Monitor application logs and metrics

---

## Troubleshooting

### Application won't start
```bash
# Check logs
eb logs

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port mismatch (EB uses port 8080 by default)
```

### Database connection failed
```bash
# Verify RDS endpoint
aws rds describe-db-instances --db-instance-identifier dimensionless-db

# Check security group allows connections
# Update DATABASE_HOST in environment variables
```

### S3 upload fails
```bash
# Verify bucket exists
aws s3 ls

# Check IAM permissions
# Ensure EB instance role has S3 access
```

---

## Next Steps

1. ✅ Install AWS CLI and EB CLI
2. ✅ Configure AWS credentials
3. ✅ Create S3 bucket
4. ✅ Create RDS database
5. ✅ Initialize and create EB environment
6. ✅ Deploy application
7. ✅ Run database migrations
8. ✅ Test your API endpoints

Your backend will be available at: `http://dimensionless-prod.ap-south-1.elasticbeanstalk.com`
