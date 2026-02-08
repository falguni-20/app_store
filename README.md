# Multi-Tenant App Store

A comprehensive multi-tenant application store that enables organizations to manage and distribute applications across multiple institutes and departments.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [User Roles & Permissions](#user-roles--permissions)
- [API Documentation](#api-documentation)
- [Frontend Structure](#frontend-structure)
- [Seed Data](#seed-data)
- [Development](#development)

## Architecture Overview

The multi-tenant app store follows a hierarchical structure:

```
Platform Level
├── Platform Super Admin (Manages all apps)
└── Organizations
    ├── Organization Admin (Manages institutes and users within org)
    └── Institutes
        ├── Institute Admin (Manages apps within institute)
        └── Users
```

### Key Concepts:
- **Platform Super Admin**: Creates and manages applications for the entire platform
- **Organization Admin**: Manages institutes, users, and app installations within their organization
- **Institute Admin**: Manages applications within specific institutes
- **Users**: End-users who can access installed applications

## Features

### Platform Management
- Centralized application management by platform super admin
- Application creation, categorization, and distribution

### Organization Management
- Multiple organizations with isolated data
- Organization-level user management
- Institute creation and management
- Cross-institute application management

### Institute Management
- Multiple institutes per organization
- Institute-specific application installations
- Role-based access control

### Application Management
- Application lifecycle management
- Per-institute application configuration
- Permission-based access control
- Real-time application launching

### Analytics & Monitoring
- Application usage analytics
- User engagement metrics
- Performance monitoring

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma ORM** - Database management
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **React** - UI Library
- **Vite** - Build tool
- **React Router** - Routing
- **Zustand** - State management
- **TanStack Query** - Server state management
- **Axios** - HTTP client

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd app_store
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
```bash
# Backend (.env)
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
PORT=

# Frontend (.env)
VITE_BASE_URL=
```

5. Set up the database:
```bash
# From backend directory
npx prisma migrate dev
npx prisma db seed
```

6. Start the backend:
```bash
cd backend
npm run dev
```

7. Start the frontend:
```bash
cd frontend
npm run dev
```

## Database Schema

### Core Models

#### User
- `id`: Integer (Primary Key)
- `name`: String
- `email`: String (Unique)
- `password`: String
- `createdAt`: DateTime

#### Organization
- `id`: Integer (Primary Key)
- `name`: String
- `createdAt`: DateTime

#### Institute
- `id`: Integer (Primary Key)
- `name`: String
- `organizationId`: Integer (Foreign Key)
- `createdAt`: DateTime

#### UserOrganization (Junction Table)
- `id`: Integer (Primary Key)
- `userId`: Integer (Foreign Key)
- `organizationId`: Integer (Foreign Key)
- `role`: Enum (SUPER_ADMIN, ORG_ADMIN, USER)

#### UserInstitute (Junction Table)
- `id`: Integer (Primary Key)
- `userId`: Integer (Foreign Key)
- `instituteId`: Integer (Foreign Key)
- `role`: Enum (INSTITUTE_ADMIN, USER)

#### App
- `id`: Integer (Primary Key)
- `name`: String
- `description`: String
- `category`: String
- `launchUrl`: String
- `webhookUrl`: String
- `logoUrl`: String (Optional)
- `webhookSecret`: String (Optional)
- `requiredPermissions`: Json
- `createdAt`: DateTime

#### InstituteInstalledApp
- `id`: Integer (Primary Key)
- `instituteId`: Integer (Foreign Key)
- `appId`: Integer (Foreign Key)
- `settings`: Json
- `enabled`: Boolean (Default: true)
- `installedAt`: DateTime
- `installedBy`: Integer (Foreign Key to User)

#### WebhookLog
- `id`: Integer (Primary Key)
- `instituteId`: Integer (Foreign Key)
- `appId`: Integer (Foreign Key)
- `payload`: Json
- `statusCode`: Integer
- `receivedAt`: DateTime

## User Roles & Permissions

### Platform Super Admin
- **Role**: SUPER_ADMIN
- **Scope**: Platform-wide
- **Permissions**:
  - Create and manage all applications
  - Access all organizations and institutes
  - View all analytics

### Organization Admin
- **Role**: ORG_ADMIN
- **Scope**: Single organization
- **Permissions**:
  - Manage institutes within organization
  - Manage users within organization
  - Install/uninstall applications in organization's institutes
  - Configure application settings

### Institute Admin
- **Role**: INSTITUTE_ADMIN
- **Scope**: Single institute
- **Permissions**:
  - Install/uninstall applications in institute
  - Configure application settings
  - Manage institute users

### Regular User
- **Role**: USER
- **Scope**: Assigned institutes
- **Permissions**:
  - Access installed applications
  - Use applications based on granted permissions

## API Documentation

### Authentication
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/refresh-token` - Refresh access token

### Applications
- **GET** `/api/apps` - Get installed apps for current institute
- **GET** `/api/view/apps` - Get all available apps
- **GET** `/api/apps/details/:appId` - Get app details
- **GET** `/api/apps/:appId/launch` - Launch an app
- **POST** `/api/institute/apps/install` - Install an app
- **PUT** `/api/institute/apps/:appId/configure` - Configure app settings
- **DELETE** `/api/institute/apps/:appId/uninstall` - Uninstall an app
- **PATCH** `/api/institute/apps/:appId/status` - Toggle app status

### Organizations
- **GET** `/api/organizations` - Get all organizations (for SUPER_ADMIN)
- **GET** `/api/organizations/:orgId/institutes` - Get institutes in organization
- **POST** `/api/organizations/:orgId/institutes` - Create institute
- **GET** `/api/organizations/:orgId/users` - Get users in organization
- **POST** `/api/organizations/:orgId/users/invite` - Invite user to organization

## Frontend Structure

```
frontend/
├── src/
│   ├── api/                 # API client configuration
│   ├── assets/              # Static assets
│   ├── guards/              # Route protection
│   ├── lib/                 # Utility functions
│   ├── pages/               # Page components
│   │   ├── AdminApps.jsx    # Platform admin app management
│   │   ├── AppAnalytics.jsx # Analytics dashboard
│   │   ├── AppDetailPage.jsx # App detail view
│   │   ├── AppStore.jsx     # App store interface
│   │   ├── Dashboard.jsx    # User dashboard
│   │   ├── InstituteApps.jsx # Institute admin app management
│   │   ├── Login.jsx        # Login page
│   │   ├── OrganizationAdmin.jsx # Organization admin panel
│   │   ├── OrganizationInstitutes.jsx # Institute selection
│   │   ├── OrganizationSelector.jsx # Organization selection
│   │   ├── TenantSelect.jsx # Tenant selection
│   │   └── UserSettings.jsx # User settings
│   ├── store/               # Zustand stores
│   │   ├── authStore.js     # Authentication state
│   │   └── tenantStore.js   # Tenant selection state
│   ├── validation/          # Validation schemas
│   ├── App.jsx              # Main routing component
│   └── main.jsx             # Entry point
```

## Seed Data

The application comes with pre-configured seed data:

### Platform Super Admin
- Email: `platform.superadmin@example.com`
- Password: `password123`
- Role: SUPER_ADMIN in all organizations

### Organization Admins
- Org Admin 1: `org.admin1@example.com` (Technology Solutions Inc.)
- Org Admin 2: `org.admin2@example.com` (Healthcare Systems Ltd.)
- Org Admin 3: `org.admin3@example.com` (Finance & Co.)
- Password: `password123` for all

### Applications
- CRM System
- Project Management
- HR Portal
- Business Analytics
- Electronic Medical Records
- Online Banking Portal

## Development

### Backend Development
- Run in development mode: `npm run dev`
- Run tests: `npm test`
- Generate Prisma client: `npx prisma generate`
- Deploy migrations: `npx prisma db push`

### Frontend Development
- Run in development mode: `npm run dev`
- Build for production: `npm run build`
- Run tests: `npm run test`
- Lint code: `npm run lint`

### Adding New Features
1. Update Prisma schema if adding new database entities
2. Run `npx prisma migrate dev` to create migration
3. Create backend API endpoints
4. Create frontend components
5. Update documentation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.