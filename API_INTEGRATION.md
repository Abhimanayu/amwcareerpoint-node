# AMW Career Point — API Integration Guide
# For: Frontend (Next.js) + Admin Panel
# Base URL: http://localhost:5000/api/v1
# Production Base URL: https://api.amwcareerpoint.com/api/v1

# ============================================================
# SETUP — paste this in your project
# ============================================================

# 1. Install axios
npm install axios

# 2. Create this file: lib/api.js (or utils/api.js)

# FAQ API QUICK REFERENCE

# List FAQs (about page supported)
# GET /api/v1/faqs?faqPage=about&status=active

# Allowed faqPage/page values:
# home, country, university, contact, general, about

# pageSlug rule:
# - required only for country/university FAQs
# - optional (or null) for home/contact/general/about FAQs

# Create FAQ example payload
# {
#   "question": "Sample question?",
#   "answer": "Sample answer",
#   "page": "about",
#   "pageSlug": null
# }
