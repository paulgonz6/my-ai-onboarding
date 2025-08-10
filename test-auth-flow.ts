// Test script to verify the auth flow works correctly
// Run with: npx tsx test-auth-flow.ts

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuthFlow() {
  console.log('🧪 Testing Auth Flow...\n')
  
  const testEmail = `test${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  const testFullName = 'Test User'
  const testSurveyData = {
    answers: {
      'work-type': 'technical',
      'daily-time': 'deep-work',
      'time-wasters': ['email', 'meetings'],
      'ai-experience': 'occasionally',
      'engagement-frequency': 'daily',
      'practice-time': 'morning-first',
      'success-metric': 'save-time'
    },
    persona: 'efficiency-seeker'
  }

  try {
    // Step 1: Sign up
    console.log('1️⃣ Creating user account...')
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testFullName
        }
      }
    })

    if (signUpError) {
      throw new Error(`Signup failed: ${signUpError.message}`)
    }

    console.log('✅ User created:', authData.user?.id)

    // Step 2: Sign in to establish session
    console.log('\n2️⃣ Signing in to establish session...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (signInError) {
      throw new Error(`Sign in failed: ${signInError.message}`)
    }

    console.log('✅ Signed in successfully')

    // Step 3: Upsert profile with survey data
    console.log('\n3️⃣ Saving profile with survey data...')
    const profileData = {
      id: authData.user!.id,
      email: testEmail,
      full_name: testFullName,
      persona: testSurveyData.persona,
      work_type: testSurveyData.answers['work-type'],
      engagement_frequency: testSurveyData.answers['engagement-frequency'],
      survey_answers: testSurveyData.answers,
      onboarding_completed: true
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Profile error:', profileError)
      throw new Error(`Profile upsert failed: ${profileError.message}`)
    }

    console.log('✅ Profile saved successfully')

    // Step 4: Verify profile data
    console.log('\n4️⃣ Verifying saved data...')
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user!.id)
      .single()

    if (verifyError) {
      throw new Error(`Verification failed: ${verifyError.message}`)
    }

    console.log('✅ Profile verified:')
    console.log('  - Full Name:', verifyProfile.full_name)
    console.log('  - Persona:', verifyProfile.persona)
    console.log('  - Work Type:', verifyProfile.work_type)
    console.log('  - Engagement:', verifyProfile.engagement_frequency)
    console.log('  - Survey Answers:', JSON.stringify(verifyProfile.survey_answers, null, 2))
    console.log('  - Onboarding Complete:', verifyProfile.onboarding_completed)

    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    await supabase.auth.admin?.deleteUser(authData.user!.id)
    console.log('✅ Test user deleted')

    console.log('\n🎉 All tests passed! The auth flow is working correctly.')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testAuthFlow().catch(console.error)