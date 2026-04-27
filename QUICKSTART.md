# 🌳 eTaman - Quick Start Guide

## 📋 Prerequisites
- Python 3.11+ with pip
- Node.js 18+ with npm  
- Git
- SQLite3 (usually included with Python)

---

## ⚙️ Local Development Setup

### Backend (Django)

```bash
# Navigate to project
cd etaman

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On macOS/Linux bash:
source .venv/bin/activate

# Install dependencies
cd django_backend
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional, for admin panel)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will be available at: **http://127.0.0.1:8000**

### Frontend (React)

In a **new terminal**:

```bash
# From project root
npm install

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## 🔗 API Connection

The frontend automatically connects to the backend at `http://localhost:8000`. This is configured in:
- Default: `src/App.jsx` line 18
- Environment variable: `VITE_API_BASE_URL`

### For Production
Set environment variable before running:
```bash
# React build
VITE_API_BASE_URL=https://your-api-domain.com npm run build

# Or set in .env file
echo "VITE_API_BASE_URL=https://your-api-domain.com" > .env.production
```

---

## 🗄️ Database

- **Development**: SQLite (`django_backend/db.sqlite3`)
- **Production**: PostgreSQL (via `DATABASE_URL` environment variable)

### Reset Database (Development Only)
```bash
# Delete existing database
rm django_backend/db.sqlite3

# Create fresh database
cd django_backend
python manage.py migrate
python manage.py createsuperuser
```

---

## 📸 Features

✅ **Park Management**
- Create, read, update, delete parks (taman)
- Filter by district (daerah), type (jenis), and facilities
- Full-text search across park names and descriptions

✅ **Image Management**
- Upload multiple images per park
- Select main cover image
- View gallery with image modal
- Delete images individually

✅ **Bulk Import**
- Import parks from CSV/Excel files
- Data preview with edit capability
- Automatic facility detection
- Image upload during import

✅ **Export**
- Download current park list as CSV
- Useful for backup and external analysis

✅ **Statistics**
- Park count by district
- Facility availability overview
- Interactive dashboard

---

## 🛠️ Development Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend
python manage.py runserver              # Start dev server
python manage.py migrate                # Apply migrations
python manage.py createsuperuser        # Create admin account
python manage.py collectstatic          # Collect static files (production)
python manage.py shell                  # Interactive Django shell
```

---

## 🧪 Testing

### Manual API Testing
```bash
# Get all parks
curl http://localhost:8000/api/taman/

# Search parks
curl "http://localhost:8000/api/taman/?search=bukit"

# Filter by facilities
curl "http://localhost:8000/api/taman/?facilities=tandas,playground"
```

### Frontend Components
Located in `src/App.jsx`:
- `SistemPengurusanTaman`: Main application component
- `BorangTaman`: Park form (create/edit)
- `ProfilTaman`: Park detail viewer
- `ImportTamanPreview`: Bulk import interface
- `LaporanStatistik`: Statistics dashboard

---

## 📁 Project Structure

```
etaman/
├── django_backend/              # Django backend
│   ├── config/                  # Django settings
│   ├── taman/                   # Main app (models, views, API)
│   ├── templates/               # Django templates (optional, using React)
│   ├── static/                  # Static files (collected by collectstatic)
│   ├── manage.py
│   └── requirements.txt          # Python dependencies
├── src/                         # React frontend
│   ├── App.jsx                  # Main component
│   ├── index.css                # Global styles
│   └── main.jsx                 # Entry point
├── public/                      # Static assets
├── package.json                 # npm dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
└── DEPLOYMENT.md               # Production deployment guide
```

---

## 🚀 Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for:
- Heroku
- Railway
- AWS (EC2 + RDS + S3)
- VPS with Nginx + Gunicorn

Quick start for Heroku:
```bash
heroku login
heroku create your-app-name
git push heroku main
heroku run python manage.py migrate
```

---

## 🐛 Troubleshooting

### Django server won't start
```bash
# Check Python version
python --version  # Should be 3.11+

# Verify venv is activated
which python  # Should show path to .venv

# Clear cache and reinstall
pip install --upgrade --force-reinstall -r requirements.txt
```

### Frontend can't connect to backend
1. Verify Django server is running: `http://127.0.0.1:8000/api/taman/`
2. Check browser console for CORS errors
3. Verify `VITE_API_BASE_URL` environment variable if in production

### Database locked error
```bash
# Windows PowerShell
Remove-Item django_backend\db.sqlite3
cd django_backend
python manage.py migrate
```

### Static files not showing in production
```bash
cd django_backend
python manage.py collectstatic --noinput
```

---

## 📚 Resources

- Django Docs: https://docs.djangoproject.com/en/6.0/
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com
- Django REST Framework: https://www.django-rest-framework.org/

---

## 📝 License

This project is part of the eTaman park management system.

For questions or issues, refer to the documentation or check the troubleshooting section above.
