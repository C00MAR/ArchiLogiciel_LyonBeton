# Lyon Béton API Documentation

This directory contains the OpenAPI documentation for the Lyon Béton e-commerce API.

## 📋 Overview

The Lyon Béton API provides comprehensive endpoints for:

- **Authentication**: User registration, login, password reset, email verification
- **Products**: Product catalog management and browsing
- **Cart**: Shopping cart operations (add, update, remove items)
- **Orders**: Order processing and history tracking
- **Account**: User profile management and settings
- **Admin**: Administrative operations (user/product management)
- **Payments**: Stripe payment processing integration

## 🚀 Accessing the Documentation

### Interactive Swagger UI

The interactive API documentation is available at:
- **Development**: http://localhost:3003/api-docs
- **Production**: https://yourdomain.com/api-docs

### Raw OpenAPI Specification

The OpenAPI JSON specification is available at:
- **Development**: http://localhost:3003/api/docs
- **Production**: https://yourdomain.com/api/docs

### Static YAML File

The source OpenAPI specification is maintained in:
- `docs/openapi.yaml`

## 🔐 Authentication

The API uses session-based authentication via NextAuth.js. Most endpoints require authentication.

### For Admin Users (Development Only)

Admin users will see an "API Docs" link in the header navigation when running in development mode.

### Authentication Methods

1. **Session Cookie**: Automatic authentication via browser cookies (recommended for browser usage)
2. **Bearer Token**: API token for programmatic access

## 📁 File Structure

```
docs/
├── openapi.yaml          # OpenAPI 3.0 specification
└── README.md            # This documentation

src/
├── app/
│   ├── api-docs/
│   │   └── page.tsx     # Swagger UI React component
│   └── api/
│       └── docs/
│           └── route.ts # API endpoint serving OpenAPI spec
└── lib/
    ├── api-schemas.ts   # Zod schemas and TypeScript types
    └── trpc-openapi.ts  # tRPC to OpenAPI conversion utilities
```

## 🛠️ Development

### Starting the Development Server

```bash
npm run dev
```

The API documentation will be available at http://localhost:3003/api-docs

### Updating the Documentation

The OpenAPI specification is maintained in `docs/openapi.yaml`. After making changes:

1. Restart the development server
2. The documentation will automatically reflect your changes

### Adding New Endpoints

When adding new tRPC procedures:

1. Add the corresponding schemas to `src/lib/api-schemas.ts`
2. Update the OpenAPI specification in `docs/openapi.yaml`
3. Test the endpoint documentation in Swagger UI

## 🔧 API Endpoints

### Public Endpoints

- `GET /api/trpc/products.getAll` - List all products
- `GET /api/trpc/products.productByIdentifier` - Get product by identifier
- `POST /api/trpc/auth.register` - User registration
- `POST /api/trpc/auth.requestPasswordReset` - Password reset request

### Protected Endpoints (Authentication Required)

- `GET /api/trpc/cart.getCurrent` - Get current cart
- `POST /api/trpc/cart.addToCart` - Add item to cart
- `GET /api/trpc/orders.getUserOrders` - Get user orders
- `GET /api/trpc/account.getProfile` - Get user profile
- `PUT /api/trpc/account.updateProfile` - Update user profile

### Admin Endpoints (Admin Role Required)

- `GET /api/trpc/admin.getAllUsers` - List all users
- `POST /api/trpc/admin.createProduct` - Create new product
- `PUT /api/trpc/admin.promoteUser` - Update user role
- `GET /api/trpc/admin.getAuditLogs` - Get audit logs

### Payment Endpoints

- `POST /api/stripe/checkout` - Create Stripe checkout session

## 📊 Response Formats

### Success Response

```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": {
    "field": "validation error"
  }
}
```

### Paginated Response

```json
{
  "items": [...],
  "totalCount": 100,
  "totalPages": 10,
  "currentPage": 1,
  "limit": 10
}
```

## 🔍 Testing the API

### Using Swagger UI

1. Navigate to `/api-docs`
2. Click on any endpoint to expand it
3. Click "Try it out"
4. Fill in the required parameters
5. Click "Execute" to test the endpoint

### Using cURL

```bash
# Get all products
curl -X GET "http://localhost:3003/api/trpc/products.getAll"

# Get API documentation
curl -X GET "http://localhost:3003/api/docs"
```

### Using Postman

1. Import the OpenAPI specification from `/api/docs`
2. Postman will automatically generate a collection with all endpoints
3. Configure authentication as needed

## 🎯 Features

- **Interactive Testing**: Test all endpoints directly from the documentation
- **Request/Response Examples**: See example payloads for all endpoints
- **Schema Validation**: All request/response schemas are documented
- **Authentication Integration**: Session-based authentication support
- **Error Handling**: Comprehensive error response documentation
- **Search and Filter**: Find endpoints quickly using the search feature

## 📝 Support

For API support or questions:
- Email: support@lyonbeton.com
- Documentation Issues: Create an issue in the project repository

## 🔄 Updates

This documentation is automatically generated and stays in sync with the codebase. When API changes are made, the documentation is updated accordingly.