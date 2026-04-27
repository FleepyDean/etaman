# eTaman Deployment Guide

## Prerequisites
- Git repository initialized
- Environment variables configured
- Accounts created on Vercel and Railway
- An existing production PostgreSQL database connection string (any provider)

---

## Recommended Setup

- Frontend: Vercel
- Backend: Railway
- Database: Your existing PostgreSQL database

This split is simple for this repo:
- Vercel serves the React app built by Vite
- Railway runs the Django API with Gunicorn
- Django connects using DATABASE_URL to your existing DB

---

## 1. Deploy the Backend on Railway

### Create the Railway service
1. Push this repo to GitHub.
2. In Railway, create a new project and add a service from your repository.
3. In the service settings, set Root Directory to django_backend.
4. Keep railway.toml in the repo so Railway uses the same build/start commands.

### Build and start commands
Use these values in Railway service settings:

Build Command: pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
Start Command: gunicorn config.wsgi:application --bind 0.0.0.0:$PORT

### Environment variables on Railway
Set these in Railway Variables:

DJANGO_DEBUG=False
DJANGO_SECRET_KEY=your-generated-secret-key
DJANGO_ALLOWED_HOSTS=your-railway-service.up.railway.app
DATABASE_URL=your-existing-postgres-connection-string
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-vercel-app.vercel.app

### Using your existing database
1. Keep your current database running where it is.
2. Paste that connection string into DATABASE_URL in Railway.
3. Redeploy service so migrations run against that DB.

### After deploy
1. Open your Railway service URL.
2. Verify /api/taman/ returns JSON.
3. Create a superuser in Railway shell:

python manage.py createsuperuser

---

## 2. Deploy the Frontend on Vercel

### Create the Vercel project
1. In Vercel, import the same GitHub repository.
2. Set the project root to repository root.
3. Vercel should detect Vite automatically.

### Build settings
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist

### Environment variables on Vercel
Set the backend API URL for frontend:

VITE_API_BASE_URL=https://your-railway-service.up.railway.app

### Deploy
1. Trigger deploy in Vercel.
2. Open the Vercel URL.
3. Confirm app loads and API requests go to Railway.

---

## Production Checklist

- [ ] Set DJANGO_DEBUG=False
- [ ] Generate secure DJANGO_SECRET_KEY
- [ ] Configure DJANGO_ALLOWED_HOSTS with Railway hostname
- [ ] Set DATABASE_URL to your existing production PostgreSQL DB
- [ ] Set CORS_ALLOWED_ORIGINS to Vercel URL
- [ ] Run python manage.py migrate
- [ ] Run python manage.py collectstatic --noinput
- [ ] Create superuser account
- [ ] Verify media uploads in production
- [ ] Monitor logs and errors

---

## Post-Deployment

Set in frontend environment:

VITE_API_BASE_URL=https://your-railway-service.up.railway.app

Monitor regularly:
- Application logs
- Database size and performance
- Dependency updates

---

## Questions or Issues?

Reference Django deployment docs: https://docs.djangoproject.com/en/6.0/howto/deployment/
