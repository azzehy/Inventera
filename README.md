# Inventera

<div align="center">
<img width="225" height="225" alt="Image" src="https://github.com/user-attachments/assets/41488614-f823-4943-a45d-117bbbd4f1e2" />
</div>
<div align="center">
  <h3>A comprehensive, scalable, and secure SAAS inventory management platform with advanced features for enterprise-level operations</h3>
</div>

---

## 📋 Table of Contents

- [🏗️ Software Architecture](#-software-architecture)
- [🐳 Docker Configuration](#-docker-configuration)
- [💻 Frontend Application](#-frontend-application)
- [🔙 Backend API](#-backend-api)
- [🚀 Getting Started](#-getting-started)
- [✨ Features](#-features)
- [🔑 Environment Variables](#-environment-variables)
- [🤝 Contributing](#-contributing)


---

## 🏗️ Software Architecture

The Inventera platform is built with a modern, scalable architecture consisting of:

### Architecture Components
<div align="center">
<img width="2456" height="895" alt="architecture" src="https://github.com/user-attachments/assets/67038994-91d6-4284-9ebd-3019892314c8" />

</div>

### Key Technologies

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React 18, Tailwind CSS, Axios, React Router, Recharts |
| **Backend** | Spring Boot 3.3.5, Java 21, Spring Security, JPA/Hibernate |
| **Database** | MySQL 8.0 |
| **Authentication** | JWT (JSON Web Tokens) |
| **Security** | Spring Security, Password Encryption |
| **File Storage** | Cloudinary CDN |
| **Payment Processing** | Stripe API Integration |
| **Email Service** | Gmail SMTP with Thymeleaf Templates |
| **Containerization** | Docker & Docker Compose |

---

## 🐳 Docker Configuration

The entire application stack is containerized for consistent deployment across environments.

### Architecture

```yaml
Services:
  - MySQL Database (MySQL 8.0 Alpine)
  - Spring Boot Backend API (Java 21)
  - React Frontend (Node.js)
```

### Prerequisites

- Docker Desktop (includes Docker and Docker Compose)
- For environment variables, see [Environment Variables](#-environment-variables)

### Running with Docker

1. **Clone and setup environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials (Cloudinary, Stripe, Email)
   ```

2. **Build and start all services**:
   ```bash
   docker-compose up --build
   ```

3. **Access the applications**:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5050
   - **MySQL Database**: localhost:3306

4. **Stop the services**:
   ```bash
   docker-compose down
   ```

### Individual Docker Builds

**Backend:**
```bash
cd backend
docker build -t inventera-backend .
docker run -p 5050:5050 inventera-backend
```

**Frontend:**
```bash
cd frontend
docker build -t inventera-frontend .
docker run -p 3000:3000 inventera-frontend
```

### Docker Compose Configuration Highlights

- **Multi-stage builds**: Optimized image sizes with separate builder and runtime stages
- **Health checks**: Automatic service health monitoring
- **Networking**: Custom bridge network for inter-service communication
- **Volumes**: Persistent MySQL data storage
- **Environment variables**: Externalized configuration for sensitive data

---

## 💻 Frontend Application

### 🎯 Overview

A modern, responsive React dashboard for inventory management with real-time analytics and intuitive user interfaces.

### 🛠 Technologies

- **React 18**: Modern component-based UI library
- **React Router**: Client-side navigation
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Recharts**: Data visualization for analytics
- **Axios**: HTTP client for API communication
- **Crypto-JS**: Secure data encryption

### 🔑 Features

#### Dashboard & Analytics
- 📊 **Real-time Dashboard**: View key metrics at a glance
- 📈 **Sales Analytics**: Track revenue, orders, and performance trends
- 📉 **Visual Reports**: Interactive charts and graphs using Recharts
- 👥 **User Metrics**: Monitor active users and engagement

#### Inventory Management
- 📦 **Product Management**: Create, update, delete products
- 🏷️ **Category Management**: Organize products by categories
- 📸 **Image Management**: Upload and manage product images via Cloudinary
- 📊 **Stock Tracking**: Real-time inventory level monitoring
- 🔍 **Search & Filter**: Quick product discovery

#### Business Partners & Transactions
- 🤝 **Partner Management**: Manage suppliers and business partners
- 📋 **Transaction Tracking**: Record and monitor all transactions
- 💳 **Payment Integration**: Stripe-powered payment processing
- 📧 **Transaction Notifications**: Email confirmations and updates

#### Enterprise Management
- 🏢 **Multi-Enterprise Support**: Manage multiple business units
- 👤 **User Management**: Control user accounts and permissions
- 🔐 **Role-Based Access**: Admin, Manager, and User roles
- 📄 **Profile Management**: User profile and avatar management

### 🛠 Setup Instructions

```bash
cd frontend

# Install dependencies
npm install

# Development mode
npm start
# Runs on http://localhost:3000

# Production build
npm run build

# Docker setup
docker build -t inventera-frontend .
docker run -p 3000:3000 inventera-frontend
```

---

## 🔙 Backend API

### 🎯 Overview

A robust Spring Boot REST API providing comprehensive inventory management, user authentication, payment processing, and enterprise management capabilities.

### 🛠 Technologies

- **Spring Boot 3.3.5**: Modern Java framework for building REST APIs
- **Java 21**: Latest LTS version with performance improvements
- **Spring Security**: Authentication and authorization
- **Spring Data JPA**: Database ORM and query management
- **MySQL 8.0**: Relational database
- **JWT**: Stateless authentication tokens
- **Stripe Java SDK**: Payment processing integration
- **Cloudinary HTTP44**: Image storage and CDN
- **Thymeleaf**: Email template engine
- **Jakarta Mail**: Email service provider

### 🔒 Key Features

#### 1. Authentication & Security
- **JWT-Based Authentication**: Secure, stateless token-based auth
- **Password Encryption**: Industry-standard bcrypt hashing
- **Role-Based Access Control**: Admin, Manager, and User roles
- **Request Validation**: Input validation and error handling
- **CORS Support**: Cross-origin resource sharing for frontend

#### 2. Inventory Management
- **RESTful APIs**: Full CRUD operations for products and categories
- **Stock Management**: Track inventory levels
- **Product Details**: Comprehensive product information storage
- **Search & Filtering**: Advanced query capabilities

#### 3. Business Partner Management
- **Supplier Management**: Register and manage suppliers
- **Partner Details**: Store partner information and contact details
- **Transaction Tracking**: Record all business transactions

#### 4. Payment Integration
- **Stripe SDK Integration**: Secure payment processing
- **Payment Intent Creation**: Support for various payment methods
- **Webhook Handling**: Real-time payment status updates
- **Order Processing**: Automatic inventory updates on purchase

#### 5. Image Management
- **Cloudinary Integration**: Cloud-based image storage
- **Auto-Optimization**: Automatic image resizing and optimization
- **CDN Delivery**: Fast, globally distributed image delivery
- **Multiple Upload Support**: Handle product and avatar images

#### 6. Email Service
- **Gmail SMTP Integration**: Send transactional emails
- **Thymeleaf Templates**: Professional HTML email templates
- **Account Notifications**: Password reset, verification emails
- **Transaction Emails**: Order confirmations and updates

#### 7. Enterprise Management
- **Multi-Enterprise Support**: Isolated data per enterprise
- **Organization Details**: Store company information
- **Subscription Management**: Enterprise subscription tracking
- **User Management**: Manage enterprise users and permissions

### 🛠 Setup Instructions

```bash
cd backend

# Build with Maven
mvn clean install

# Development mode
mvn spring-boot:run

# Production build
mvn clean package

# Docker setup
docker build -t inventera-backend .
docker run -p 5050:5050 inventera-backend

# Using Docker Compose (full stack)
cd ..
docker-compose up --build
```

### Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| GET | `/api/categories` | List categories |
| GET | `/api/transactions` | Get transactions |
| POST | `/api/stripe/create-intent` | Create payment intent |
| GET | `/api/users` | List users (Admin only) |
| PUT | `/api/enterprise` | Update enterprise details |

---

## 🚀 Getting Started

### ✅ Prerequisites

1. **Java Development**:
   - Java 21 JDK installed
   - Maven 3.9+ installed

2. **Node.js & Frontend**:
   - Node.js 20+ and npm installed

3. **Docker (Optional but recommended)**:
   - Docker Desktop installed with Docker Compose

4. **Database**:
   - MySQL 8.0 (or use Docker for automated setup)

5. **Third-party Services**:
   - Cloudinary account (for image storage)
   - Stripe API keys (for payment processing)
   - Gmail app password (for email service)

### 🔧 Step-by-Step Setup

#### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/azzehy/Inventera.git
cd Inventera

# 2. Create .env file with your credentials
cp .env.example .env
# Edit .env with:
# - MAIL_USERNAME=your-gmail@gmail.com
# - MAIL_PASSWORD=your-app-password
# - CLOUDINARY_CLOUD_NAME=your-cloud-name
# - CLOUDINARY_API_KEY=your-api-key
# - CLOUDINARY_API_SECRET=your-api-secret
# - STRIPE_API_KEY=your-stripe-key

# 3. Start all services
docker-compose up --build

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5050
```

#### Option 2: Local Development

```bash
# Backend Setup
cd backend
mvn clean install
# Update src/main/resources/application.properties with your credentials
mvn spring-boot:run

# Frontend Setup (in another terminal)
cd frontend
npm install
npm start
```

### 📲 First Steps

1. **Access the frontend**: Open http://localhost:3000
2. **Create an account**: Register with email and password
3. **Login**: Use your credentials to access the dashboard
4. **Set up enterprise**: Complete enterprise/organization setup
5. **Start managing**: Add products, partners, and manage inventory

---

## ✨ Features

### 📦 Inventory Management
- ✅ Product CRUD operations with categories
- ✅ Real-time stock tracking
- ✅ Bulk operations support
- ✅ Product image management
- ✅ Flexible search and filtering

### 💼 Business Operations
- ✅ Supplier/Partner management
- ✅ Transaction tracking and history
- ✅ Sales order processing
- ✅ Purchase order management
- ✅ Automated transaction notifications

### 💳 Payment Processing
- ✅ Stripe integration for secure payments
- ✅ Multiple payment methods support
- ✅ Real-time transaction status updates
- ✅ Webhook-based payment confirmation
- ✅ Automatic inventory adjustment on payment

### 👥 User Management
- ✅ Role-based access control (RBAC)
- ✅ Multi-user support per enterprise
- ✅ User permissions management
- ✅ Profile customization
- ✅ Avatar support with Cloudinary

### 🏢 Enterprise Management
- ✅ Multi-enterprise support
- ✅ Enterprise profile management
- ✅ Custom branding options
- ✅ Isolated data per enterprise
- ✅ Subscription/licensing management

### 🔐 Security
- ✅ JWT-based authentication
- ✅ Password encryption (bcrypt)
- ✅ CORS protection
- ✅ Input validation
- ✅ Rate limiting ready

### 📊 Analytics & Reporting
- ✅ Sales dashboard with KPIs
- ✅ Real-time inventory insights
- ✅ Transaction history and filtering
- ✅ Visual charts and graphs
- ✅ Export-ready data formats

### 📧 Communication
- ✅ Email notifications for transactions
- ✅ Password reset emails
- ✅ Account verification
- ✅ HTML email templates
- ✅ Async email processing

---

## 🔑 Environment Variables


### Docker Compose Environment

Create `.env` file in the root directory:

```env
# Email Configuration
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe Configuration
STRIPE_API_KEY=your-stripe-secret-key
```

### Getting API Keys

1. **Gmail App Password**:
   - Enable 2-factor authentication on Google Account
   - Generate app-specific password from https://myaccount.google.com/apppasswords

2. **Cloudinary**:
   - Sign up at https://cloudinary.com
   - Get API keys from your Dashboard

3. **Stripe**:
   - Create account at https://stripe.com
   - Get secret key from Developer Dashboard


---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Getting Started with Contributions

1. **Fork the repository**
   ```bash
   git clone https://github.com/azzehy/Inventera.git
   cd Inventera
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make your changes and commit**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to your branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Ensure tests pass

### Code Guidelines

- Follow Java conventions for backend code
- Use React best practices for frontend components
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes before submitting

### Reporting Issues

1. Check if the issue already exists
2. Provide detailed description
3. Include steps to reproduce
4. Attach relevant logs or screenshots

---

## 🌟 Future Enhancements

- [ ] Real-time notifications with WebSocket
- [ ] Mobile app (React Native or Flutter)
- [ ] Advanced analytics and reporting dashboards
- [ ] Multi-language support (i18n)
- [ ] Blockchain integration for supply chain tracking
- [ ] AI-powered demand forecasting
- [ ] Advanced warehouse management features
- [ ] Batch import/export functionality
- [ ] Two-factor authentication (2FA)
- [ ] Audit logging and compliance reports

---

<div align="center">
  <p>Built with ❤️ for efficient inventory management</p>
  <p><strong>Inventera - Smart Inventory, Smart Business</strong></p>
</div>
