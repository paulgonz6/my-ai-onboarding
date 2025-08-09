import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testProfileUpdate() {
  console.log('=== TESTING PROFILE UPDATE DIRECTLY ===')
  
  // Test data
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'test123456'
  const testSurveyData = {
    answers: {
      'work-type': 'creative',
      'daily-time': 'deep-work',
      'time-wasters': ['writing', 'research'],
      'ai-experience': 'occasionally',
      'ai-tools': ['chatgpt', 'claude'],
      'learning-style': 'tutorials',
      'engagement-frequency': 'daily',
      'practice-time': 'morning-first',
      'success-metric': 'save-time',
      'accountability': 'just-me'
    },
    persona: 'practical-adopter'
  }

  try {
    // Step 1: Create a test user
    console.log('Step 1: Creating test user...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          survey_completed: true
        }
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return
    }

    if (!authData.user) {
      console.error('No user created')
      return
    }

    console.log('User created successfully:', authData.user.id)

    // Step 2: Wait for trigger to create profile
    console.log('Step 2: Waiting for trigger...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Step 3: Check if profile exists
    console.log('Step 3: Checking if profile exists...')
    const { data: checkProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    console.log('Profile check result:', checkProfile)
    console.log('Profile check error:', checkError)

    // Step 4: Try to update profile
    console.log('Step 4: Attempting to update profile...')
    const profileData = {
      id: authData.user.id,
      email: testEmail,
      full_name: 'Test User',
      persona: testSurveyData.persona,
      work_type: testSurveyData.answers['work-type'],
      engagement_frequency: testSurveyData.answers['engagement-frequency'],
      survey_answers: testSurveyData.answers,
      onboarding_completed: true
    }

    console.log('Profile data to save:', profileData)

    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      console.error('Error details:', {
        message: updateError.message,
        code: updateError.code,
        hint: updateError.hint,
        details: updateError.details
      })
    } else {
      console.log('Update successful:', updateResult)
    }

    // Step 5: Verify the update
    console.log('Step 5: Verifying update...')
    const { data: finalProfile, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    console.log('Final profile:', finalProfile)
    console.log('Survey answers saved:', finalProfile?.survey_answers)
    console.log('Persona saved:', finalProfile?.persona)

    // Cleanup - delete test user
    console.log('Cleaning up test user...')
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id)
    if (deleteError) {
      console.log('Could not delete test user (normal for client-side):', deleteError.message)
    }

  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
testProfileUpdate()