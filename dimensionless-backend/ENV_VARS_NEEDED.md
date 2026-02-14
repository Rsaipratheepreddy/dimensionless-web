# Environment Variables Required

Add these to your AWS Elastic Beanstalk environment:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=492857149641-kkn44l0qc7g3vhk5qmitg0gc2jpmb88r.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=https://api.dimens.in/auth/google/callback

# Redis (optional - will use in-memory cache if not provided)
REDIS_HOST=localhost
REDIS_PORT=6379
```

For local development, add these to your `.env` file.
