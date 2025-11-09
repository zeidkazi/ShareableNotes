# Deployment Guide

## 🎯 Deployment Order

**Deploy Backend First → Then Frontend**

Why? The frontend needs the backend URL to work properly.

---

## 📦 Step 1: Deploy Backend (Render)

### Prerequisites

- GitHub repository with your code pushed
- Supabase database URL ready

### Step-by-Step:

1. **Go to Render**
   - Visit [render.com](https://render.com)
   - Sign up/Login with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Service**
   - **Name**: `notes-app-backend` (or any name you like)
   - **Root Directory**: `apps/server`
   - **Environment**: `Node`
     - **Build Command**:
       ```bash
       npm install && npx prisma migrate deploy && npm run build
       ```

     **Note**:
     - `npm run build` generates Prisma client
     - `npm start` uses `tsx` to run TypeScript directly (no compilation needed)
     - This avoids needing `.js` extensions in your TypeScript code

   - **Start Command**:
     ```bash
     npm start
     ```

4. **Add Environment Variables**
   Click "Environment" tab and add:

   ```
   DATABASE_URL=postgresql://... (your Supabase connection string)
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

   **Note**:
   - `PORT` is automatically set by Render (don't add it)
   - For `CORS_ORIGIN`, you'll update this after deploying frontend
   - For now, you can leave it empty or set to `*` temporarily

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (5-10 minutes)
   - Once deployed, you'll get a URL like: `https://notes-app-backend.onrender.com`

6. **Test Backend**
   - Test with: `curl https://your-backend-url.onrender.com/api/notes`
   - Should return an error (expected), but confirms the server is running
   - Or try: `curl -X POST https://your-backend-url.onrender.com/api/notes -H "Content-Type: application/json" -d '{"content":"test"}'`

7. **Save Your Backend URL**
   - Copy the URL (e.g., `https://notes-app-backend.onrender.com`)
   - You'll need this for frontend deployment

---

## 🎨 Step 2: Deploy Frontend (Vercel)

### Prerequisites

- Backend deployed and URL ready
- GitHub repository

### Step-by-Step:

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

   **Important**: Replace `your-backend-url.onrender.com` with your actual Render backend URL

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)
   - Once deployed, you'll get a URL like: `https://notes-app.vercel.app`

6. **Save Your Frontend URL**
   - Copy the URL (e.g., `https://notes-app.vercel.app`)

---

## 🔄 Step 3: Update Backend CORS

Now that you have your frontend URL, update the backend CORS:

1. **Go back to Render Dashboard**
   - Open your backend service
   - Go to "Environment" tab

2. **Update CORS_ORIGIN**
   - Change `CORS_ORIGIN` to your Vercel frontend URL:
     ```
     CORS_ORIGIN=https://notes-app.vercel.app
     ```
   - Click "Save Changes"
   - Render will automatically redeploy

3. **Wait for Redeploy**
   - Usually takes 1-2 minutes

---

## ✅ Step 4: Test Everything

1. **Visit your frontend URL**: `https://notes-app.vercel.app`
2. **Create a note** - Should work!
3. **Share the note URL** - Should work!
4. **Test editing** - Should work!

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Build fails with "Prisma client not found"

- **Solution**: Make sure build command includes `npx prisma generate`

**Problem**: Database connection error

- **Solution**:
  - Check `DATABASE_URL` is correct
  - Use Supabase Transaction Pooler URL (port 6543)
  - Make sure database is accessible from Render's IP

**Problem**: CORS errors

- **Solution**:
  - Check `CORS_ORIGIN` matches your frontend URL exactly
  - Include `https://` in the URL
  - Wait for redeploy after changing environment variables

### Frontend Issues

**Problem**: API calls failing

- **Solution**:
  - Check `VITE_API_URL` is set correctly
  - Make sure it includes `https://`
  - No trailing slash in the URL

**Problem**: Build fails

- **Solution**:
  - Check Root Directory is `apps/web`
  - Make sure all dependencies are in `package.json`

---

## 📝 Environment Variables Summary

### Backend (Render)

```
DATABASE_URL=postgresql://user:password@host:port/database
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend (Vercel)

```
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🚀 Quick Reference

### Render Backend URLs

- Dashboard: `https://dashboard.render.com`
- Your service: Check your Render dashboard

### Vercel Frontend URLs

- Dashboard: `https://vercel.com/dashboard`
- Your project: Check your Vercel dashboard

---

## 💡 Pro Tips

1. **Custom Domains**: Both Render and Vercel support custom domains
2. **Auto Deploy**: Both platforms auto-deploy on git push (if enabled)
3. **Logs**: Check logs in both platforms if something goes wrong
4. **Environment Variables**: You can have different values for production/preview
5. **Free Tier**: Both platforms have generous free tiers

---

**You're all set! 🎉**
