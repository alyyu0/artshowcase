# Quick Start Guide - Data Persistence

## For Current Device (Already Set Up)

### Start the Application
**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open: `http://localhost:3000`

---

## For New Device (After Pushing to GitHub)

### Step 1: Clone & Install
```bash
git clone <repo-url>
cd artshowcase

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### Step 2: Create .env
Create file: `backend/.env`
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

### Step 3: Setup Database
```bash
cd backend
npm run setup-db
```

### Step 4: Start Application
**Terminal 1:**
```bash
cd backend && npm start
```

**Terminal 2:**
```bash
cd frontend && npm run dev
```

Open: `http://localhost:3000`

---

## What Gets Saved to Database?

✅ **User Accounts**
- Username
- Email
- Password (hashed)
- Bio
- Profile picture
- Date joined

✅ **Artworks**
- Title
- Caption
- Image URL
- Upload date

✅ **User Interactions**
- Likes
- Comments
- Saved artworks
- Follows

---

## Important Facts

1. **User data persists forever** - until manually deleted from database
2. **Passwords are hashed** - never stored as plain text
3. **Each device needs its own .env** - contains database credentials
4. **.env is never pushed to GitHub** - it's in .gitignore
5. **Login tokens expire in 7 days** - configured in .env
6. **Database must be created first** - run `npm run setup-db`

---

## API Endpoints (Backend: http://localhost:5000)

```
POST   /api/auth/register          - Sign up new user
POST   /api/auth/login             - Log in user
GET    /api/users/:user_id         - Get user profile
GET    /api/follows/followers/:id  - Get followers count
GET    /api/follows/following/:id  - Get following count
GET    /api/health                 - Check database connection
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" | Make sure MySQL is running |
| "User already exists" | Try different email/username |
| "Login failed" | Check username and password (case-sensitive) |
| "Cannot find module" | Run `npm install` in both folders |
| "Database not found" | Run `npm run setup-db` in backend folder |

---

## Files Not in GitHub

These files are **not** pushed to GitHub (they're in .gitignore):
- `backend/.env` - Database credentials
- `backend/node_modules/` - Dependencies
- `frontend/node_modules/` - Dependencies
- `backend/images/` - Uploaded files

**You must create .env and run npm install on new device!**

---

## You're All Set! 🎉

Your Art Showcase application:
- ✅ Saves all data to MySQL database
- ✅ Works across different devices
- ✅ Persists data after app restarts
- ✅ Ready to push to GitHub
- ✅ Ready for production deployment

**All user accounts and profiles created will be available on any device!**
