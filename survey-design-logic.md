# Survey Design Logic & Philosophy
## My AI Onboarding - Adaptive Survey System

**Version:** 1.0  
**Date:** January 2025  
**Purpose:** Document the thinking behind our survey design

---

## Core Philosophy

The survey is designed based on **behavior change readiness**, not technical capability. We're not assessing AI skills—we're understanding how someone works and where they are in their readiness to change those work patterns.

---

## Theoretical Foundations

### 1. ADKAR Model (Prosci)
Our questions map to the ADKAR framework for change management:

- **Awareness**: Do they know why AI matters? → Success metrics question
- **Desire**: What's blocking them? → Concerns question  
- **Knowledge**: How do they learn best? → Learning style
- **Ability**: What can they realistically do? → Time/frequency commitment
- **Reinforcement**: Who will support them? → Accountability question

### 2. "With Me, For Me, By Me" Framework
Questions identify where someone is on the AI collaboration spectrum:

- **"With Me"** (Beginners): AI watches and learns alongside them
- **"For Me"** (Intermediate): AI assists with specific tasks
- **"By Me"** (Advanced): AI acts independently on delegated work

### 3. Behavior Change vs. Skill Acquisition
Traditional approach asks: "Do you know how to write prompts?"
Our approach asks: "What takes up time you wish it didn't?"

We focus on:
- **Context**: What work they actually do
- **Pain Points**: What wastes their time
- **Readiness**: Emotional and practical barriers
- **Capacity**: Realistic commitment levels

---

## Question Categories & Their Purpose

### Category A: Work Context (Questions 1-3)
**Purpose**: Understand their actual job, not their title

**What It Reveals**: Use cases for AI
**How It Shapes the Plan**: Determines which AI tools and exercises to introduce first

Mapping:
- Creative → Focus on ideation, writing, content generation
- Analytical → Focus on data analysis, insights, reporting
- Technical → Focus on code generation, debugging, documentation
- People → Focus on communication, delegation, coaching
- Operations → Focus on process optimization, automation

### Category B: AI Readiness (Questions 4-6)
**Purpose**: Gauge current relationship with AI and barriers

**What It Reveals**: Starting point and speed of progression
**How It Shapes the Plan**: Determines complexity and pacing

Experience levels create different paths:
- **Never used**: Start with trust-building, simple wins
- **Tried once**: Address specific fears, rebuild confidence
- **Occasional user**: Focus on consistency and depth
- **Regular user**: Optimize and expand use cases
- **Power user**: Advanced workflows and team enablement

### Category C: Learning Style (Questions 7-9)
**Purpose**: Customize delivery method and cadence

**What It Reveals**: How they best absorb new behaviors
**How It Shapes the Plan**: Determines exercise format and scheduling

Learning patterns:
- **Jump in**: Give them challenges, not tutorials
- **Step-by-step**: Structured exercises with clear outcomes
- **Watch first**: Video demos before practice
- **Documentation**: Written guides and references
- **With colleague**: Partner exercises and sharing

### Category D: Goals & Success (Questions 10-12)
**Purpose**: Define what success looks like for them

**What It Reveals**: Intrinsic motivation
**How It Shapes the Plan**: What to measure and celebrate

Motivation profiles:
- **Time-savers**: Focus on efficiency metrics
- **Quality-seekers**: Focus on output improvement
- **Capability-builders**: Focus on new skills
- **Team-leaders**: Focus on scaling knowledge

---

## The 3D Persona Mapping System

```
Experience Level (X-axis)
    ↑
    │  Power Optimizer ──── Innovation Driver
    │         │                    │
    │  Efficiency Seeker ── Practical Adopter  
    │         │                    │
    │  Eager Beginner ──── Cautious Explorer
    └────────────────────────────────────→
         Low Support    High Support Needs (Y-axis)
         
         [Speed of adoption is the Z-axis]
```

### The 6 Resulting Personas

#### 1. Cautious Explorer
- **Profile**: Low experience + High concerns + Needs structure
- **Calculation**: `(never/once-twice) + (job-replacement/where-to-start concerns)`
- **Plan Focus**: Heavy hand-holding, daily small wins, lots of reassurance
- **Key Message**: "AI won't replace you, it will help you"

#### 2. Eager Beginner
- **Profile**: Low experience + Low concerns + Ready to learn
- **Calculation**: `(never/once-twice) + (no-concerns/excited)`
- **Plan Focus**: Quick progression, variety of exercises, celebrate wins
- **Key Message**: "Let's dive in and explore together"

#### 3. Practical Adopter
- **Profile**: Some experience + Clear goals + Limited time
- **Calculation**: `(occasionally) + (non-time-focused goals)`
- **Plan Focus**: Focused on specific use cases, efficient exercises
- **Key Message**: "Make AI work for your actual job"

#### 4. Efficiency Seeker
- **Profile**: Some experience + Time-focused + Wants ROI
- **Calculation**: `(occasionally/regularly) + (save-time/eliminate-boring goals)`
- **Plan Focus**: Automation focus, time-tracking, measurable gains
- **Key Message**: "Get hours back in your day"

#### 5. Innovation Driver
- **Profile**: High experience + Team focus + Change agent
- **Calculation**: `(regularly/power-user) + (help-team goal)`
- **Plan Focus**: Advanced techniques, teaching others, case studies
- **Key Message**: "Lead your team into the AI era"

#### 6. Power Optimizer
- **Profile**: High experience + Self-directed + Pushing boundaries
- **Calculation**: `(power-user) + (non-team goals)`
- **Plan Focus**: Cutting-edge uses, workflow integration, experiments
- **Key Message**: "Take your AI skills to the next level"

---

## Question Flow & Branching Logic

### Main Flow
1. Welcome → Work Type
2. Work Type → Daily Time
3. Daily Time → Time Wasters
4. Time Wasters → AI Experience
5. AI Experience → [BRANCH]
   - If never/once-twice → AI Concerns
   - If occasionally/regularly/power → AI Tools Used
6. [Converge] → Learning Style
7. Learning Style → Engagement Frequency
8. Engagement Frequency → Practice Time
9. Practice Time → Success Metric
10. Success Metric → Accountability
11. Accountability → Complete

### Adaptive Elements
- Questions adapt based on previous answers
- Persona calculation happens in real-time
- Plan preview adjusts to show relevant benefits

---

## Engagement Frequency Options (Updated)

Moving away from "daily commitment" to "realistic frequency":

| Frequency | Session Length | Total Weekly Time | Best For |
|-----------|---------------|-------------------|----------|
| Daily | 5-15 minutes | 35-105 min/week | Habit formation, beginners |
| Every other day | 15-20 minutes | 45-70 min/week | Balanced approach |
| 3x per week | 20-30 minutes | 60-90 min/week | Busy professionals |
| 2x per week | 30-45 minutes | 60-90 min/week | Deep work preference |
| Weekly | 45-60 minutes | 45-60 min/week | Extremely busy, experienced |

### Why This Matters
- **Daily** builds habits fastest but requires discipline
- **Every other day** allows processing time between sessions
- **3x week** aligns with typical work patterns (MWF)
- **2x week** works for project-based learning
- **Weekly** maintains momentum without overwhelming

---

## The Magic of Combinations

Each answer influences multiple aspects of the plan:

### Example: Sarah the Marketing Manager
- **Work Type**: Creative → AI for content generation
- **Daily Time**: Collaborative → AI for team communication
- **Time Wasters**: Writing, email → Quick wins identified
- **AI Experience**: Never → Start gentle
- **Concerns**: Where to start → Extra guidance needed
- **Learning Style**: Step-by-step → Structured exercises
- **Frequency**: Every other day → Sustainable pace
- **Practice Time**: Morning → Calendar at 9am MWF
- **Success**: Save time → Track hours saved
- **Accountability**: Manager → Progress reports

**Result**: Cautious Explorer persona with a gentle, structured plan focused on content creation, starting with email drafts, practicing every other morning with clear metrics to show manager.

### Example: Michael the Developer
- **Work Type**: Technical → AI for coding
- **Daily Time**: Deep work → AI for focused sessions
- **Time Wasters**: Documentation → Clear target
- **AI Experience**: Regularly → Can move fast
- **Tools Used**: GitHub Copilot → Build on familiarity
- **Learning Style**: Jump in → Challenge-based
- **Frequency**: Daily → Aggressive progression
- **Practice Time**: Flexible → Fits into flow
- **Success**: New capabilities → Learn advanced features
- **Accountability**: Team → Share learnings

**Result**: Power Optimizer persona with advanced challenges, daily experiments in actual code, focusing on documentation automation and team knowledge sharing.

---

## Why This Approach Works

### 1. Meets People Where They Are
Instead of forcing everyone through the same curriculum, we identify their starting point and build from there.

### 2. Addresses Real Barriers
By asking about concerns upfront, we can proactively address fears and objections in the onboarding content.

### 3. Creates Realistic Expectations
Asking about actual availability (not ideal commitment) leads to sustainable engagement.

### 4. Focuses on Behavior, Not Knowledge
We're not teaching AI; we're changing how people work. The questions reflect this.

### 5. Builds Intrinsic Motivation
By connecting to their personal goals and pain points, the plan feels relevant and valuable.

---

## Future Enhancements

### Potential Additional Questions
1. **Industry/Domain**: Further customize examples
2. **Team Size**: Adjust collaboration features
3. **Tech Comfort**: Fine-tune technical level
4. **Budget**: Recommend free vs. paid tools
5. **Deadline**: Urgency affects pacing

### Dynamic Questioning
Future versions could use AI to:
- Generate follow-up questions based on answers
- Detect inconsistencies and clarify
- Suggest alternative paths
- Predict success likelihood

### Continuous Optimization
- A/B test question wording
- Analyze dropout points
- Correlate answers with 90-day success
- Refine persona definitions

---

## Implementation Notes

### Data Storage
```javascript
// Each answer stored with metadata
{
  questionId: 'work-type',
  answer: 'creative',
  answeredAt: '2025-01-09T10:30:00Z',
  timeToAnswer: 8500, // milliseconds
  changed: false // did they go back and change it?
}
```

### Persona Calculation
```javascript
// Weighted scoring system
const scores = {
  experience: getExperienceScore(answers), // 0-100
  support: getSupportNeedScore(answers),   // 0-100
  pace: getPacePreference(answers),        // slow/medium/fast
  focus: getPrimaryFocus(answers)          // efficiency/learning/team
}

// Map scores to persona
const persona = calculatePersona(scores)
```

### Plan Generation
Each persona maps to:
- Specific exercise sequence
- Appropriate pacing
- Relevant examples
- Success metrics
- Communication style

---

## Conclusion

This survey design is based on behavioral psychology, change management best practices, and user research. It's not just collecting preferences—it's diagnosing readiness for behavior change and creating a truly personalized path to AI collaboration.

The magic isn't in asking about AI skills. It's in understanding how someone works, what motivates them, and meeting them exactly where they are on their journey.

---

*"We're not teaching people to use AI. We're helping them change how they work, one day at a time."*