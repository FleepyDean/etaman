# 🚀 eTaman Deployment Guide

## Prerequisites
- Git repository initialized
- Environment variables configured
- Accounts created on Vercel and Render
- A production PostgreSQL database on Render

---

## Recommended Setup

- Frontend: [Vercel](https://vercel.com)
- Backend: [Render](https://render.com)
- Database: Render PostgreSQL

This split is the simplest path for this repo:
- Vercel serves the React app built by Vite
- Render runs the Django API with Gunicorn
- Render PostgreSQL stores the data

---

## 1. Deploy the Backend on Render

### Create the Render service
1. Push this repo to GitHub.
2. In Render, create a new **Web Service** from the repository.
3. Use the settings below.

### Build and start commands
Use these values in Render:

```bash
Build Command: cd django_backend && pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
Start Command: cd django_backend && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

### Environment variables on Render
Set these in the Render dashboard:

```text
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=your-generated-secret-key
DJANGO_ALLOWED_HOSTS=your-render-service.onrender.com
DATABASE_URL=your-render-postgres-connection-string
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-vercel-app.vercel.app
```

### Add PostgreSQL on Render
1. Create a **Render PostgreSQL** database.
2. Copy the internal database URL into `DATABASE_URL`.
3. Redeploy the web service after the variable is set.

### After deploy
1. Open the Render service URL.
2. Verify `/api/taman/` returns JSON.
3. Create a superuser if needed:

```bash
cd django_backend
python manage.py createsuperuser
```

---

## 2. Deploy the Frontend on Vercel

### Create the Vercel project
1. In Vercel, import the same GitHub repository.
2. Set the project root to the repository root.
3. Vercel should detect Vite automatically.

### Build settings
Use the default Vercel Vite settings or set them explicitly:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

### Environment variables on Vercel
Set the backend API URL for the frontend:

```text
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

### Deploy
1. Trigger a deploy in Vercel.
2. Open the Vercel URL.
3. Confirm the app loads and API requests go to Render.

---

## Production Checklist

- [ ] Set `DJANGO_DEBUG=False`
- [ ] Generate secure `DJANGO_SECRET_KEY`
- [ ] Configure `DJANGO_ALLOWED_HOSTS` with the Render service hostname
- [ ] Configure Render PostgreSQL database
- [ ] Set `CORS_ALLOWED_ORIGINS` to the Vercel URL
- [ ] Run `python manage.py migrate`
- [ ] Run `python manage.py collectstatic --noinput`
- [ ] Create superuser account
- [ ] Verify media uploads work in production
- [ ] Monitor logs and errors
- [ ] Enable CSRF protection
- [ ] Update API_BASE_URL in frontend

---

## Post-Deployment

### Update Frontend API URL
In `src/App.jsx`, the API URL is auto-detected from environment:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

Set in `.env.production`:
```
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

### Monitor & Maintain
- Check logs regularly
- Set up error tracking (Sentry)
- Monitor database size
- Regular backups
- Update dependencies monthly

---

## Questions or Issues?

Reference Django deployment docs: https://docs.djangoproject.com/en/6.0/howto/deployment/
