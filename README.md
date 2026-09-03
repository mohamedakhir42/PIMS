# PIMS - Phosboucraa Inventory Management System

A comprehensive web-based inventory management system built with FastAPI, React, and PostgreSQL.

## Architecture

```
PIMS/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── main.py      # Application entry point
│   │   ├── core/        # Configuration and security
│   │   ├── db/          # Database configuration
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── api/         # API endpoints
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utilities
│   ├── alembic/         # Database migrations
│   ├── requirements.txt # Python dependencies
│   ├── Dockerfile       # Backend Docker configuration
│   └── .env.example    # Environment variables template
│
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── layouts/     # Layout components
│   │   ├── services/    # API services
│   │   ├── hooks/       # Custom hooks
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Utilities
│   ├── package.json     # Node dependencies
│   ├── Dockerfile       # Frontend Docker configuration
│   └── .env.example    # Environment variables template
│
└── docker-compose.yml   # Docker Compose configuration
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (Neon recommended)
- Docker and Docker Compose (optional)

## Installation

### STEP 1 — Configuration `.env`

#### Backend (.env)
Copy `backend/.env.example` to `backend/.env` and fill in the following variables:

```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30
CLOUDFLARE_IMAGE_BASE_URL=https://your-cloudflare-url.com
```

**Important:** For Neon PostgreSQL, your DATABASE_URL will look like:
```
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

#### Frontend (.env)
Copy `frontend/.env.example` to `frontend/.env` and fill in:

```bash
VITE_API_URL=http://localhost:8000/api/v1
```

### STEP 2 — Installation des dépendances

#### Backend
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
```

### STEP 3 — Database Neon

1. Create a Neon PostgreSQL account at https://neon.tech
2. Create a new project/database
3. Copy the connection string from Neon dashboard
4. Paste it as `DATABASE_URL` in `backend/.env`

**Note:** The connection string should include `?sslmode=require` for secure connection.

### STEP 4 — Migrations

After configuring DATABASE_URL, run the following commands from the backend directory:

```bash
cd backend

# Generate initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### STEP 4.5 — Seed Database (Optional)

To create initial data including admin user, roles, permissions, and sample data:

```bash
cd backend
python seed.py
```

This will create:
- Admin user (username: `admin`, password: `admin123`)
- All required permissions
- Admin and Manager roles
- Sample categories
- Sample supplier

**⚠️ Important:** Change the admin password after first login!

### STEP 5 — Backend

Start the FastAPI backend server:

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at: http://localhost:8000

### STEP 6 — Frontend

Start the React development server:

```bash
cd frontend
npm run dev
```

The frontend will be available at: http://localhost:3000

### STEP 7 — Docker

If you prefer using Docker Compose:

1. Create a `.env` file in the project root with your environment variables
2. Run:

```bash
docker-compose up --build
```

This will start both backend and frontend services.

### STEP 8 — Accès

After starting the services:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation (Swagger):** http://localhost:8000/docs
- **API Documentation (ReDoc):** http://localhost:8000/redoc

## Création d'un utilisateur administrateur

Currently, you need to create users directly in the database or via API. A seed script will be provided in future updates.

For now, you can create a user using the API:

```bash
# First, you'll need to create roles and permissions via the database
# Then create a user with admin role
```

## URLs de l'application

- **Login Page:** http://localhost:3000/login
- **Dashboard:** http://localhost:3000/dashboard
- **Articles:** http://localhost:3000/inventory/articles
- **Stock:** http://localhost:3000/inventory/stock
- **Categories:** http://localhost:3000/categories
- **Suppliers:** http://localhost:3000/suppliers
- **Movements:** http://localhost:3000/movements

## Documentation API

The API documentation is automatically generated and available at:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Main API Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

#### Articles
- `GET /api/v1/articles` - List articles
- `GET /api/v1/articles/{id}` - Get article details
- `POST /api/v1/articles` - Create article
- `PATCH /api/v1/articles/{id}` - Update article

#### Categories
- `GET /api/v1/categories` - List categories
- `GET /api/v1/categories/{id}` - Get category details
- `POST /api/v1/categories` - Create category
- `PATCH /api/v1/categories/{id}` - Update category

#### Suppliers
- `GET /api/v1/suppliers` - List suppliers
- `GET /api/v1/suppliers/{id}` - Get supplier details
- `POST /api/v1/suppliers` - Create supplier
- `PATCH /api/v1/suppliers/{id}` - Update supplier

#### Stock
- `GET /api/v1/stock` - List stock
- `GET /api/v1/stock/critical` - Get critical stock
- `GET /api/v1/stock/movements` - List movements
- `POST /api/v1/stock/receipt` - Create receipt
- `POST /api/v1/stock/issue` - Create issue
- `POST /api/v1/stock/transfer` - Create transfer
- `POST /api/v1/stock/adjustment` - Create adjustment

## Database Models

The application includes the following main entities:

- **Users & Authentication:** users, roles, permissions, role_permissions
- **Organization:** sites, warehouses, zones, locations
- **Inventory:** categories, articles, suppliers, article_suppliers
- **Stock Management:** stock, stock_movements
- **Requests:** stock_requests, stock_request_items
- **Inventory:** inventories, inventory_items
- **System:** notifications, attachments, audit_logs

## Features Implemented

### MVP Features
- ✅ JWT Authentication
- ✅ User Roles and Permissions (RBAC)
- ✅ Article Management (CRUD)
- ✅ Category Management (CRUD)
- ✅ Supplier Management (CRUD)
- ✅ Stock Management
- ✅ Stock Movements (Receipt, Issue, Transfer, Adjustment)
- ✅ Dashboard with KPIs and Charts
- ✅ Responsive UI with Bootstrap

### Future Features
- Stock Requests and Approval Workflow
- Physical Inventory Management
- Advanced Reporting
- QR Code/Barcode Scanning
- Document Attachments
- Advanced Notifications
- Audit Logs UI

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control (RBAC)
- CORS protection
- SQL injection prevention via SQLAlchemy ORM

## Development

### Backend Development
```bash
cd backend
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Running Tests
```bash
# Backend tests (to be implemented)
cd backend
pytest

# Frontend tests (to be implemented)
cd frontend
npm test
```

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is correctly configured
- Check that your Neon database is active
- Verify SSL mode is set to `require` for Neon

### CORS Issues
- Ensure frontend API URL matches backend URL
- Check CORS configuration in backend

### Migration Issues
- Ensure Alembic is properly configured
- Check that DATABASE_URL is set before running migrations

## License

This project is developed for Phosboucraa inventory management purposes.

## Support

For issues and questions, please refer to the project documentation or contact the development team.
