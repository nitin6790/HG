# Deploying HSGI Backend to Render

This guide explains how to deploy the HSGI backend to Render (Free Tier).

## Prerequisites

1. GitHub repository with the backend code pushed
2. MongoDB Atlas account with a database created
3. Render account ([render.com](https://render.com))

## Step 1: Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and database named `hsgi-db`
3. In your cluster, click **Connect**
4. Select **Drivers** and choose **Node.js**
5. Copy the connection string (it will look like):
   ```
   mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/hsgi-db?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your Atlas credentials
7. **IMPORTANT**: Add your Render server's IP to the IP Whitelist
   - In Atlas, go to **Security** → **Network Access**
   - Add IP Address: `0.0.0.0/0` (allows all IPs for free tier testing)
   - Or add Render's specific IP after deployment

## Step 2: Push Code to GitHub

```bash
git add .
git commit -m "Prepare backend for Render deployment"
git push origin main
```

## Step 3: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Fill in the form:
   - **Name**: `hsgi-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Click **Create Web Service**

## Step 4: Add Environment Variables

In the Render dashboard for your web service:

1. Go to **Environment**
2. Add the following variables:

   ```
   MONGODB_URI = mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/hsgi-db?retryWrites=true&w=majority
   NODE_ENV = production
   ```

3. Click **Save**

The server will automatically redeploy with these variables.

## Step 5: Verify Deployment

Once deployment is complete, your backend will be available at:

```
https://<your-web-service-name>.onrender.com
```

Test these endpoints:

1. **Health Check**:
   ```
   GET https://<your-web-service-name>.onrender.com/
   ```
   Expected response:
   ```json
   {
     "status": "ok",
     "message": "🏢 HSGI Inventory Backend API",
     "version": "1.0.0",
     "environment": "production"
   }
   ```

2. **Database Connection**:
   ```
   GET https://<your-web-service-name>.onrender.com/test-db
   ```
   Expected response:
   ```json
   {
     "message": "✅ DB connection working",
     "dbName": "hsgi-db",
     "dbState": 1,
     "connected": true
   }
   ```

3. **List Warehouses**:
   ```
   GET https://<your-web-service-name>.onrender.com/api/warehouses
   ```

## Step 6: Connect React Native App

Update your React Native app to use the Render backend:

```javascript
// src/api/client.js or similar
const API_BASE_URL = "https://<your-web-service-name>.onrender.com";

export const fetchWarehouses = async () => {
  const response = await fetch(`${API_BASE_URL}/api/warehouses`);
  return response.json();
};
```

## Troubleshooting

### "MongoDB connection error"
- ✅ Verify `MONGODB_URI` is set in Render environment
- ✅ Check MongoDB Atlas IP whitelist allows Render
- ✅ Ensure database credentials are correct

### "Cannot GET /"
- ✅ Check if the start command is set correctly to `npm start`
- ✅ Verify `server.js` exists in backend root

### "Free instance spins down after 15 minutes of inactivity"
- Render free tier stops after 15 minutes of no requests
- First request after shutdown takes ~30 seconds to restart
- Upgrade to paid plan for always-on hosting

### Cold Start Issues
- Free tier instances spin down and take 30-50 seconds to restart
- This is expected behavior for Render free tier
- Upgrade to "Standard" instance for consistent uptime

## Useful Render Commands

View logs:
```bash
# In Render dashboard, click "Logs" tab
```

Redeploy:
```bash
# Push new code to GitHub - Render automatically redeploys
# Or manually click "Deploy" in Render dashboard
```

## Next Steps

After deployment:

1. ✅ Test all API endpoints
2. ✅ Connect React Native app to backend
3. ✅ Migrate AsyncStorage data to MongoDB
4. ✅ Set up error monitoring (Sentry, LogRocket, etc.)
5. ✅ Consider upgrading to paid Render instance for production

## Security Notes

- ✅ Never commit `.env` file to GitHub
- ✅ Set environment variables in Render dashboard, not in code
- ✅ Use strong MongoDB Atlas credentials
- ✅ Consider restricting IP whitelist to Render's IP only
- ✅ Enable HTTPS (Render provides free SSL certificates)

---

For more info on Render, visit: https://render.com/docs
