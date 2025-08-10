'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import { 
  ArrowRight, 
  Calendar, 
  Sparkles, 
  Users, 
  BarChart3, 
  Brain,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  Star,
  Menu,
  X,
  ChevronDown
} from 'lucide-react'

// Animation data - using a simple animation object for demo
const aiAnimationData = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "AI Animation",
  ddd: 0,
  assets: [],
  layers: [{
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: "Circle",
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 1, k: [{ t: 0, s: [0], e: [360] }, { t: 60, s: [360] }] },
      p: { a: 0, k: [100, 100, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] }
    },
    ao: 0,
    shapes: [{
      ty: "gr",
      it: [{
        ind: 0,
        ty: "el",
        ix: 1,
        ks: { a: 0, k: { i: [[0, -27.614], [27.614, 0], [0, 27.614], [-27.614, 0]], o: [[0, 27.614], [-27.614, 0], [0, -27.614], [27.614, 0]], v: [[50, 0], [0, 50], [-50, 0], [0, -50]], c: true } },
        nm: "Ellipse Path 1"
      }, {
        ty: "st",
        c: { a: 0, k: [0.549, 0.349, 0.949, 1] },
        o: { a: 0, k: 100 },
        w: { a: 0, k: 4 },
        lc: 1,
        lj: 1,
        ml: 4,
        bm: 0,
        nm: "Stroke 1"
      }, {
        ty: "tr",
        p: { a: 0, k: [0, 0] },
        a: { a: 0, k: [0, 0] },
        s: { a: 0, k: [100, 100] },
        r: { a: 0, k: 0 },
        o: { a: 0, k: 100 },
        sk: { a: 0, k: 0 },
        sa: { a: 0, k: 0 },
        nm: "Transform"
      }],
      nm: "Group 1"
    }],
    ip: 0,
    op: 60,
    st: 0,
    bm: 0
  }]
}

// Generate deterministic star positions based on index
const generateStarPosition = (index: number) => {
  // Use a simple hash-like function to generate consistent positions
  const seed = index * 2654435761 % 2147483647
  const x = (seed % 100)
  const y = ((seed * 7) % 100)
  const duration = 3 + (seed % 20) / 10
  const delay = (seed % 20) / 10
  return { x, y, duration, delay }
}

// Pre-generate star positions to avoid hydration issues
const starPositions = Array.from({ length: 50 }, (_, i) => generateStarPosition(i))

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.8])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <span className="text-xl font-display font-semibold">My AI Onboarding</span>
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="font-sans text-gray-300 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="font-sans text-gray-300 hover:text-white transition">How it Works</a>
            <a href="#pricing" className="font-sans text-gray-300 hover:text-white transition">Pricing</a>
            <a href="#testimonials" className="font-sans text-gray-300 hover:text-white transition">Testimonials</a>
            <motion.a
              href="/survey"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full font-sans font-medium inline-block"
            >
              Start Free
            </motion.a>
          </div>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-black to-teal-900/20" />
        
        {/* Animated background dots */}
        <div className="absolute inset-0">
          {starPositions.map((star, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
              }}
            />
          ))}
        </div>

        <motion.div 
          style={{ opacity, scale }}
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-8"
          >
            <Sparkles className="w-4 h-4 mr-2 text-emerald-400" />
            <span className="text-sm text-emerald-300">A proven approach to actual AI adoption</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight"
          >
            AI isn't a tool.
            <br />
            <span className="gradient-text font-display italic">It's your newest colleague.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl font-body text-gray-400 mb-8 max-w-2xl mx-auto"
          >
            You wouldn't throw a new hire into deep work on day one. 
            So why do that with AI? Start with coffee chats. Build to real collaboration.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.a
              href="/survey"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full font-sans font-semibold text-lg flex items-center justify-center group inline-block"
            >
              Get Your Onboarding Plan
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border border-white/20 rounded-full font-sans font-semibold text-lg hover:bg-white/5 transition"
            >
              See a Sample Plan
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-500"
          >
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
              Start today, free
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              5-minute survey
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-emerald-500" />
              No AI experience needed
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Onboarding that <span className="gradient-text font-display italic">actually works</span>
            </h2>
            <p className="text-xl font-body text-gray-400 max-w-2xl mx-auto">
              We studied how great teams onboard new members. Then we applied it to AI.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Start Where You Are",
                description: "Answer 12 questions. Get a plan that fits your actual work, not generic tutorials.",
                color: "from-emerald-500 to-teal-500"
              },
              {
                icon: Calendar,
                title: "Small Daily Wins",
                description: "15-minute daily sessions. On your calendar. Because consistency beats intensity.",
                color: "from-teal-500 to-cyan-500"
              },
              {
                icon: Target,
                title: "Know It's Working",
                description: "See exactly what's clicking. Track your confidence growing. Measure time saved.",
                color: "from-cyan-500 to-emerald-500"
              },
              {
                icon: Users,
                title: "Find Your Match",
                description: "ChatGPT for brainstorming. Claude for analysis. We help you find who to work with when.",
                color: "from-emerald-600 to-green-500"
              },
              {
                icon: Zap,
                title: "Learn by Doing",
                description: "Real tasks from your actual job. Not tutorials. Not demos. Your work, with AI.",
                color: "from-teal-600 to-emerald-600"
              },
              {
                icon: BarChart3,
                title: "Prove the Value",
                description: "Document wins. Build your case. Show your boss exactly why this matters.",
                color: "from-cyan-600 to-teal-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl"
                  style={{ backgroundImage: `linear-gradient(to right, ${feature.color.split(' ')[1]}, ${feature.color.split(' ')[3]})` }}
                />
                <div className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2">{feature.title}</h3>
                  <p className="font-body text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 px-6 relative bg-black/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">
              Here's what <span className="gradient-text font-display italic">nobody tells you</span>
            </h2>
            <div className="space-y-6 text-xl font-body text-gray-300 text-left max-w-3xl mx-auto">
              <p>
                You don't need another ChatGPT tutorial. You need to change how you work.
              </p>
              <p>
                Think about it: When a new person joins your team, do you hand them a manual and say "good luck"? 
                No. You ease them in. You give them small wins. You build trust over time.
              </p>
              <p>
                <span className="text-white font-semibold">Week 1-2:</span> AI watches you work. You learn what it's good at. Like a new hire shadowing you.
              </p>
              <p>
                <span className="text-white font-semibold">Week 3-4:</span> AI helps with simple tasks. You review everything. Like giving a new colleague their first assignment.
              </p>
              <p>
                <span className="text-white font-semibold">Month 2:</span> AI takes on routine work. You focus on strategy. Like any good delegation.
              </p>
              <p>
                <span className="text-white font-semibold">Month 3:</span> AI handles entire workflows. You can't imagine working without it. Like your best team member.
              </p>
              <p className="text-emerald-400 font-semibold pt-4">
                This isn't about learning AI. It's about changing how you work. One day at a time.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              How you'd <span className="gradient-text font-display italic">onboard any colleague</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Month 1: Get to know each other. Month 2: Work together. Month 3: Trust them with real work.
            </p>
          </motion.div>

          <div className="space-y-24">
            {[
              {
                phase: "Days 1-30",
                title: "The Coffee Chat Phase",
                subtitle: "Get to know your new AI colleague",
                items: [
                  "Start with simple requests - like asking a new hire for help",
                  "Learn their strengths (and quirks)",
                  "Build trust with low-risk tasks",
                  "Discover what they're surprisingly good at"
                ],
                gradient: "from-emerald-500 to-teal-500"
              },
              {
                phase: "Days 31-60",
                title: "The Partnership Phase",
                subtitle: "Start working on real projects together",
                items: [
                  "Delegate your first meaningful task",
                  "Learn when they add value (and when they don't)",
                  "Develop your collaboration rhythm",
                  "Start seeing actual time savings"
                ],
                gradient: "from-teal-500 to-cyan-500"
              },
              {
                phase: "Days 61-90",
                title: "The Trust Phase",
                subtitle: "They're part of your team now",
                items: [
                  "AI handles routine work without oversight",
                  "You focus on work only humans can do",
                  "Your workflow feels incomplete without them",
                  "You're ready to onboard your human colleagues too"
                ],
                gradient: "from-cyan-500 to-emerald-500"
              }
            ].map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center gap-12 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="flex-1">
                  <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${phase.gradient} mb-4`}>
                    <span className="text-sm font-semibold">{phase.phase}</span>
                  </div>
                  <h3 className="text-3xl font-display font-bold mb-2">{phase.title}</h3>
                  <p className="text-xl font-body text-gray-400 mb-6">{phase.subtitle}</p>
                  <ul className="space-y-3">
                    {phase.items.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="font-sans text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-r ${phase.gradient} blur-3xl opacity-20`} />
                    <div className="relative aspect-square rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                      <Lottie animationData={aiAnimationData} className="w-48 h-48" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Start free. <span className="gradient-text font-display italic">Upgrade when it clicks.</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Most people upgrade around day 7. When they realize this actually works.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Explorer",
                price: "$0",
                period: "forever",
                description: "See if this is for you",
                features: [
                  "Your custom 90-day plan",
                  "First week of daily sessions",
                  "Core onboarding exercises",
                  "See your progress",
                  "Enough to know if it's working"
                ],
                cta: "Start Free",
                popular: false
              },
              {
                name: "Collaborator",
                price: "$19",
                period: "/month",
                description: "When you're ready to commit",
                features: [
                  "Everything in free",
                  "Sessions on your calendar (this changes everything)",
                  "All 90 days of exercises",
                  "Track what's working",
                  "Templates that save hours",
                  "Get unstuck fast",
                  "Learn from others who've done it"
                ],
                cta: "Start Free Trial",
                popular: true
              },
              {
                name: "Innovator",
                price: "$49",
                period: "/user/month",
                description: "Onboard your whole team",
                features: [
                  "Everything in solo plan",
                  "See how your team adopts",
                  "Exercises for your specific work",
                  "Prove ROI to leadership",
                  "AI right where you work",
                  "Someone who ensures success",
                  "Keep improving together"
                ],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative ${plan.popular ? 'md:-mt-4' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className={`h-full p-8 rounded-2xl ${plan.popular ? 'bg-gradient-to-b from-emerald-900/20 to-transparent' : 'bg-white/5'} backdrop-blur-sm border ${plan.popular ? 'border-emerald-500/50' : 'border-white/10'} hover:border-white/20 transition`}>
                  <h3 className="text-2xl font-display font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                  <p className="font-body text-gray-400 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="font-sans text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-3 rounded-full font-sans font-semibold ${plan.popular ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-white/10 hover:bg-white/20'} transition`}
                  >
                    {plan.cta}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="gradient-text font-display italic">Real people.</span> Real results.
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              They were skeptical too. Here's what changed their minds.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Marketing Manager",
                company: "TechCorp",
                image: "SC",
                quote: "Week 1: Skeptical. Week 2: Curious. Week 3: Can't imagine working without it. The daily calendar reminders made all the difference.",
                rating: 5
              },
              {
                name: "Michael Rodriguez",
                role: "Software Developer",
                company: "StartupXYZ",
                image: "MR",
                quote: "I finally understand WHEN to use AI, not just how. It's like knowing when to Slack a colleague vs. scheduling a meeting. Context matters.",
                rating: 5
              },
              {
                name: "Jessica Park",
                role: "VP of Operations",
                company: "Enterprise Co",
                image: "JP",
                quote: "My team went from 'AI will replace us' to 'AI does the boring stuff.' That mindset shift alone was worth the investment.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="font-body text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mr-4">
                    <span className="text-sm font-semibold">{testimonial.image}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 blur-3xl opacity-20" />
            <div className="relative p-12 rounded-3xl bg-gradient-to-r from-emerald-900/50 to-teal-900/50 backdrop-blur-sm border border-white/20">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Stop reading about AI. <span className="gradient-text font-display italic">Start working with it.</span>
              </h2>
              <p className="text-xl font-body text-gray-300 mb-8 max-w-2xl mx-auto">
                You've tried the tutorials. You've watched the videos. 
                Now try the only thing that works: showing up daily.
              </p>
              <motion.a
                href="/survey"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-black rounded-full font-sans font-semibold text-lg inline-flex items-center group"
              >
                Get My 90-Day Plan
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <p className="mt-4 text-sm text-gray-400">
                Free to start • 5-minute survey • Works with your actual job
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-6 h-6 text-emerald-400" />
                <span className="text-xl font-display font-semibold">My AI Onboarding</span>
              </div>
              <p className="font-body text-gray-400 text-sm">
                Finally, AI onboarding that makes sense.
              </p>
            </div>
            <div>
              <h3 className="font-display font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="font-sans hover:text-white transition">Features</a></li>
                <li><a href="#" className="font-sans hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="font-sans hover:text-white transition">Testimonials</a></li>
                <li><a href="#" className="font-sans hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="font-sans hover:text-white transition">About</a></li>
                <li><a href="#" className="font-sans hover:text-white transition">Blog</a></li>
                <li><a href="#" className="font-sans hover:text-white transition">Careers</a></li>
                <li><a href="#" className="font-sans hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="font-sans hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="font-sans hover:text-white transition">Terms</a></li>
                <li><a href="#" className="font-sans hover:text-white transition">Security</a></li>
                <li><a href="#" className="font-sans hover:text-white transition">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2025 My AI Onboarding. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="font-sans hover:text-white transition">Twitter</a>
              <a href="#" className="font-sans hover:text-white transition">LinkedIn</a>
              <a href="#" className="font-sans hover:text-white transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}