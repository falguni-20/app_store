# Multi-Tenant App Store - Technical Documentation

## API Specification

### Base URL
All API endpoints are prefixed with `/api`

### Authentication
Most endpoints require authentication using JWT tokens. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Some endpoints also require tenant identification headers:
- `x-org-id`: Organization ID
- `x-institute-id`: Institute ID

### Common Response Formats

#### Success Response
```json
{
  "data": { /* response data */ }
}
```

#### Error Response
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Authentication Endpoints

### POST /auth/login
Authenticate a user and return tokens.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": integer,
    "email": "string",
    "name": "string",
    "organizations": [
      {
        "orgId": integer,
        "orgName": "string",
        "role": "SUPER_ADMIN|ORG_ADMIN|USER"
      }
    ],
    "institutes": [
      {
        "instituteId": integer,
        "instituteName": "string",
        "organizationId": integer,
        "role": "INSTITUTE_ADMIN|USER"
      }
    ]
  }
}
```

### POST /auth/refresh-token
Refresh the access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token",
  "user": { /* user object */ }
}
```

## Application Endpoints

### GET /apps
Get all installed applications for the current institute.

**Headers Required:**
- `x-org-id`
- `x-institute-id`
- `Authorization`

**Response:**
```json
[
  {
    "id": integer,
    "app": { /* app object */ },
    "settings": {},
    "enabled": boolean,
    "installedAt": "datetime",
    "installedBy": integer
  }
]
```

### GET /view/apps
Get all available applications (not installed).

**Headers Required:**
- `x-org-id`
- `x-institute-id`
- `Authorization`

**Response:**
```json
[
  {
    "id": integer,
    "name": "string",
    "description": "string",
    "category": "string",
    "launchUrl": "string",
    "webhookUrl": "string",
    "logoUrl": "string",
    "requiredPermissions": {}
  }
]
```

### GET /apps/details/:appId
Get detailed information about a specific application.

**URL Parameters:**
- `appId`: Application ID

**Headers Required:**
- `x-org-id`
- `x-institute-id`
- `Authorization`

**Response:**
```json
{
  "id": integer,
  "name": "string",
  "description": "string",
  "category": "string",
  "launchUrl": "string",
  "webhookUrl": "string",
  "logoUrl": "string",
  "requiredPermissions": {},
  "createdAt": "datetime"
}
```

### GET /apps/:appId/launch
Generate a launch token for an application.

**URL Parameters:**
- `appId`: Application ID

**Headers Required:**
- `x-org-id`
- `x-institute-id`
- `Authorization`

**Response:**
```json
{
  "name": "string",
  "launchUrl": "string",
  "launchToken": "jwt_token"
}
```

### POST /institute/apps/install
Install an application in the current institute.

**Headers Required:**
- `x-org-id`
- `x-institute-id`
- `Authorization`

**Request Body:**
```json
{
  "appId": integer,
  "settings": {}
}
```

**Response:**
```json
{
  "id": integer,
  "instituteId": integer,
  "appId": integer,
  "settings": {},
  "enabled": true,
  "installedAt": "datetime",
  "installedBy": integer
}
```

### PUT /institute/apps/:appId/configure
Update configuration for an installed application.

**URL Parameters:**
- `appId`: Application ID

**Headers Required:**
- `x-org-id`
- `x-institute-id`
- `Authorization`

**Request Body:**
```json
{
  "settings": {}
}
```

**Response:**
```json
{
  "id": integer,
  "instituteId": integer,
  "appId": integer,
  "settings": {},
  "enabled": boolean,
  "installedAt": "datetime",
  "installedBy": integer
}
```

### DELETE /institute/apps/:appId/uninstall
Uninstall an application from the current institute.

**URL Parameters:**
- `appId`: Application ID

**Headers Required:**
- `x-org-id`
- `x-institute-id`
- `Authorization`

### PATCH /institute/apps/:appId/status
Toggle the enabled/disabled status of an installed application.

**URL Parameters:**
- `appId`: Application ID

**Headers Required:**
- `x-org-id`
- `x-institute-id`
- `Authorization`

**Request Body:**
```json
{
  "enabled": boolean
}
```

**Response:**
```json
{
  "id": integer,
  "instituteId": integer,
  "appId": integer,
  "settings": {},
  "enabled": boolean,
  "installedAt": "datetime",
  "installedBy": integer
}
```

## Organization Endpoints

### GET /organizations
Get all organizations (SUPER_ADMIN only).

**Headers Required:**
- `Authorization`

**Response:**
```json
[
  {
    "id": integer,
    "name": "string"
  }
]
```

### GET /organizations/:orgId/institutes
Get all institutes in an organization.

**URL Parameters:**
- `orgId`: Organization ID

**Headers Required:**
- `x-org-id` (must match orgId)
- `Authorization`

**Response:**
```json
[
  {
    "id": integer,
    "name": "string"
  }
]
```

### POST /organizations/:orgId/institutes
Create a new institute in an organization.

**URL Parameters:**
- `orgId`: Organization ID

**Headers Required:**
- `x-org-id` (must match orgId)
- `Authorization`

**Request Body:**
```json
{
  "name": "string"
}
```

**Response:**
```json
{
  "id": integer,
  "name": "string",
  "organizationId": integer,
  "createdAt": "datetime"
}
```

### GET /organizations/:orgId/users
Get all users in an organization.

**URL Parameters:**
- `orgId`: Organization ID

**Headers Required:**
- `x-org-id` (must match orgId)
- `Authorization`

**Response:**
```json
[
  {
    "id": integer,
    "role": "string",
    "user": {
      "id": integer,
      "name": "string",
      "email": "string"
    }
  }
]
```

### POST /organizations/:orgId/users/invite
Invite a user to an organization.

**URL Parameters:**
- `orgId`: Organization ID

**Headers Required:**
- `x-org-id` (must match orgId)
- `Authorization`

**Request Body:**
```json
{
  "email": "string",
  "role": "USER|ORG_ADMIN"
}
```

**Response:**
```json
{
  "id": integer,
  "role": "string",
  "user": {
    "id": integer,
    "name": "string",
    "email": "string"
  }
}
```

## Analytics Endpoints

### GET /analytics/apps
Get analytics for installed applications in the current organization.

**Headers Required:**
- `x-org-id`
- `Authorization`

**Response:**
```json
[
  {
    "id": integer,
    "app": { /* app object */ },
    "institute": { /* institute object */ },
    "usageCount": integer,
    "lastUsed": "datetime",
    "enabled": boolean
  }
]
```

### GET /analytics/apps/:appId/usage
Get detailed usage analytics for a specific application.

**URL Parameters:**
- `appId`: Application ID

**Headers Required:**
- `x-org-id`
- `Authorization`

**Query Parameters:**
- `startDate`: Optional start date
- `endDate`: Optional end date

**Response:**
```json
{
  "totalLaunches": integer,
  "uniqueUsers": integer,
  "avgSessionTime": integer,
  "lastLaunched": "datetime",
  "recentActivity": [
    {
      "timestamp": "datetime",
      "user": "string",
      "action": "string"
    }
  ]
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource does not exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

## Token Payload Structure

### Access Token Payload
```json
{
  "userId": integer,
  "email": "string",
  "role": "SUPER_ADMIN|ORG_ADMIN|INSTITUTE_ADMIN|USER",
  "orgId": integer,
  "instituteId": integer,
  "iat": timestamp,
  "exp": timestamp
}
```

### Launch Token Payload
```json
{
  "appId": integer,
  "userId": integer,
  "orgId": integer,
  "instituteId": integer,
  "permissions": [],
  "settings": {},
  "iat": timestamp,
  "exp": timestamp
}
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Role-based access control ensures users can only access permitted resources
3. **Tenant Isolation**: Headers ensure data isolation between organizations and institutes
4. **Input Validation**: All inputs are validated to prevent injection attacks
5. **Rate Limiting**: API endpoints should implement rate limiting in production
6. **HTTPS**: All API communications should be encrypted in production

## Rate Limits

Default rate limits:
- Authenticated endpoints: 100 requests per minute per user
- Public endpoints: 10 requests per minute per IP

## Pagination

Endpoints that return collections support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Example:
```
GET /api/apps?page=2&limit=20
```

## Filtering and Sorting

Many endpoints support query parameters for filtering and sorting:
- `category`: Filter by category
- `searchTerm`: Search term for text fields
- `sortBy`: Sort by field (default: name)
- `order`: Sort order (asc/desc, default: asc)

## Webhooks

Applications can register webhook endpoints to receive events:
- `webhookUrl`: URL to receive webhook events
- Events: app installation, user actions, etc.

Webhook payloads include:
- `event`: Event type
- `data`: Event-specific data
- `timestamp`: Event timestamp
- `signature`: HMAC signature for verification

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for signing access tokens
- `JWT_REFRESH_SECRET`: Secret for signing refresh tokens
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

### Frontend
- `VITE_BASE_URL`: Backend API URL
- `VITE_APP_NAME`: Application name