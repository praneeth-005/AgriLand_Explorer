# 🌱 AgriLand AI

![AgriLand Banner](https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1200&auto=format&fit=crop)

**Developer:** Praneeth (Harvest Hackers)  
**Platform:** [Live Demo on Vercel](https://agri-tech-three-alpha.vercel.app/)

## 📖 Overview

Farming is becoming increasingly data-heavy, but making sense of that data is difficult. Built entirely by a solo developer (**Praneeth** under the team name **Harvest Hackers**), **AgriLand AI** bridges the gap between complex geospatial data and everyday farming decisions. My platform is an AI-native precision agriculture application that combines interactive satellite mapping with intelligent decision-making to help farmers optimize yields and save resources.

While traditional farming relies on guesswork, AgriLand AI acts as a 24/7 virtual agronomist. By integrating advanced machine learning concepts and predictive intelligence, it turns raw field data into automated, proactive farming decisions.

## ✨ Key Features

*   🗺️ **Smart Precision Mapping:** Interactive satellite maps (via Leaflet) allowing farmers to plot boundaries with sub-meter accuracy. AI algorithms help suggest optimal tractor routes and field segmentation.
*   📊 **Predictive Analytics Dashboard:** Calculate exact acreage using Turf.js and predict soil health, moisture index, and historical yield patterns to make informed crop rotation choices.
*   🤖 **AI Field Assistant:** An integrated LLM-powered concept that allows farmers to "talk to their land" to receive real-time troubleshooting for crop diseases and resource management.
*   🔐 **Secure Authentication:** Robust user authentication and data management powered by Supabase.
*   📱 **Responsive & Mobile-First:** Designed with a stunning, glassmorphism UI using Tailwind CSS that works seamlessly in the field on handheld devices.

## 🛠️ Tech Stack

*   **Frontend Framework:** React 18
*   **State Management:** Redux Toolkit
*   **Routing:** React Router DOM
*   **Styling:** Tailwind CSS (Vanilla CSS + PostCSS)
*   **Mapping & Geospatial:** React-Leaflet, Leaflet, Turf.js, OpenStreetMap Nominatim API
*   **Backend & Auth:** Supabase
*   **Bundler:** Parcel
*   **Deployment:** Vercel

## 🚀 Getting Started

To run this project locally, follow these steps:

### Prerequisites
*   Node.js (v16 or higher)
*   npm or yarn
*   A Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/agritech.git
   cd agritech
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:1234`.

5. **Build for Production**
   ```bash
   npm run build
   ```

## 🧠 Hackathon AI Integrations

During this hackathon, I focused heavily on modernizing the UI/UX to support AI workflows:
- **Intelligent Boundaries:** Using polygon drawing paired with geospatial calculations.
- **Data Validation:** Strict client-side validation to ensure clean data pipelines for machine learning models.
- **Future Roadmap:** Integrating direct API calls to OpenAI and Google Cloud Vision for real-time crop disease detection from uploaded drone images.

---
*Built with ❤️ by a solo developer, Praneeth (Harvest Hackers)*
