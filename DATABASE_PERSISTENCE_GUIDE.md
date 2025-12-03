# Data Persistence & Database Guide

## Overview
Your Art Showcase application is fully configured to persist all user data in a MySQL database. When pushed to GitHub and opened from a different device, all data (usernames, profiles, artworks, etc.) will be automatically retrieved from the database.

---

## How Data Persistence Works

### 1. **Backend Database Configuration**
- **Database**: MySQL (`art_showcase`)
- **Connection File**: `backend/database/connection.js`
- **Configuration**: `backend/.env`
- **Schema**: `backend/database/schema.sql`

**Current .env Configuration:**
```
DB_HOST=localhost
DB_USER=root
DB_PASS=newpassword123
DB_NAME=art_showcase
DB_PORT=3306
```

### 2. **User Signup Flow (Data Saving)**
1. User fills in Username, Email, Password in signup form
2. Frontend sends POST request to `http://localhost:5000/api/auth/register`
3. Backend validates the data:
   - Checks if email/username already exists in database
   - Validates password length (min 6 characters)
   - Hashes password using bcryptjs (12 salt rounds)
4. Backend inserts user into `users` table:
   ```sql
   INSERT INTO users (username, email, password) VALUES (?, ?, ?)
   ```
5. User data is permanently saved in database
6. JWT token is generated and returned to frontend
7. Frontend stores token and userId in localStorage for session management

### 3. **User Login Flow (Data Retrieval)**
1. User enters Username and Password
2. Frontend sends POST request to `http://localhost:5000/api/auth/login`
3. Backend queries database:
   ```sql
   SELECT user_id, username, email, password FROM users WHERE username = ?
   ```
4. Password is validated using bcryptjs.compare()
5. JWT token is generated
6. User data is returned and stored in localStorage
7. User is logged in with their profile data

### 4. **Database Tables Created**

When you run the database setup, the following tables are created:

| Table | Purpose |
|-------|---------|
| `users` | Stores username, email, password, bio, profile_picture, date_joined |
| `artwork` | Stores user artworks with title, caption, image_url |
| `likes` | Stores artwork likes with user_id and artwork_id |
| `comments` | Stores comments on artworks |
| `saves` | Stores saved artworks |
| `follows` | Stores follower relationships |
| `hashtags` | Stores hashtag tags |
| `artwork_hashtags` | Links artworks to hashtags |
| `leaderboard` | Stores top artworks by likes |

---

## Setup Instructions for New Device

### Step 1: Install Dependencies
```bash
# Navigate to backend
cd backend
npm install

# Navigate to frontend
cd ../frontend
npm install
```

### Step 2: Set Up MySQL Database
**Option A: Using Setup Script (Recommended)**
```bash
cd backend
npm run setup-db
```

**Option B: Manual Setup**
1. Start MySQL service on your device
2. Log into MySQL:
   ```bash
   mysql -u root -p
   ```
3. Run the schema:
   ```bash
   source backend/database/schema.sql
   ```

### Step 3: Configure Environment Variables

Create `.env` file in `backend/` with:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=newpassword123
DB_NAME=art_showcase
DB_PORT=3306
JWT_SECRET=123456789
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**⚠️ IMPORTANT**: The `.env` file is listed in `.gitignore` and will NOT be pushed to GitHub. Each device needs its own `.env` file configured with the correct database credentials.

### Step 4: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000` (or 5173)

### Step 5: Verify Database Connection

Navigate to `http://localhost:5000/api/health` in your browser. You should see:
```json
{
  "success": true,
  "message": "Backend and database are connected successfully"
}
```

---

## Data Flow Diagram

### Signup Process
```
User fills form → Frontend → POST /api/auth/register → Backend validates → 
Hash password → INSERT into users table → Return JWT + userId → 
Frontend stores in localStorage → User auto-logged in
```

### Login Process
```
User enters credentials → Frontend → POST /api/auth/login → Backend queries users table → 
Validate password → Return JWT + user data → Frontend stores in localStorage → 
User logged in with profile data
```

### Profile Access
```
User clicks profile → Frontend fetches GET /api/users/{userId} → 
Backend queries users table → Returns user data from database → 
Frontend displays username, bio, followers, following
```

---

## Important Notes

### 1. **Environment Variables Not Pushed to GitHub**
- `.env` file contains sensitive database credentials
- It's in `.gitignore` and will never be pushed
- Each device must have its own `.env` file with correct credentials

### 2. **Database Connection is Persistent**
- User data saved in database persists across:
  - Application restarts
  - Device reboots
  - Different browsers
  - Different devices (as long as they connect to the same database server)

### 3. **localStorage vs Database**
- **localStorage**: Stores session tokens (loggedIn, userId, token, username)
  - Purpose: Quick authentication check on frontend
  - Expires when browser cache is cleared
  - User-specific, not shared
  
- **Database**: Stores all user data permanently
  - Purpose: Persistent user information
  - Available across all devices and browsers
  - Shared data source for all users

### 4. **Password Security**
- Passwords are hashed using bcryptjs with 12 salt rounds
- Plain text passwords are NEVER stored in database
- Passwords are validated during login using bcryptjs.compare()

### 5. **Data Validation**
- Backend validates all incoming data
- Duplicate username/email checking prevents duplicates
- Password minimum length enforcement (6 characters)
- Required fields validation (username, email, password)

---

## Testing Data Persistence

### Test 1: Signup and Close App
1. Signup with new user (e.g., testuser@email.com)
2. Verify user profile displays correctly
3. Close browser and application
4. Restart backend and frontend
5. **Result**: User can log back in with same credentials

### Test 2: Different Browser
1. Signup with new user
2. Open different browser (Chrome, Firefox, Edge)
3. Navigate to `http://localhost:3000`
4. Login with the same credentials
5. **Result**: User profile loads correctly

### Test 3: GitHub Push and New Device
1. Push code to GitHub (only source files, not .env or node_modules)
2. Clone on different device
3. Create `.env` file with correct database credentials
4. Run database setup (`npm run setup-db`)
5. Start backend and frontend
6. Login with previously created user
7. **Result**: User data persists across devices

---

## Troubleshooting

### Issue: "Connection refused" error
**Solution**: 
- Ensure MySQL service is running
- Check DB_HOST, DB_USER, DB_PASS in .env file
- Verify database name matches DB_NAME in .env

### Issue: "User already exists" on signup
**Solution**:
- This is expected behavior - prevents duplicate accounts
- Try with different email/username

### Issue: "Login failed" but user exists
**Solution**:
- Check password - it's case-sensitive
- Ensure no extra spaces in input
- Check backend console for errors

### Issue: User data not showing on new device
**Solution**:
- Verify both devices connect to same database server
- Check .env configuration on new device
- Run health check: `http://localhost:5000/api/health`
- Check backend console for connection errors

---

## Database Backup Recommendations

For production deployment:
1. **Regular backups** of MySQL database
2. **Connection pooling** for better performance
3. **Authentication middleware** for protected endpoints
4. **Environment variables** for different environments (dev, prod)
5. **Database migrations** for schema changes

---

## Summary

✅ **Your application is fully configured for data persistence**
- All user data saved to MySQL database
- Passwords securely hashed
- Login sessions managed with JWT tokens
- Data accessible across devices and browsers
- Ready to push to GitHub and deploy

All user accounts, profiles, and data created in your local environment will be available when accessing from a different device, as long as both devices connect to the same MySQL database server.
