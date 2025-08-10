# AI Onboarding Platform

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-Styled-38B2AC)](https://tailwindcss.com)

A sophisticated AI onboarding platform that creates personalized 90-day journeys to help professionals integrate AI into their workflows.

## 🚀 Features

- **Personalized Survey System**: Intelligent questionnaire that assesses your AI readiness and work style
- **AI Persona Assignment**: Get matched with one of six AI collaboration personas based on your responses
- **90-Day Journey Plans**: Customized learning path with daily activities tailored to your persona
- **User Authentication**: Secure sign-up and login with Supabase
- **Profile Management**: Complete user profile with subscription management
- **Progress Tracking**: Timeline and calendar views to track your AI learning journey
- **Beautiful Dark UI**: Modern interface with emerald/teal gradients and smooth animations

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📦 Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd my-ai-onboarding
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run database migrations:
```bash
# Run the schema creation
psql -h your-supabase-host -U postgres -d postgres < supabase/schema.sql

# Run the seed data
psql -h your-supabase-host -U postgres -d postgres < supabase/seed.sql
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 User Journey

1. **Landing Page**: Compelling introduction to AI transformation
2. **Survey**: 12-question assessment of your work style and AI readiness
3. **Persona Assignment**: Get matched with your AI collaboration persona
4. **Plan Generation**: Receive your personalized 90-day journey
5. **Account Creation**: Save your plan and track progress
6. **Timeline View**: See your daily activities and milestones
7. **Profile Management**: Update preferences and track achievements

## 📁 Project Structure

```
my-ai-onboarding/
├── app/                    # Next.js app directory
│   ├── components/        # React components
│   ├── contexts/         # React contexts (Auth)
│   ├── api/             # API routes
│   └── (pages)/         # Application pages
├── lib/                   # Utility functions and services
├── hooks/                # Custom React hooks
├── types/               # TypeScript type definitions
├── supabase/           # Database schemas and migrations
└── public/             # Static assets
```

## 🔐 Security

- Row Level Security (RLS) policies on all database tables
- Secure authentication with Supabase Auth
- API rate limiting and input validation
- Password strength requirements
- Audit logging for profile changes

## 🚢 Deployment

The application can be deployed on Vercel:

```bash
npm run build
```

Make sure to set environment variables in your deployment platform.

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

Built with ❤️ using Claude Code

---

For questions or support, please open an issue on GitHub.