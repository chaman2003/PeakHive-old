# PeakHive 🏔️

[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

A premium tech e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js), featuring a responsive design and comprehensive shopping experience.

## 🌐 Live Demo

- **Frontend**: [https://peakhive.vercel.app/](https://peakhive.vercel.app/)
- **Backend API**: [https://peakhive-backend.vercel.app/](https://peakhive-backend.vercel.app/)

![PeakHive Screenshot](https://images.unsplash.com/photo-1468436139062-f60a71c5c892?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1270&h=180&q=80)

## 📋 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Pages](#-pages)
- [Components](#-components)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Development Progress](#-development-progress)
- [Technology Stack](#-technology-stack)
- [API Endpoints](#-api-endpoints)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)

## ✨ Features

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **Consistent UI**: Built with Bootstrap components for a cohesive user experience
- **Interactive Elements**: Dynamic hover effects and transitions
- **Comprehensive E-commerce Flow**: From product browsing to checkout
- **User Authentication**: Login and signup functionality with JWT
- **User Profiles**: Account management and order history
- **Cart System**: Add, remove, and update product quantities
- **Admin Dashboard**: Manage products, orders, and users
- **Payment Processing**: Secure checkout process
- **Order Management**: Track order status and history
- **Product Reviews**: Leave and view product reviews

## 📁 Project Structure

```
PeakHive/
├── public/                # Static assets
├── src/                   # Frontend application code
│   ├── api/               # API service layer
│   ├── assets/            # Application-specific assets
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route-specific page components
│   │   ├── admin/         # Admin dashboard pages
│   ├── redux/             # State management
│   │   ├── slices/        # Redux slices
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main application component and routing
│   └── main.jsx           # Application entry point
├── server/                # Backend application code
│   ├── controllers/       # API route controllers
│   ├── middleware/        # Express middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API route definitions
│   ├── utils/             # Utility functions
│   ├── server.js          # Server entry point
│   └── vercel.json        # Vercel deployment configuration
├── .env                   # Frontend environment variables
├── server/.env            # Backend environment variables
└── package.json           # Project dependencies and scripts
```

## 📱 Pages

| Page | Description |
|------|-------------|
| **Home** | Landing page with hero section, featured categories, and promotional content |
| **Products** | Product listing with filtering and sorting options |
| **Product Detail** | Comprehensive product information, images, specs, and reviews |
| **Login/Register** | User authentication with form validation |
| **Cart** | Shopping cart with product listings, quantity adjustment, and price calculations |
| **Checkout** | Order completion with shipping and payment information |
| **Profile** | User account management and order history |
| **Order History** | List of past orders with status and details |
| **Order Details** | Detailed view of a specific order |
| **Admin Dashboard** | Overview of store performance metrics |
| **Admin Products** | Manage product listings (add, edit, delete) |
| **Admin Orders** | Process and manage customer orders |
| **Admin Users** | Manage user accounts and permissions |
| **Admin Reviews** | Moderate product reviews |

## 🚀 Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm or yarn
- MongoDB account or local installation

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/chaman2003/PeakHive.git
   cd PeakHive
   ```

2. Install frontend dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Install backend dependencies
   ```bash
   cd server
   npm install
   # or
   yarn install
   ```

4. Set up environment variables (see [Environment Variables](#-environment-variables) section)

5. Start the backend development server
   ```bash
   cd server
   npm run dev
   # or
   yarn dev
   ```

6. Start the frontend development server (in a new terminal)
   ```bash
   # From the root directory
   npm run dev
   # or
   yarn dev
   ```

7. Open your browser and navigate to `http://localhost:5173`

## 🔐 Environment Variables

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api  # Development
# VITE_API_URL=https://peakhive-backend.vercel.app/api  # Production
VITE_NODE_ENV=development  # or production
```

### Backend (server/.env)

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development  # or production
PORT=5000
```

## 🚀 Deployment

The application is deployed on Vercel with separate projects for frontend and backend.

### Frontend Deployment

1. Push your code to GitHub
2. Create a new project in Vercel
3. Connect your GitHub repository
4. Set the following settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Add environment variables:
   - `VITE_API_URL=https://peakhive-backend.vercel.app/api`
   - `VITE_NODE_ENV=production`
6. Deploy

### Backend Deployment

1. Create a new project in Vercel
2. Connect your GitHub repository
3. Set the following settings:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Output Directory: `.`
4. Add environment variables:
   - `MONGO_URI=your_mongodb_connection_string`
   - `JWT_SECRET=your_jwt_secret`
   - `NODE_ENV=production`
5. Deploy

### Connecting Frontend and Backend

The frontend and backend are connected through API calls. The frontend's `.env` file or Vercel environment variables should have the `VITE_API_URL` pointing to the deployed backend API URL.

## 📈 Development Progress

### Completed
- ✅ Initial project setup and architecture
- ✅ Frontend user interface with responsive design
- ✅ Backend API implementation
- ✅ User authentication and authorization
- ✅ Product management and display
- ✅ Shopping cart functionality
- ✅ Checkout process
- ✅ Order management
- ✅ Admin dashboard
- ✅ Deployment to Vercel

### In Progress
- 🔄 Payment gateway integration
- 🔄 Email notifications
- 🔄 Performance optimizations
- 🔄 Unit and integration testing

### Planned
- ⏳ Advanced search functionality
- ⏳ User reviews and ratings system
- ⏳ Wishlist feature
- ⏳ Social media integration
- ⏳ Analytics dashboard

## 💻 Technology Stack

### Frontend
- **Framework**: React 18
- **State Management**: Redux Toolkit
- **UI Framework**: Bootstrap 5
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express Validator

### Deployment
- **Platform**: Vercel
- **Database Hosting**: MongoDB Atlas
- **Environment**: Node.js (Serverless)

## 🔌 API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create a product (admin)
- `PUT /api/products/:id` - Update a product (admin)
- `DELETE /api/products/:id` - Delete a product (admin)

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/deliver` - Update order to delivered
- `GET /api/orders/admin` - Get all orders (admin)
- `PUT /api/orders/:id/refund` - Refund an order (admin)

### Reviews
- `GET /api/reviews` - Get all reviews
- `POST /api/products/:id/reviews` - Create product review
- `DELETE /api/reviews/:id` - Delete review (admin)

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

## 🔮 Future Enhancements

1. **Advanced Search**: Implement full-text search with filters
2. **Social Login**: Add Google, Facebook, and Apple login options
3. **Wishlist**: Allow users to save products for later
4. **Real-time Chat**: Live chat support for customer assistance
5. **Analytics**: Enhanced analytics dashboard for business insights
6. **Mobile App**: React Native mobile application
7. **Internationalization**: Multi-language support
8. **PWA Support**: Progressive Web App capabilities

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ by Chammy
