export interface Activity {
  id: string
  title: string
  description: string
  duration: number // in minutes
  difficulty: 'easy' | 'medium' | 'advanced'
  type: 'exercise' | 'experiment' | 'reflection' | 'challenge' | 'share'
  phase: 1 | 2 | 3 // 30/60/90 day phases
  personas: string[] // which personas this is suitable for
  workTypes: string[] // which work types this applies to
  outcomes: string[]
  instructions?: string[]
  tools?: string[] // AI tools to use
}

export const activities: Activity[] = [
  // Phase 1: Foundation (Days 1-30)
  {
    id: 'first-conversation',
    title: 'Your First AI Conversation',
    description: 'Have a casual chat with AI about your day. No agenda, just explore.',
    duration: 10,
    difficulty: 'easy',
    type: 'exercise',
    phase: 1,
    personas: ['cautious-explorer', 'eager-beginner'],
    workTypes: ['all'],
    outcomes: ['Overcome initial hesitation', 'Understand conversational flow'],
    tools: ['ChatGPT', 'Claude']
  },
  {
    id: 'email-draft-assistant',
    title: 'Email Draft Assistant',
    description: 'Use AI to draft a routine email, then edit it to match your voice.',
    duration: 15,
    difficulty: 'easy',
    type: 'experiment',
    phase: 1,
    personas: ['all'],
    workTypes: ['all'],
    outcomes: ['Save 10 minutes on email', 'Learn prompt structure'],
    instructions: [
      'Choose an email you need to write today',
      'Tell AI the context and what you need',
      'Review and personalize the draft',
      'Send it!'
    ]
  },
  {
    id: 'meeting-notes-summary',
    title: 'Meeting Notes Summarizer',
    description: 'Turn messy meeting notes into clear action items with AI.',
    duration: 10,
    difficulty: 'easy',
    type: 'experiment',
    phase: 1,
    personas: ['practical-adopter', 'efficiency-seeker'],
    workTypes: ['people', 'operations'],
    outcomes: ['Clear action items', 'Saved follow-up time']
  },
  {
    id: 'brainstorm-partner',
    title: 'Brainstorming Partner',
    description: 'Use AI to generate 10 ideas for a current project.',
    duration: 20,
    difficulty: 'easy',
    type: 'exercise',
    phase: 1,
    personas: ['eager-beginner', 'innovation-driver'],
    workTypes: ['creative', 'operations'],
    outcomes: ['Expanded thinking', 'New perspectives']
  },
  {
    id: 'code-explainer',
    title: 'Code Explainer',
    description: 'Have AI explain a piece of code you\'re working with.',
    duration: 15,
    difficulty: 'easy',
    type: 'exercise',
    phase: 1,
    personas: ['all'],
    workTypes: ['technical'],
    outcomes: ['Better understanding', 'Documentation improvement']
  },
  {
    id: 'data-insights',
    title: 'Quick Data Insights',
    description: 'Upload a spreadsheet and ask AI for key insights.',
    duration: 20,
    difficulty: 'medium',
    type: 'experiment',
    phase: 1,
    personas: ['practical-adopter', 'efficiency-seeker'],
    workTypes: ['analytical', 'operations'],
    outcomes: ['Found patterns', 'Report-ready insights']
  },
  {
    id: 'content-outline',
    title: 'Content Outliner',
    description: 'Create a structured outline for your next piece of content.',
    duration: 15,
    difficulty: 'easy',
    type: 'exercise',
    phase: 1,
    personas: ['all'],
    workTypes: ['creative', 'people'],
    outcomes: ['Clear structure', 'Writing roadmap']
  },
  {
    id: 'weekly-reflection',
    title: 'Week 1 Reflection',
    description: 'Document what surprised you about AI this week.',
    duration: 10,
    difficulty: 'easy',
    type: 'reflection',
    phase: 1,
    personas: ['all'],
    workTypes: ['all'],
    outcomes: ['Awareness of progress', 'Identify preferences']
  },

  // Phase 2: Expansion (Days 31-60)
  {
    id: 'prompt-library',
    title: 'Build Your Prompt Library',
    description: 'Create 5 reusable prompts for your most common tasks.',
    duration: 30,
    difficulty: 'medium',
    type: 'challenge',
    phase: 2,
    personas: ['practical-adopter', 'efficiency-seeker', 'power-optimizer'],
    workTypes: ['all'],
    outcomes: ['Reusable templates', 'Time savings multiplied']
  },
  {
    id: 'workflow-automation',
    title: 'Automate One Workflow',
    description: 'Identify and automate a repetitive task with AI.',
    duration: 45,
    difficulty: 'medium',
    type: 'challenge',
    phase: 2,
    personas: ['efficiency-seeker', 'power-optimizer'],
    workTypes: ['all'],
    outcomes: ['Permanent time savings', 'Process improvement']
  },
  {
    id: 'ai-comparison',
    title: 'AI Model Comparison',
    description: 'Try the same task on 3 different AI models and compare.',
    duration: 30,
    difficulty: 'medium',
    type: 'experiment',
    phase: 2,
    personas: ['innovation-driver', 'power-optimizer'],
    workTypes: ['all'],
    outcomes: ['Found best tool for job', 'Deeper understanding'],
    tools: ['ChatGPT', 'Claude', 'Gemini']
  },
  {
    id: 'team-demo',
    title: 'Show a Colleague',
    description: 'Demonstrate one AI technique to a team member.',
    duration: 20,
    difficulty: 'medium',
    type: 'share',
    phase: 2,
    personas: ['innovation-driver', 'practical-adopter'],
    workTypes: ['all'],
    outcomes: ['Knowledge sharing', 'Team adoption']
  },
  {
    id: 'complex-analysis',
    title: 'Complex Analysis Project',
    description: 'Use AI for a multi-step analysis project.',
    duration: 60,
    difficulty: 'advanced',
    type: 'challenge',
    phase: 2,
    personas: ['power-optimizer', 'innovation-driver'],
    workTypes: ['analytical', 'technical'],
    outcomes: ['Advanced capability', 'Real project completion']
  },
  {
    id: 'creative-collaboration',
    title: 'Creative Co-Creation',
    description: 'Create something original with AI as your partner.',
    duration: 45,
    difficulty: 'medium',
    type: 'experiment',
    phase: 2,
    personas: ['eager-beginner', 'innovation-driver'],
    workTypes: ['creative'],
    outcomes: ['Original creation', 'Creative confidence']
  },
  {
    id: 'documentation-generator',
    title: 'Documentation Generator',
    description: 'Use AI to create comprehensive documentation.',
    duration: 30,
    difficulty: 'medium',
    type: 'experiment',
    phase: 2,
    personas: ['practical-adopter', 'efficiency-seeker'],
    workTypes: ['technical', 'operations'],
    outcomes: ['Complete documentation', 'Process captured']
  },
  {
    id: 'month-2-reflection',
    title: 'Month 2 Progress Check',
    description: 'Measure your time savings and quality improvements.',
    duration: 15,
    difficulty: 'easy',
    type: 'reflection',
    phase: 2,
    personas: ['all'],
    workTypes: ['all'],
    outcomes: ['Quantified progress', 'Success stories']
  },

  // Phase 3: Mastery (Days 61-90)
  {
    id: 'custom-gpt',
    title: 'Create Custom GPT/Agent',
    description: 'Build a specialized AI assistant for your specific needs.',
    duration: 60,
    difficulty: 'advanced',
    type: 'challenge',
    phase: 3,
    personas: ['power-optimizer', 'innovation-driver'],
    workTypes: ['all'],
    outcomes: ['Custom tool created', 'Deep customization']
  },
  {
    id: 'team-playbook',
    title: 'Team AI Playbook',
    description: 'Document AI best practices for your team.',
    duration: 45,
    difficulty: 'advanced',
    type: 'share',
    phase: 3,
    personas: ['innovation-driver'],
    workTypes: ['all'],
    outcomes: ['Team resource', 'Scaled knowledge']
  },
  {
    id: 'roi-calculation',
    title: 'Calculate Your ROI',
    description: 'Measure and document your AI productivity gains.',
    duration: 30,
    difficulty: 'medium',
    type: 'reflection',
    phase: 3,
    personas: ['efficiency-seeker', 'practical-adopter'],
    workTypes: ['all'],
    outcomes: ['Proven value', 'Business case']
  },
  {
    id: 'advanced-integration',
    title: 'Tool Integration',
    description: 'Connect AI to your existing tools and workflows.',
    duration: 60,
    difficulty: 'advanced',
    type: 'challenge',
    phase: 3,
    personas: ['power-optimizer'],
    workTypes: ['technical', 'operations'],
    outcomes: ['Seamless workflow', 'Full integration']
  },
  {
    id: 'mentor-others',
    title: 'Mentor Someone',
    description: 'Help someone else start their AI journey.',
    duration: 30,
    difficulty: 'medium',
    type: 'share',
    phase: 3,
    personas: ['innovation-driver', 'power-optimizer'],
    workTypes: ['all'],
    outcomes: ['Leadership demonstrated', 'Knowledge reinforced']
  },
  {
    id: 'innovation-project',
    title: 'Innovation Project',
    description: 'Use AI to create something that wasn\'t possible before.',
    duration: 90,
    difficulty: 'advanced',
    type: 'challenge',
    phase: 3,
    personas: ['innovation-driver', 'power-optimizer'],
    workTypes: ['all'],
    outcomes: ['Innovation achieved', 'New capability']
  },
  {
    id: 'final-celebration',
    title: '90-Day Celebration',
    description: 'Reflect on your journey and plan what\'s next.',
    duration: 20,
    difficulty: 'easy',
    type: 'reflection',
    phase: 3,
    personas: ['all'],
    workTypes: ['all'],
    outcomes: ['Journey completed', 'Future planned']
  }
]

// Function to get activities for a specific persona and phase
export function getActivitiesForPersona(
  persona: string,
  phase: number,
  workType: string,
  frequency: string
): Activity[] {
  // Filter activities suitable for this persona
  let suitableActivities = activities.filter(activity => 
    activity.phase === phase &&
    (activity.personas.includes(persona) || activity.personas.includes('all')) &&
    (activity.workTypes.includes(workType) || activity.workTypes.includes('all'))
  )

  // Adjust number of activities based on frequency
  const activityCount = {
    'daily': 20,      // ~20 activities per month
    'every-other': 15, // ~15 activities per month
    '3-times': 12,    // ~12 activities per month
    'twice': 8,       // ~8 activities per month
    'weekly': 4       // ~4 activities per month
  }[frequency] || 12

  // Sort by difficulty (easy first for cautious, advanced first for power users)
  if (persona === 'cautious-explorer' || persona === 'eager-beginner') {
    suitableActivities.sort((a, b) => {
      const order = { easy: 0, medium: 1, advanced: 2 }
      return order[a.difficulty] - order[b.difficulty]
    })
  } else if (persona === 'power-optimizer' || persona === 'innovation-driver') {
    suitableActivities.sort((a, b) => {
      const order = { easy: 2, medium: 1, advanced: 0 }
      return order[a.difficulty] - order[b.difficulty]
    })
  }

  // Return the right number of activities
  return suitableActivities.slice(0, Math.ceil(activityCount / 3)) // Divided by 3 for 30-day phase
}

// Generate complete 90-day plan
export function generate90DayPlan(
  persona: string,
  workType: string,
  frequency: string,
  timeWasters: string[],
  goals: string
) {
  const phase1Activities = getActivitiesForPersona(persona, 1, workType, frequency)
  const phase2Activities = getActivitiesForPersona(persona, 2, workType, frequency)
  const phase3Activities = getActivitiesForPersona(persona, 3, workType, frequency)

  // Prioritize activities that address time wasters
  const prioritizeByTimeWasters = (activities: Activity[]) => {
    return activities.sort((a, b) => {
      const aRelevant = timeWasters.some(tw => 
        a.title.toLowerCase().includes(tw) || 
        a.description.toLowerCase().includes(tw)
      )
      const bRelevant = timeWasters.some(tw => 
        b.title.toLowerCase().includes(tw) || 
        b.description.toLowerCase().includes(tw)
      )
      return (bRelevant ? 1 : 0) - (aRelevant ? 1 : 0)
    })
  }

  return {
    phase1: {
      title: 'Foundation: Small Wins, Big Confidence',
      subtitle: 'Get comfortable with AI as your colleague',
      activities: prioritizeByTimeWasters(phase1Activities)
    },
    phase2: {
      title: 'Expansion: From Learning to Doing',
      subtitle: 'Integrate AI into your real work',
      activities: prioritizeByTimeWasters(phase2Activities)
    },
    phase3: {
      title: 'Mastery: Automation and Innovation',
      subtitle: 'AI becomes second nature',
      activities: prioritizeByTimeWasters(phase3Activities)
    }
  }
}