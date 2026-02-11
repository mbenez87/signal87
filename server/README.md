# Signal87 Backend API

Signal87 Backend serves as the API server for the Signal87 AI platform, handling document management, user authentication, and integration with base44.

## Quick Start

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### Development

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Documents
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get single document
- `POST /api/documents` - Create document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/search` - Search documents

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

## Database

The backend uses MongoDB. Ensure MongoDB is running locally or update the `MONGODB_URI` in `.env`.

## Features

- Express.js REST API
- MongoDB with Mongoose ODM
- JWT authentication
- Real-time features with Socket.io
- File upload support
- Document classification and tagging
- Error handling middleware
- CORS support

## Architecture

```
server/
├── src/
│   ├── config/          # Database and config files
│   ├── middleware/      # Express middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   └── index.ts         # Entry point
├── dist/                # Compiled output
├── package.json
└── tsconfig.json
```