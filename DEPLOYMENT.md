# PeakHive Deployment Guide

This guide explains how to deploy PeakHive's frontend and backend separately on Vercel.

## Prerequisites

- GitHub account
- Vercel account
- MongoDB Atlas account (for the database)

## Frontend Deployment

### Step 1: Prepare Your Frontend Code

1. Make sure your code is ready for production:
   - All environment variables are correctly set in `.env.production`
   - The API URL is correctly configured to point to your deployed backend

2. Push your code to GitHub:
```bash
git add .
git commit -m "Prepare frontend for deployment"
git push origin main
```

### Step 2: Deploy the Frontend on Vercel

1. Log in to [Vercel](https://vercel.com)
2. Click "Add New..." and select "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Add environment variables:
   - `VITE_API_URL`: `https://peakhive-backend.vercel.app/api` (update with your actual backend URL)
   - `VITE_NODE_ENV`: `production`
6. Click "Deploy"

## Backend Deployment

### Step 1: Prepare Your Backend Code

1. Create a separate GitHub repository for your backend:
```bash
cd server
git init
git add .
git commit -m "Prepare backend for deployment"
git remote add origin https://github.com/yourusername/peakhive-backend.git
git push -u origin main
```

### Step 2: Deploy the Backend on Vercel

1. Log in to [Vercel](https://vercel.com)
2. Click "Add New..." and select "Project"
3. Import your backend GitHub repository
4. Configure the project:
   - Framework Preset: **Other**
   - Build Command: None (or `npm install`)
   - Output Directory: `./`
   - Root Directory: `./`
5. Add environment variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: `production`
6. Click "Deploy"

### Step 3: Set Up Vercel Environment Variables from the Command Line (Alternative)

You can also use the Vercel CLI to set environment variables:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Link your project:
```bash
vercel link
```

4. Set environment variables:
```bash
vercel env add MONGO_URI
vercel env add JWT_SECRET
vercel env add NODE_ENV
```

## Troubleshooting

### CORS Issues

If you encounter CORS errors, make sure your backend's CORS configuration includes your frontend domain:

```javascript
app.use(cors({
  origin: ['https://peakhive.vercel.app', 'your-frontend-domain.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

### Vercel Build Failures

1. Check the build logs for errors
2. Make sure all dependencies are included in package.json
3. Verify that your Node.js version is compatible (add "engines" field to package.json)
4. For backend, ensure the main entry point is correctly specified

### Database Connection Issues

1. Make sure your MongoDB connection string is correct and the database is accessible
2. Check if the IP address from Vercel is whitelisted in MongoDB Atlas
3. Verify that your database user has the necessary permissions

## Monitoring Your Deployment

1. Monitor your application logs in the Vercel dashboard
2. Set up alerts for deployment failures
3. Test the entire application flow after deployment to ensure everything works

## Updating Your Deployment

To update your deployment, simply push changes to your GitHub repository. Vercel will automatically rebuild and deploy your application.

```bash
git add .
git commit -m "Update application"
git push origin main
```

## Creating Multiple Environments (Development, Staging, Production)

Vercel supports different environments through different branches and deploy hooks. Refer to Vercel's documentation for advanced deployment strategies. 