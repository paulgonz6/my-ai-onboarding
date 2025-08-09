-- Seed data only - run this if you already have the tables created
-- This script only inserts the activity templates data

-- Clear existing activity templates (optional - uncomment if you want to reset)
-- DELETE FROM activity_templates;

-- Phase 1: Foundation Activities (Days 1-30)

INSERT INTO activity_templates (
  title,
  description,
  duration_minutes,
  difficulty,
  type,
  phase,
  personas,
  work_types,
  overview,
  objectives,
  prerequisites,
  instructions,
  example_prompts,
  success_criteria,
  common_pitfalls,
  resources,
  expected_outcomes,
  reflection_questions,
  alternative_approaches
) VALUES 
(
  'Your First AI Conversation',
  'Have a casual chat with AI about your day. No agenda, just explore.',
  10,
  'easy',
  'exercise',
  1,
  ARRAY['cautious-explorer', 'eager-beginner'],
  ARRAY['all'],
  'This is your first official interaction with AI as a colleague. Think of it like a coffee chat with a new team member - casual, exploratory, and without pressure.',
  ARRAY[
    'Overcome initial hesitation about AI interaction',
    'Understand conversational flow and response patterns',
    'Discover AI''s conversational capabilities',
    'Build comfort with natural language interaction'
  ],
  NULL,
  '[
    {
      "step": 1,
      "title": "Choose Your AI Platform",
      "description": "Open ChatGPT, Claude, or your preferred AI tool. If you don''t have an account, create a free one.",
      "time_estimate": 2,
      "tips": ["ChatGPT is great for general conversation", "Claude excels at nuanced discussion", "Start with whichever feels most approachable"]
    },
    {
      "step": 2,
      "title": "Start with a Greeting",
      "description": "Type a simple greeting like you would to a colleague. For example: ''Hi! I''m learning to work with AI. How are you today?''",
      "time_estimate": 1,
      "tips": ["Be natural - no special formatting needed", "AI will match your tone", "It''s okay to be informal"]
    },
    {
      "step": 3,
      "title": "Share Something About Your Day",
      "description": "Tell the AI about something that happened today - a meeting, a challenge, something you''re working on, or even what you had for lunch.",
      "time_estimate": 3,
      "tips": ["No topic is too small", "Practice being specific", "Notice how AI asks follow-up questions"]
    },
    {
      "step": 4,
      "title": "Ask a Question",
      "description": "Ask the AI something you''re genuinely curious about - could be work-related or personal interest.",
      "time_estimate": 3,
      "tips": ["Try ''What do you think about...''", "Ask for perspectives, not just facts", "Follow up on interesting points"]
    },
    {
      "step": 5,
      "title": "Reflect on the Experience",
      "description": "Before closing, tell the AI one thing that surprised you about this conversation.",
      "time_estimate": 1,
      "tips": ["Be honest about your experience", "Note what felt natural vs awkward", "This helps you process the interaction"]
    }
  ]'::jsonb,
  '[
    {
      "tool": "ChatGPT",
      "prompt": "Hi! I''m new to working with AI and wanted to start with a casual conversation. I''m a [your role] and I''m curious about how AI might help with my work. Today I [something from your day]. What''s your take on that?",
      "expected_output": "A friendly, conversational response that acknowledges your introduction, responds to your shared experience, and asks relevant follow-up questions."
    },
    {
      "tool": "Claude",
      "prompt": "Hello! This is my first real conversation with an AI assistant. I work in [your field] and I''m exploring how we might collaborate. Something interesting happened today: [brief story]. Have you helped others in similar situations?",
      "expected_output": "A thoughtful response that relates to your experience, possibly sharing relevant insights or asking clarifying questions to better understand your context."
    }
  ]'::jsonb,
  ARRAY[
    'Completed a 5-10 minute conversation',
    'Asked at least 2 questions',
    'Shared something specific about your work or day',
    'Received responses that made sense in context'
  ],
  ARRAY[
    'Trying to be too formal or technical',
    'Asking only yes/no questions',
    'Not following up on interesting responses',
    'Treating it like a search engine instead of a conversation'
  ],
  '[
    {
      "type": "article",
      "title": "The Art of AI Conversation",
      "url": "https://example.com/ai-conversation-guide",
      "description": "Tips for natural AI interaction"
    },
    {
      "type": "video",
      "title": "First Time with ChatGPT",
      "url": "https://example.com/chatgpt-intro",
      "description": "5-minute walkthrough for beginners"
    }
  ]'::jsonb,
  ARRAY[
    'Reduced anxiety about AI interaction',
    'Understanding of conversational flow',
    'Identified AI''s conversational strengths',
    'Comfort with natural language input'
  ],
  ARRAY[
    'What surprised you most about the conversation?',
    'How did it differ from your expectations?',
    'What would you want to explore in future conversations?',
    'Did any response particularly impress or disappoint you?'
  ],
  '[
    {
      "condition": "If you''re very nervous",
      "approach": "Start by asking AI to explain something you already know well, so you can gauge its accuracy and style"
    },
    {
      "condition": "If you''re more technical",
      "approach": "Try asking about a specific technical challenge you''re facing"
    }
  ]'::jsonb
),
(
  'Email Draft Assistant',
  'Use AI to draft a routine email, then edit it to match your voice.',
  15,
  'easy',
  'experiment',
  1,
  ARRAY['all'],
  ARRAY['all'],
  'Learn to use AI as a writing partner for professional communication. This exercise teaches you to provide context, review output critically, and maintain your authentic voice.',
  ARRAY[
    'Create a professional email draft in under 5 minutes',
    'Learn to provide effective context to AI',
    'Practice editing AI output to match your style',
    'Understand AI''s role as a draft creator, not final author'
  ],
  ARRAY['Basic email account', 'One real email you need to send'],
  '[
    {
      "step": 1,
      "title": "Choose Your Email Task",
      "description": "Select a real email you need to write today - meeting follow-up, project update, request for information, or thank you note.",
      "time_estimate": 2,
      "tips": ["Start with routine emails, not sensitive ones", "Avoid emails with confidential information", "Pick something you''d normally spend 10-15 minutes writing"]
    },
    {
      "step": 2,
      "title": "Provide Context to AI",
      "description": "Give AI the essential information: recipient role, purpose, key points, desired tone, and any specific requirements.",
      "time_estimate": 3,
      "tips": ["Be specific about the recipient", "List 3-5 key points to cover", "Specify formal vs casual tone", "Mention any deadlines or actions needed"]
    },
    {
      "step": 3,
      "title": "Generate Initial Draft",
      "description": "Ask AI to create the email draft based on your context. Read it through completely before making changes.",
      "time_estimate": 2,
      "tips": ["Don''t expect perfection on first try", "Look for structure and completeness", "Note what''s good and what needs work"]
    },
    {
      "step": 4,
      "title": "Personalize the Draft",
      "description": "Edit the draft to sound like you - adjust greetings, add personal touches, modify phrases to match your style.",
      "time_estimate": 5,
      "tips": ["Keep the good structure, change the voice", "Add specific details AI couldn''t know", "Remove overly formal or generic phrases", "Ensure accuracy of all facts"]
    },
    {
      "step": 5,
      "title": "Final Review and Send",
      "description": "Read the email aloud to check flow, verify all details, then send it.",
      "time_estimate": 3,
      "tips": ["Check names and dates carefully", "Ensure the call-to-action is clear", "Save the prompt for future use if it worked well"]
    }
  ]'::jsonb,
  '[
    {
      "tool": "ChatGPT",
      "prompt": "Help me draft a professional email:\\n\\nTo: [Manager/Colleague/Client]\\nPurpose: [Update on project X / Request for Y / Follow-up on Z]\\n\\nKey points to cover:\\n1. [First point]\\n2. [Second point]\\n3. [Third point]\\n\\nTone: [Professional but friendly / Formal / Casual]\\nLength: [Brief 2-3 paragraphs / Detailed]\\nAction needed: [Response by date / No action needed / Approval required]",
      "expected_output": "A complete email draft with subject line, greeting, organized body paragraphs covering all points, clear call-to-action, and professional closing."
    },
    {
      "tool": "Claude",
      "prompt": "I need to write an email to my [recipient role] about [topic]. Context: [brief background]. I want to: 1) [objective 1], 2) [objective 2], 3) [objective 3]. The tone should be [description] and it should be [length]. Please draft this email with a clear subject line.",
      "expected_output": "A well-structured email with appropriate subject line, context-aware content, logical flow, and tone matching your requirements."
    }
  ]'::jsonb,
  ARRAY[
    'Email drafted and sent within 15 minutes',
    'All key points included in final version',
    'Personal voice maintained',
    'Recipient requirements clearly addressed'
  ],
  ARRAY[
    'Sending AI draft without editing',
    'Including sensitive/confidential information',
    'Losing your authentic voice completely',
    'Not fact-checking AI-generated details'
  ],
  '[
    {
      "type": "template",
      "title": "Email Context Template",
      "url": "https://example.com/email-template",
      "description": "Reusable prompt template for common email types"
    },
    {
      "type": "article",
      "title": "AI Email Etiquette Guide",
      "url": "https://example.com/ai-email-guide",
      "description": "Best practices for AI-assisted communication"
    }
  ]'::jsonb,
  ARRAY[
    'Time saved on email drafting',
    'Improved email structure',
    'Consistent professional communication',
    'Reusable prompt patterns identified'
  ],
  ARRAY[
    'How much time did you save compared to writing from scratch?',
    'What did AI do well? What did it miss?',
    'How much editing was required?',
    'Will you use this approach again? Why or why not?'
  ],
  '[
    {
      "condition": "For very formal emails",
      "approach": "Generate multiple versions and combine the best elements"
    },
    {
      "condition": "For creative emails",
      "approach": "Ask AI for 3 different opening approaches and choose the best"
    }
  ]'::jsonb
),
(
  'Meeting Notes Summarizer',
  'Turn messy meeting notes into clear action items with AI.',
  10,
  'easy',
  'experiment',
  1,
  ARRAY['practical-adopter', 'efficiency-seeker'],
  ARRAY['people', 'operations'],
  'Transform scattered meeting notes into organized summaries with clear action items. This teaches you to use AI for information synthesis and structure.',
  ARRAY[
    'Convert raw notes into structured summary',
    'Extract clear action items with owners and deadlines',
    'Learn AI''s capability for information organization',
    'Create consistent meeting documentation'
  ],
  ARRAY['Recent meeting notes (can be messy/incomplete)'],
  '[
    {
      "step": 1,
      "title": "Gather Your Raw Notes",
      "description": "Find notes from a recent meeting - they can be messy, incomplete, or unorganized. Copy them into a document.",
      "time_estimate": 2,
      "tips": ["Include all fragments and partial thoughts", "Don''t worry about organization", "Include names and context where possible"]
    },
    {
      "step": 2,
      "title": "Provide Meeting Context",
      "description": "Tell AI about the meeting: purpose, attendees, main topics discussed, and what kind of summary you need.",
      "time_estimate": 2,
      "tips": ["Specify the meeting type and goal", "List key stakeholders", "Mention any critical decisions needed"]
    },
    {
      "step": 3,
      "title": "Request Structured Summary",
      "description": "Ask AI to organize your notes into sections: Key Decisions, Action Items, Discussion Points, and Next Steps.",
      "time_estimate": 2,
      "tips": ["Request specific format you prefer", "Ask for action items with owners and dates", "Request clarification on unclear points"]
    },
    {
      "step": 4,
      "title": "Review and Enhance",
      "description": "Check the summary for accuracy, add any missing context, and clarify action items.",
      "time_estimate": 3,
      "tips": ["Verify all names and dates", "Add context AI couldn''t know", "Ensure action items are specific and measurable"]
    },
    {
      "step": 5,
      "title": "Distribute and File",
      "description": "Send the summary to attendees and save it in your meeting documentation system.",
      "time_estimate": 1,
      "tips": ["Ask for confirmation on action items", "Create follow-up calendar items", "Save the format for future use"]
    }
  ]'::jsonb,
  '[
    {
      "tool": "ChatGPT",
      "prompt": "Please organize these meeting notes into a structured summary:\\n\\n[Paste your raw notes]\\n\\nMeeting context:\\n- Purpose: [meeting purpose]\\n- Attendees: [list names]\\n- Date: [date]\\n\\nPlease structure as:\\n1. Executive Summary (2-3 sentences)\\n2. Key Decisions Made\\n3. Action Items (with owner and deadline)\\n4. Discussion Points\\n5. Next Steps\\n6. Items for Follow-up",
      "expected_output": "A clean, organized summary with all sections populated, clear action items with assignments, and logical flow from raw notes."
    }
  ]'::jsonb,
  ARRAY[
    'Summary created in under 10 minutes',
    'All action items have clear owners',
    'Key decisions are highlighted',
    'Document is ready to share'
  ],
  ARRAY[
    'Not verifying accuracy of interpretations',
    'Missing important context in raw notes',
    'Accepting AI assumptions without checking',
    'Forgetting to add deadlines to action items'
  ],
  NULL,
  ARRAY[
    'Clear, shareable meeting summary',
    'Time saved on documentation',
    'Consistent meeting note format',
    'Better action item tracking'
  ],
  ARRAY[
    'How much clearer are your action items now?',
    'What patterns did AI identify that you missed?',
    'How will this change your note-taking approach?',
    'What meeting types would benefit most from this?'
  ],
  NULL
);

-- Phase 2 and Phase 3 activities are in the full setup-hosted.sql file
-- Run those separately if needed