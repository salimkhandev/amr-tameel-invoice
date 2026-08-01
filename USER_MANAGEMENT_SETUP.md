# AMR Tameel Invoice - User Management Setup

## 🚀 Setup Instructions

### 1. Supabase Database Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)
2. **Go to SQL Editor** in your Supabase dashboard
3. **Run the SQL schema** from `supabase-schema.sql` file to create:
   - `users` table with authentication fields
   - `health_checks` table for keep-alive monitoring
   - Functions and triggers for automatic timestamp updates

### 2. Get Supabase Credentials

Your Supabase connection details are already configured:
- **Project URL**: `https://rxtjyhcoosaijykritif.supabase.co`
- **Database Host**: `aws-0-ap-northeast-1.pooler.supabase.com`
- **Database Port**: `6543`
- **Database User**: `postgres.rxtjyhcoosaijykritif`

**To get the Supabase Keys:**
1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Navigate to your project
3. Go to Settings → API
4. Copy the following keys:
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role secret key** (also starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
5. Update your `.env` file with both keys:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role secret key

### 3. Environment Variables

Your `.env` file has been created with all Supabase credentials already configured:

**Current .env configuration:**
```bash
# Authentication Configuration (fallback if Supabase not configured)
NEXT_PUBLIC_AUTH_USERNAME=admin
NEXT_PUBLIC_AUTH_PASSWORD=admin123

# Supabase Configuration (for user management)
NEXT_PUBLIC_SUPABASE_URL=https://rxtjyhcoosaijykritif.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Already configured
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Already configured

# Supabase Database Connection (for direct database access)
SUPABASE_HOST=aws-0-ap-northeast-1.pooler.supabase.com
SUPABASE_PORT=6543
SUPABASE_DATABASE=postgres
SUPABASE_USER=postgres.rxtjyhcoosaijykritif
SUPABASE_PASSWORD=SKdev@99%22h11aSIM
SUPABASE_CONNECTION_STRING=postgresql://postgres.rxtjyhcoosaijykritif:SKdev%4099%2522h11aSIM@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres

# JWT Secret (for token generation)
JWT_SECRET=amr-tameel-invoice-secret-key-2024-change-in-production

# Optional: Admin email for notifications
ADMIN_EMAIL=admin@example.com
```

✅ **All Supabase credentials are already configured in your .env file!**

### 4. Database Setup (Already Completed)

The database schema has already been set up and the admin user has been created:

**✅ Database Schema Created:**
- `users` table with authentication fields
- `health_checks` table for keep-alive monitoring
- Functions and triggers for automatic timestamp updates

**✅ Admin User Created:**
- Username: `admin`
- Password: `admin123`
- Role: `admin`
- ⚠️ **IMPORTANT**: Change this password after first login!

If you need to reset the admin password or create additional users, you can:
1. Use the User Management UI in the dashboard (as admin)
2. Run the script: `node scripts/create-admin-user.js`
3. Use SQL directly in Supabase dashboard

### 5. GitHub Workflow Setup

The GitHub workflow at `.github/workflows/keep-alive.yml` will:
- Ping your Supabase project directly every 10 minutes
- Ping your application health check endpoint
- Keep Supabase active by preventing database sleep
- Update a keep-alive file in the repository (with `[skip ci]` to skip deployment)

**GitHub Secrets Required:**
Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

1. `SUPABASE_URL` - Your Supabase project URL
   - Value: `https://rxtjyhcoosaijykritif.supabase.co`
   - This is the same as `NEXT_PUBLIC_SUPABASE_URL` in your .env file

2. `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - Value: Your actual service role key from Supabase dashboard
   - This is the same as `SUPABASE_SERVICE_ROLE_KEY` in your .env file
   - **Important:** Use service role key for admin operations, not anon key

3. `VERCEL_URL` - Your Vercel application URL
   - Value: `https://your-app-name.vercel.app` (update after deployment)
   - This is your deployed application URL

**Important:** These GitHub secrets are separate from your .env file. The GitHub workflow needs these secrets to ping Supabase directly, which is more reliable than using environment variables in GitHub Actions.

**To add GitHub Secrets:**
1. Go to your GitHub repository: https://github.com/salimkhandev/amr-tameel-invoice
2. Click on Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the corresponding value from your .env file

**Note:** The workflow is already configured to use the `VERCEL_URL` secret, so you don't need to manually update the URL in the workflow file after adding the secret.

### 6. User Management Features

**Admin Capabilities:**
- ✅ Create new users with multi-step form (name → credentials → role)
- ✅ Edit existing users (name, role, status, password)
- ✅ Revoke user access by setting `is_active = false`
- ✅ Delete users completely
- ✅ View all users with their status
- ✅ Email field removed for simplified user management

**User Roles:**
- `admin`: Full access to user management and all features
- `user`: Can only create delivery orders and download PDFs

### 7. How It Works

**Authentication Flow:**
1. User enters username and password
2. System checks Supabase users table (or falls back to env variables)
3. Password is verified using bcrypt
4. JWT token is generated for session management
5. User is logged in and redirected to dashboard

**User Management:**
1. Admin sees User Management panel in dashboard
2. Can add/edit/delete users
3. All changes are stored in Supabase database
4. Active/inactive status controls access immediately

**Keep-Alive System:**
1. GitHub Actions pings `/api/health` every 10 minutes
2. Health check logs to Supabase `health_checks` table
3. This keeps Supabase from going to sleep
4. Only keeps last 100 health check records

### 8. Security Notes

- ⚠️ **Important**: Change the default admin password immediately
- ⚠️ **Important**: Use a strong JWT_SECRET in production
- ⚠️ **Important**: Never commit `.env` file to Git
- ⚠️ **Important**: Use environment variables for sensitive data
- ✅ Passwords are hashed with bcrypt (10 rounds)
- ✅ JWT tokens expire after 7 days
- ✅ Admin can revoke access by deactivating users

### 9. Testing the Setup

1. **Test Environment Variables:**
   ```bash
   # Test if env variables are loaded
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Test Health Check:**
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **Test Login:**
   - Use the default admin credentials or ones you created
   - Check if you can access the dashboard
   - Verify User Management panel is visible for admins

4. **Test User Management:**
   - Try adding a new user as admin
   - Log out and try logging in as the new user
   - Test user should not see User Management panel
   - Test revoke access by deactivating the user

### 10. Troubleshooting

**Login fails:**
- Check if `.env` file exists and has correct values
- Verify Supabase credentials are correct
- Check if Supabase project is active
- Check browser console for errors

**User Management not visible:**
- Verify logged-in user has `role: 'admin'`
- Check JWT_SECRET is set
- Check API routes are working correctly

**Keep-alive not working:**
- Verify GitHub Actions workflow is enabled
- Check the Vercel URL in workflow is correct
- Check `/api/health` endpoint is accessible
- Check Supabase RPC function `log_health_check` exists

## 📊 Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `username` (String, Unique)
- `password_hash` (String, Bcrypt hash)
- `full_name` (String, Optional)
- `role` (String: 'admin' | 'user')
- `is_active` (Boolean)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Health Checks Table
- `id` (Serial, Primary Key)
- `check_time` (Timestamp)
- `status` (String)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Management (Admin Only)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `PATCH /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

### Health Check
- `GET /api/health` - Health check endpoint (for keep-alive)

## 📝 Dependencies Added

- `@supabase/supabase-js` - Supabase client library
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation
- `@types/jsonwebtoken` - TypeScript types for JWT

## 🎯 Summary

Your application now has:
- ✅ Complete user authentication system
- ✅ Admin panel for user management
- ✅ Supabase database integration
- ✅ JWT-based session management
- ✅ GitHub Actions keep-alive workflow
- ✅ User access revocation capability
- ✅ Role-based access control
- ✅ Secure password hashing with bcrypt

The system will automatically keep your Supabase database active and allow you to manage users efficiently!
