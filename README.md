# LifeOS - Your Life Operating System

> A Progressive Web App (PWA) for personal productivity and life management powered by AI.

## 🚀 Overview

LifeOS is a comprehensive personal AI-powered life operating system designed to help users stay consistent with their goals through effortless journaling, smart reflection, and gentle AI guidance.

## ✨ Features

- **AI-Powered Journaling**: Voice and text journaling with AI-powered insights
- **Goal Tracking**: Set, track, and achieve personal goals with visual progress indicators
- **Smart Reflections**: Automated weekly/monthly summaries and pattern detection
- **Beautiful UI**: Glass morphism design with dark mode support
- **PWA Ready**: Installable web app with offline capabilities
- **Real-time Sync**: Cross-device synchronization with Supabase

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations

### Backend & Database
- **Supabase** - PostgreSQL database, authentication, real-time subscriptions
- **Row Level Security** - Secure data access patterns

### State Management
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management

### AI Integration
- **Google Gemini** - AI companion and content analysis
- **Opik** - AI observability and evaluation

### Additional Libraries
- **React Speech Recognition** - Voice input functionality
- **Recharts** - Data visualization
- **React Hook Form + Zod** - Form validation
- **Date-fns** - Date manipulation

## 🏗️ Project Structure

```
lifeos/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   ├── (dashboard)/              # Protected dashboard pages
│   ├── api/                      # API routes
│   ├── onboarding/               # Onboarding flow
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   ├── dashboard/                # Dashboard widgets
│   ├── journal/                  # Journaling components
│   ├── goals/                    # Goal tracking components
│   └── ai/                       # AI companion components
├── lib/                          # Utility libraries
│   ├── supabase/                 # Database client & middleware
│   ├── ai/                       # AI integration (Gemini)
│   └── utils/                    # Helper functions
├── store/                        # Zustand state stores
├── types/                        # TypeScript type definitions
└── public/                       # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/lifeos.git
   cd lifeos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your API keys:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # AI
   GEMINI_API_KEY=your_gemini_api_key

   # Observability
   OPIK_API_KEY=your_opik_api_key
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql`
   - Configure authentication providers

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📱 PWA Installation

LifeOS is designed as a Progressive Web App and can be installed on mobile devices:

1. Open the app in your mobile browser
2. Tap "Add to Home Screen" (iOS) or "Install" (Android)
3. The app will be available as a native app

## 🗄️ Database Schema

The app uses the following main tables:

- **profiles** - User profiles and preferences
- **categories** - Goal categories
- **goals** - User goals and targets
- **entries** - Journal entries
- **goal_logs** - Goal progress tracking
- **conversations** - AI chat conversations
- **messages** - AI conversation messages
- **reflections** - AI-generated insights

## 🤖 AI Features

### Gemini Integration
- **Journal Analysis**: Automatic tagging and mood detection
- **Goal Insights**: Progress analysis and recommendations
- **Weekly Reflections**: Automated summary generation
- **Pattern Detection**: Behavioral trend analysis

### Opik Observability
- **Request Tracking**: All AI interactions logged
- **Performance Monitoring**: Response quality metrics
- **Usage Analytics**: Feature usage statistics

## 🎨 Design System

### Color Palette
- **Primary**: Sage green (#5A7C5F)
- **Background**: Light (#F8FAF9) / Dark (#0F1410)
- **Glass Effects**: Semi-transparent overlays

### Typography
- **Font Family**: Plus Jakarta Sans
- **Sizes**: Responsive scaling
- **Weights**: 300-700 for hierarchy

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Start production server:
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- UI designs inspired by modern productivity apps
- Built with cutting-edge web technologies
- Powered by AI for enhanced user experience

---

**LifeOS** - Transforming how we manage our personal growth journey through technology and AI.
