# 📋 Production Readiness Checklist

## Security

- [ ] `DJANGO_DEBUG=False` in production environment
- [ ] Generate secure `DJANGO_SECRET_KEY`:
  ```bash
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```
- [ ] HTTPS/SSL certificate installed (Let's Encrypt or similar)
- [ ] `DJANGO_ALLOWED_HOSTS` configured with production domain(s)
- [ ] `CORS_ALLOWED_ORIGINS` set to frontend domain only
- [ ] `CSRF_TRUSTED_ORIGINS` configured for frontend domain
- [ ] Cross-Origin Cookie (SameSite=Lax) enabled
- [ ] Database password strong and unique
- [ ] AWS/S3 credentials secured in environment variables
- [ ] Admin panel (`/admin/`) access restricted by IP or authentication

## Database

- [ ] PostgreSQL database created and tested
- [ ] `DATABASE_URL` environment variable set correctly
- [ ] Backups scheduled and verified
- [ ] Database encryption enabled (if required)
- [ ] Connection pooling configured (pgBouncer or similar)
- [ ] Database indexes created for frequently queried fields
- [ ] Migrations applied successfully

## Frontend

- [ ] `VITE_API_BASE_URL` set to production backend URL
- [ ] Production build created: `npm run build`
- [ ] `dist/` folder contents deployed to static host
- [ ] All images/assets have correct URLs
- [ ] Gzip compression enabled on web server
- [ ] Cache headers configured appropriately
- [ ] Service Worker configured (if using PWA)

## Backend

- [ ] `python manage.py collectstatic --noinput` executed
- [ ] `python manage.py migrate` executed
- [ ] Superuser account created for admin access
- [ ] WhiteNoise or S3 configured for static file serving
- [ ] Media files stored in persistent location (S3 or shared storage)
- [ ] Gunicorn workers configured (4-8 depending on CPU cores)
- [ ] Error logging configured (Sentry, DataDog, etc.)
- [ ] Health check endpoint monitored

## Monitoring & Logging

- [ ] Error tracking service configured (Sentry, Rollbar)
- [ ] Application logs shipped to centralized logging (CloudWatch, ELK)
- [ ] Uptime monitoring configured (UptimeRobot, Datadog)
- [ ] Performance monitoring enabled (New Relic, AppDynamics)
- [ ] Database monitoring active
- [ ] Disk space monitoring set up
- [ ] Alert thresholds configured

## Infrastructure

- [ ] Load balancer configured (if multiple instances)
- [ ] Auto-scaling policies set (if using cloud)
- [ ] Firewall rules restricted to necessary ports only
- [ ] SSH keys rotated and secured
- [ ] Secrets stored in environment variables or secrets manager
- [ ] CDN configured for static assets (CloudFront, Cloudflare)
- [ ] DDoS protection enabled (Cloudflare, AWS Shield)

## Deployment Pipeline

- [ ] CI/CD configured (GitHub Actions, GitLab CI, etc.)
- [ ] Automated tests running on every commit
- [ ] Staging environment mirrors production
- [ ] Rollback procedure documented
- [ ] Zero-downtime deployment configured
- [ ] Environment parity verified (staging === production)

## API & Data

- [ ] API rate limiting configured
- [ ] API documentation available (Swagger/OpenAPI)
- [ ] GraphQL introspection disabled (if using GraphQL)
- [ ] Authentication tokens with expiration set
- [ ] CSRF tokens properly implemented
- [ ] Input validation sanitizes all user data
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled

## Performance

- [ ] Database query optimization (N+1 queries eliminated)
- [ ] Pagination implemented for large datasets
- [ ] Image optimization (compression, resizing)
- [ ] Frontend bundle size analyzed and optimized
- [ ] Lazy loading implemented for components/images
- [ ] Caching strategy implemented (Redis, memcached)
- [ ] HTTP/2 enabled on web server
- [ ] Gzip compression enabled

## Backup & Recovery

- [ ] Database backups scheduled (daily minimum)
- [ ] Backup retention policy defined (keep 30 days)
- [ ] Disaster recovery plan documented
- [ ] Restore procedure tested
- [ ] Media files backed up (S3 versioning enabled)
- [ ] Configuration files backed up
- [ ] Backup encryption enabled

## Documentation

- [ ] Deployment procedure documented
- [ ] Environment variables documented (`.env.example`)
- [ ] Database schema documented
- [ ] API endpoints documented with examples
- [ ] Troubleshooting guide created
- [ ] Emergency contact list maintained
- [ ] Runbook for common issues created

## Compliance & Legal

- [ ] Privacy policy written and published
- [ ] Terms of service written and published
- [ ] GDPR compliance verified (if serving EU users)
- [ ] Data retention policies documented
- [ ] User data deletion process implemented
- [ ] Security vulnerability disclosure policy defined

---

## Pre-Deployment Verification

### 1. Test Production Settings Locally
```bash
export DJANGO_DEBUG=False
export DJANGO_SECRET_KEY="your-test-key"
export DJANGO_ALLOWED_HOSTS="localhost,127.0.0.1"

python manage.py check --deploy
python manage.py runserver
```

### 2. Run Full Test Suite
```bash
python manage.py test
npm test  # If you have frontend tests
```

### 3. Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:8000/api/taman/

# Using wrk
wrk -t4 -c100 -d30s http://localhost:8000/api/taman/
```

### 4. Security Audit
```bash
# Django security checks
python manage.py check --deploy

# OWASP Top 10 review
# - SQL Injection: ✓ (using ORM)
# - XSS: ✓ (React escapes by default)
# - CSRF: ✓ (Django middleware)
# - Broken Authentication: Review JWT/session implementation
# - Sensitive Data Exposure: ✓ (HTTPS enforced)
```

---

## Post-Deployment Verification

1. **Smoke Tests**: Verify basic functionality works
   - [ ] API returns data
   - [ ] Images load correctly
   - [ ] Create/update/delete operations work

2. **Security Scan**: Check SSL certificate
   ```bash
   # Use ssllabs.com or let's encrypt checker
   curl -I https://your-domain.com
   ```

3. **Performance Check**: Verify page load times
   - [ ] Frontend <3 seconds
   - [ ] API responses <200ms

4. **Monitoring Active**: Confirm logs are being collected
   - [ ] Backend errors appearing in error tracker
   - [ ] Frontend console errors visible
   - [ ] Database performance metrics visible

---

## Emergency Contacts

- **Backend Support**: [Your contact]
- **Database Administrator**: [Your contact]
- **Security Team**: [Your contact]
- **Infrastructure Team**: [Your contact]

---

**Last Updated**: April 27, 2026
**Maintained By**: [Your Team]
