# eTaman - Park Management System

A centralized web application developed for **Jabatan Landskap Negeri Johor (JLNJ)** to streamline the collection, management and analysis of public park data across all districts.

This system solves the issue of delayed and fragmented data collection from local authorities (PBT) by providing a standardized platform with built-in AI capabilities.

## Features

- **Centralized Data Management (CRUD)** — Add, view, edit and delete park records with a standardized template.
- **Bulk Operations** — Select multiple records for batch deletion.
- **Smart Filtering & Search** — Filter parks by district, park type and specific facilities.
- **AI-Powered Generation** — Uses Google Gemini API to generate professional park descriptions.
- **Dashboard Analytics & AI Insights** — Visualizes park distributions with AI-driven recommendations.
- **Import/Export** — Import from CSV/XLSX and export to CSV.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, Tailwind CSS, Lucide Icons |
| **Build Tool** | Vite |
| **Backend** | Django 6.0, Django REST (custom API views) |
| **Database** | SQLite (development) |
| **AI** | Google Gemini API |

---

## Getting Started

### Prerequisites

- **Node.js** (v18+) — [nodejs.org](https://nodejs.org)
- **Python** (v3.11+) — [python.org](https://python.org)
- **Git** — [git-scm.com](https://git-scm.com)

### 1. Clone the Repository

```bash
git clone https://github.com/FleepyDean/eTaman.git
cd eTaman
```

### 2. Frontend Setup

```bash
# Install Node dependencies
npm install

# Start the Vite dev server (runs on http://localhost:5173)
npm run dev
```

### 3. Backend Setup

Open a **separate terminal**:

```bash
# Navigate to the Django backend
cd django_backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start the Django dev server (runs on http://localhost:8000)
python manage.py runserver
```

> **Note:** Both the frontend (port 5173) and backend (port 8000) must be running simultaneously for the app to work.

### 4. Environment Variables (Optional)

If needed, create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Project Structure

```
etaman/
├── src/                    # React frontend
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Entry point
│   └── index.css           # Tailwind imports
├── public/                 # Static assets (favicon, etc.)
├── django_backend/         # Django backend
│   ├── taman/              # Taman app (models, api, views)
│   ├── config/             # Django settings
│   ├── manage.py           # Django CLI
│   └── requirements.txt    # Python dependencies
├── index.html              # Vite HTML entry
├── package.json            # Node dependencies
├── tailwind.config.js      # Tailwind configuration
└── vite.config.js          # Vite configuration
```

---

## For Collaborators

To work on a new feature:

```bash
# Make sure you're on main and up to date
git checkout main
git pull origin main

# Create your feature branch
git checkout -b feature/your-feature-name

# After making changes, push your branch
git add -A
git commit -m "Add your feature description"
git push origin feature/your-feature-name
```

Then create a **Pull Request** on GitHub to merge into `main`.
