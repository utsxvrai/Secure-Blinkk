# Secure-Blink: Multi-Tenant API with AWS Lambda & DynamoDB

A complete, production-ready multi-tenant API built with Express.js, secured with JWT authentication, Role-Based Access Control (RBAC), and deployed on AWS Lambda with DynamoDB.

## 📁 Project Structure

```
src/
├── controllers/          # HTTP request handlers
│   ├── auth-controller.js
│   ├── user-controller.js
│   ├── apikey-controller.js
│   ├── project-controller.js
│   └── audit-controller.js
├── services/            # Business logic layer
│   ├── auth-service.js
│   ├── user-service.js
│   ├── apikey-service.js
│   ├── project-service.js
│   └── audit-service.js
├── repositories/        # Database access layer
│   ├── user-repository.js
│   ├── apikey-repository.js
│   ├── project-repository.js
│   ├── audit-repository.js
│   └── organization-repository.js
├── models/              # Data models
│   ├── User.js
│   ├── ApiKey.js
│   ├── Project.js
│   └── Audit.js
├── validators/          # Request validation schemas
│   ├── auth-validator.js
│   ├── user-validator.js
│   ├── apikey-validator.js
│   └── project-validator.js
├── middlewares/         # Express middlewares
│   ├── jwtverify.js          # JWT authentication
│   ├── rbac.js               # Role-based access control
│   ├── tenantGaurd.js        # Tenant isolation
│   ├── apikeyAuth.js         # API key authentication
│   └── validation.js         # Input validation
├── routes/              # API route definitions
│   └── v1/
│       ├── auth-route.js
│       ├── user-route.js
│       ├── apikey-route.js
│       ├── project-route.js
│       └── audit-route.js
├── utils/               # Utility functions
│   ├── errors.js        # Custom error classes
│   ├── response.js      # Response formatting
│   └── audit.js         # Audit logging
├── db/                  # Database configuration
│   └── dynamoClient.js
├── config/              # Configuration
│   └── index.js
├── index.js             # Main Express app
└── hander.js            # Serverless Lambda handler

```

---

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- npm
- AWS Account (for deployment)
- Serverless Framework CLI

### Local Development

1. **Install Dependencies**

   ```powershell
   npm install
   ```

2. **Set Up Environment Variables**

   ```powershell
   cp .env.example .env
   ```

   Edit `.env` and set:

   ```
   JWT_SECRET=your-secret-key
   DYNAMODB_ENDPOINT=http://localhost:8000
   ```

3. **Start DynamoDB Local** (in Terminal 1)

   ```powershell
   npm run dynamodb:start
   ```

4. **Start API Server** (in Terminal 2)

   ```powershell
   npm run dev
   ```

5. **Test the API**
   ```powershell
   curl http://localhost:3000/health
   ```

---

## 🔐 Authentication & Authorization

### JWT Authentication

All protected endpoints require an `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

### API Key Authentication

External integrations can use API keys:

```
x-api-key: sb_xxxxxxxxxxxxx
```

### Roles & Permissions

| Role        | Capabilities                                                    |
| ----------- | --------------------------------------------------------------- |
| **admin**   | Full access - manage users, API keys, projects, view audit logs |
| **manager** | Limited write access - create/update users and projects         |
| **user**    | Read-only access - view organization data                       |

---

## 📡 API Endpoints

### Auth (Public)

```
POST   /api/v1/auth/register          # Register new user/organization
POST   /api/v1/auth/login             # Login and get JWT token
```

### Users (Protected)

```
POST   /api/v1/users                  # Create user (admin/manager)
GET    /api/v1/users                  # List organization users
PUT    /api/v1/users/:userId          # Update user (admin/manager)
DELETE /api/v1/users/:userId          # Deactivate user (admin)
POST   /api/v1/users/change-password  # Change own password
```

### API Keys (Protected)

```
POST   /api/v1/api-keys               # Create API key (admin/manager)
GET    /api/v1/api-keys               # List organization API keys
POST   /api/v1/api-keys/:keyId/rotate # Rotate API key (admin/manager)
DELETE /api/v1/api-keys/:keyId        # Revoke API key (admin)
```

### Projects (Protected)

```
POST   /api/v1/projects               # Create project (admin/manager)
GET    /api/v1/projects               # List projects
GET    /api/v1/projects/:projectId    # Get project details
PUT    /api/v1/projects/:projectId    # Update project (admin/manager)
DELETE /api/v1/projects/:projectId    # Delete project (admin)
```

### Audit Logs (Protected)

```
GET    /api/v1/audit                  # List organization audit logs (admin)
GET    /api/v1/audit/:userId          # List user's audit logs
```

---

## 🗄️ DynamoDB Tables

| Table                 | Primary Key | Indexes                                  | Purpose             |
| --------------------- | ----------- | ---------------------------------------- | ------------------- |
| users-{stage}         | id          | emailOrganization, organizationId        | Store user accounts |
| projects-{stage}      | id          | organizationId                           | Store projects      |
| api_keys-{stage}      | id          | keyHash, organizationId                  | Store API keys      |
| audit_logs-{stage}    | id          | organizationIdTimestamp, userIdTimestamp | Audit trail         |
| organizations-{stage} | id          | name                                     | Store organizations |

---

## 🚀 Deployment to AWS

### Prerequisites

1. Create AWS account
2. Create IAM user with programmatic access
3. Configure AWS credentials locally

### Deploy to AWS

```powershell
# Configure credentials (one time)
serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_SECRET

# Deploy to dev stage
npm run deploy:dev

# Deploy to production
npm run deploy:prod

# View logs
npm run logs

# Remove deployment
npm run remove
```

See `AWS_SETUP.md` for detailed instructions.

---

## 📊 Example Usage

### Register & Login

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "organizationName": "Acme Corp"
  }'

# Response
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "admin@company.com",
    "organizationId": "org-456"
  }
}

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePassword123",
    "organizationId": "org-456"
  }'

# Response includes JWT token
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-123",
      "email": "admin@company.com",
      "role": "admin"
    }
  }
}
```

### Create Project

```bash
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mobile App",
    "description": "iOS and Android mobile application"
  }'
```

### Generate API Key

```bash
curl -X POST http://localhost:3000/api/v1/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mobile App Integration"
  }'

# Response
{
  "success": true,
  "data": {
    "id": "key-789",
    "key": "sb_xxxxxxxxxxxxx",  # Save this securely!
    "keyPrefix": "sb_xxxx",
    "createdAt": "2025-12-09T..."
  }
}
```

---

## 🔒 Security Features

- **Helmet**: HTTP security headers (XSS, CSRF, clickjacking protection)
- **Rate Limiting**: 100 requests per 15 minutes (5 for auth endpoints)
- **CORS**: Configurable allowed origins
- **Input Validation**: Joi schemas for all requests
- **Input Sanitization**: XSS prevention
- **JWT**: Secure token signing with configurable expiry
- **Password Hashing**: bcryptjs with salt rounds
- **Tenant Isolation**: Organization-level data separation
- **Audit Logging**: Complete audit trail

---

## 📋 Scripts

```bash
npm start              # Start in production mode
npm run dev            # Start with serverless-offline (local)
npm run dynamodb:start # Start DynamoDB Local
npm run deploy:dev     # Deploy to AWS dev stage
npm run deploy:prod    # Deploy to AWS prod stage
npm run logs           # View Lambda logs
npm run remove         # Remove AWS deployment
npm test              # Run tests
```

---

## 🐛 Troubleshooting

### DynamoDB Connection Error

```
Error: ECONNREFUSED
```

Solution: Ensure DynamoDB Local is running: `npm run dynamodb:start`

### JWT Token Expired

Create a new token by logging in again.

### Rate Limit Exceeded

Wait 15 minutes or restart the server.

### Deployment Error

Check AWS credentials: `serverless config credentials --provider aws`

---

## 📚 Documentation

- **AWS Setup**: See `AWS_SETUP.md` for cloud deployment
- **API Examples**: See examples above
- **Postman Collection**: Import collection.json into Postman

---

## 🤝 Contributing

1. Create a feature branch
2. Make changes following the modular structure
3. Write tests
4. Submit pull request

---

## 📝 License

MIT License - feel free to use for personal and commercial projects

---

## 🎯 What's Included

✅ Complete source code
✅ Environment configuration
✅ Serverless Framework setup
✅ DynamoDB Local setup
✅ AWS deployment guide
✅ Example requests
✅ Error handling
✅ Audit logging
✅ Rate limiting
✅ CORS configuration

---

**Built with ❤️ for secure, scalable APIs**
