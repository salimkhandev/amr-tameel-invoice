# Quick Setup Guide - AMR Tameel Invoice

## ✅ Already Completed

1. **Database Schema Setup** ✅
   - Users table created
   - Health checks table created
   - Functions and triggers set up

2. **Admin User Created** ✅
   - Username: `admin`
   - Password: `admin123`
   - Role: `admin`

3. **Environment Variables** ✅
   - `.env` file created with Supabase connection details
   - Database connection configured
   - JWT secret set

4. **Scripts Created** ✅
   - `scripts/setup-supabase.js` - Database setup script
   - `scripts/create-admin-user.js` - Admin user creation script

5. **GitHub Workflow** ✅
   - Keep-alive workflow created
   - Configured to ping Supabase and app every 10 minutes
   - Uses `[skip ci]` to prevent unnecessary deployments

## 🔧 What You Need to Do

### 1. Get Supabase Anon Key (REQUIRED)
1. Go to https://supabase.com/dashboard
2. Navigate to your project
3. Go to Settings → API
4. Copy the `anon public` key
5. Update your `.env` file:
   ```bash
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

### 2. Add GitHub Secrets (REQUIRED)
1. Go to https://github.com/salimkhandev/amr-tameel-invoice
2. Click on Settings → Secrets and variables → Actions
3. Add these secrets:
   - `SUPABASE_URL`: `https://rxtjyhcoosaijykritif.supabase.co`
   - `SUPABASE_ANON_KEY`: Your actual anon key (same as above)
   - `VERCEL_URL`: `https://your-app-name.vercel.app` (after deployment)

### 3. Test the Application
1. Start the development server: `pnpm run dev`
2. Go to http://localhost:3000
3. Login with:
   - Username: `admin`
   - Password: `admin123`
4. Access the dashboard and test user management

### 4. Change Admin Password (IMPORTANT)
After first login, immediately change the admin password:
1. Go to User Management panel in dashboard
2. Click edit on the admin user
3. Enter a new strong password
4. Save the changes

### 5. Deploy to Vercel
1. Push your changes to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy the application
5. Update the `VERCEL_URL` GitHub secret with your actual Vercel URL

## 🎯 Features Ready to Use

- ✅ User authentication with Supabase
- ✅ Admin panel for user management
- ✅ JWT-based session management
- ✅ User access revocation (deactivate users)
- ✅ Role-based access control (admin/user)
- ✅ GitHub Actions keep-alive workflow
- ✅ Automatic database schema setup
- ✅ Bcrypt password hashing

## 📝 Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Role: `admin`

⚠️ **IMPORTANT**: Change the admin password immediately after first login!

## 🔧 Troubleshooting

**Login fails:**
- Check if `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly in `.env`
- Verify Supabase project is active
- Check browser console for errors

**User Management not visible:**
- Verify you're logged in as admin user
- Check JWT_SECRET is set in `.env`

**Keep-alive not working:**
- Verify GitHub secrets are added correctly
- Check GitHub Actions are enabled
- Verify `VERCEL_URL` is set after deployment

## 📊 Database Information

**Supabase Project:** `rxtjyhcoosaijykritif`
**Database Host:** `aws-0-ap-northeast-1.pooler.supabase.com`
**Database Port:** `6543`
**Database User:** `postgres.rxtjyhcoosaijykritif`

## 🚀 Next Steps

1. Get your Supabase anon key and update `.env`
2. Add GitHub secrets for the workflow
3. Test the application locally
4. Change the default admin password
5. Deploy to Vercel
6. Update `VERCEL_URL` in GitHub secrets
7. Create additional users as needed

Your user management system is ready to use! 🎉
