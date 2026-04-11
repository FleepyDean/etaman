# 🌳 eTaman - Park Management System

A modern, centralized web application prototype developed for **Jabatan Landskap Negeri Johor (JLNJ)** to streamline the collection, management and analysis of public park data across all districts.

This system solves the issue of delayed and fragmented data collection from local authorities (PBT) by providing a standardized, easy-to-use platform with built-in AI capabilities.

## ✨ Features

* 📝 **Centralized Data Management (CRUD):** Add, view, edit and delete park records with a standardized template to prevent data overlapping.
* 🔍 **Smart Filtering & Search:** Filter parks by district, park type and specific facilities (e.g., toilet, playground, parking, prayer room).
* ✨ **AI-Powered Generation:** Utilizes the Google Gemini API to instantly generate professional park descriptions based on input data.
* 📊 **Dashboard Analytics & AI Insights:** Visualizes park distributions and provides AI-driven strategic recommendations for park management.
* 📥 **CSV Export:** Download the complete park database into an Excel-ready format with a single click.

## 🛠️ Technology Stack

* **Frontend:** React.js
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Build Tool:** Vite
* **AI Integration:** Google Gemini API

---

## 🚀 Getting Started

Follow these steps to set up and run the eTaman system on your local machine.

### 1. Installation

Run the following commands in your terminal to create the project and install all necessary dependencies:

```bash
# Create a new Vite React project
npm create vite@latest etaman -- --template react

# Navigate into the project directory
cd etaman

# Install base dependencies
npm install

# Install Tailwind CSS and its peer dependencies
npm install -D tailwindcss@3 postcss autoprefixer

# Initialize Tailwind configuration
npx tailwindcss init

# Install Lucide React for UI icons
npm install lucide-react
