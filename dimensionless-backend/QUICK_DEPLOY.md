# AWS Deployment Quick Reference

Quick commands for deploying your NestJS backend to AWS.

## Prerequisites

```bash
# Install tools
brew install awscli
pip3 install awsebcli --upgrade --user

# Configure AWS
aws configure
```

## Deploy in 5 Steps

### 1. Create S3 Bucket
```bash
aws s3 mb s3://dimensionless-uploads --region ap-south-1
aws s3api put-bucket-cors --bucket dimensionless-uploads --cors-configuration file://s3-cors.json
```

### 2. Initialize Elastic Beanstalk
```bash
cd /Users/ramireddysaipratheepreddy/development/dimensionless-web/dimensionless-backend
eb init
# Select: ap-south-1, Node.js platform
```

### 3. Set Environment Variables
```bash
eb setenv \
  NODE_ENV=production \
  PORT=8080 \
  DATABASE_HOST=your-db-host \
  DATABASE_PORT=5432 \
  DATABASE_USER=postgres \
  DATABASE_PASSWORD=your-password \
  DATABASE_NAME=dimensionless \
  JWT_SECRET=your-jwt-secret \
  AWS_REGION=ap-south-1 \
  AWS_S3_BUCKET=dimensionless-uploads \
  RAZORPAY_KEY_ID=your-key \
  RAZORPAY_KEY_SECRET=your-secret
```

### 4. Create Environment & Deploy
```bash
eb create dimensionless-prod --instance-type t3.small
eb deploy
```

### 5. Verify
```bash
eb health
eb open
```

## Useful Commands

```bash
# View logs
eb logs --stream

# SSH into instance
eb ssh

# Update environment variables
eb setenv KEY=value

# Redeploy
eb deploy

# Terminate (cleanup)
eb terminate dimensionless-prod
```

## Cost: ~$30-40/month

See [AWS_DEPLOYMENT.md](file:///Users/ramireddysaipratheepreddy/development/dimensionless-web/dimensionless-backend/AWS_DEPLOYMENT.md) for detailed guide.
