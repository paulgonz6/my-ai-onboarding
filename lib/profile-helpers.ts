import { supabase } from './supabase';

/**
 * Helper function to safely save survey answers to a user's profile
 * This function handles retries and ensures data is properly saved
 */
export async function saveSurveyToProfile(
  userId: string,
  surveyAnswers: Record<string, any>,
  persona: string,
  fullName?: string
) {
  console.log('=== SAVING SURVEY TO PROFILE ===');
  console.log('User ID:', userId);
  console.log('Survey Answers:', surveyAnswers);
  console.log('Persona:', persona);
  
  // Ensure we have valid data
  if (!userId || !surveyAnswers || Object.keys(surveyAnswers).length === 0) {
    console.error('Invalid data provided to saveSurveyToProfile');
    throw new Error('Invalid survey data');
  }
  
  // Extract specific fields from survey answers
  const workType = surveyAnswers['work-type'] || null;
  const engagementFrequency = surveyAnswers['engagement-frequency'] || null;
  
  // Prepare the profile data
  const profileData = {
    full_name: fullName,
    persona: persona,
    work_type: workType,
    engagement_frequency: engagementFrequency,
    survey_answers: surveyAnswers, // This will be properly converted to JSONB
    onboarding_completed: true,
    updated_at: new Date().toISOString()
  };
  
  console.log('Profile data to save:', profileData);
  
  // Attempt 1: Try to update existing profile
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();
  
  if (!updateError && updateData) {
    console.log('Successfully updated profile:', updateData);
    return updateData;
  }
  
  console.log('Update failed, trying upsert...', updateError?.message);
  
  // Attempt 2: Use upsert as fallback
  const { data: upsertData, error: upsertError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: '', // Will be filled by the trigger if needed
      ...profileData
    }, {
      onConflict: 'id',
      ignoreDuplicates: false
    })
    .select()
    .single();
  
  if (!upsertError && upsertData) {
    console.log('Successfully upserted profile:', upsertData);
    return upsertData;
  }
  
  console.error('Failed to save survey to profile:', upsertError);
  
  // Attempt 3: Use the database function as last resort
  const { data: functionData, error: functionError } = await supabase
    .rpc('update_profile_survey_answers', {
      user_id: userId,
      survey_data: surveyAnswers,
      user_persona: persona,
      user_work_type: workType,
      user_engagement_frequency: engagementFrequency,
      user_full_name: fullName
    });
  
  if (!functionError && functionData) {
    console.log('Successfully saved via database function:', functionData);
    return functionData;
  }
  
  console.error('All attempts to save survey failed:', functionError);
  throw new Error('Failed to save survey data to profile');
}

/**
 * Verify that survey answers were saved correctly
 */
export async function verifySurveyAnswers(userId: string) {
  console.log('=== VERIFYING SURVEY ANSWERS ===');
  console.log('Checking profile for user:', userId);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  console.log('Profile data retrieved:');
  console.log('- Has survey_answers:', !!data?.survey_answers);
  console.log('- survey_answers content:', data?.survey_answers);
  console.log('- persona:', data?.persona);
  console.log('- work_type:', data?.work_type);
  console.log('- engagement_frequency:', data?.engagement_frequency);
  console.log('- onboarding_completed:', data?.onboarding_completed);
  
  if (!data?.survey_answers || Object.keys(data.survey_answers).length === 0) {
    console.warn('⚠️ Survey answers are missing or empty!');
    return null;
  }
  
  console.log('✅ Survey answers verified successfully');
  return data;
}

/**
 * Retry mechanism for saving survey data
 */
export async function saveSurveyWithRetry(
  userId: string,
  surveyAnswers: Record<string, any>,
  persona: string,
  fullName?: string,
  maxRetries: number = 3
) {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Attempt ${attempt} of ${maxRetries} to save survey data...`);
    
    try {
      // Wait a bit before retrying (exponential backoff)
      if (attempt > 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const result = await saveSurveyToProfile(userId, surveyAnswers, persona, fullName);
      
      // Verify the save was successful
      const verified = await verifySurveyAnswers(userId);
      if (verified) {
        return result;
      }
      
      throw new Error('Verification failed after save');
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);
    }
  }
  
  console.error('All retry attempts failed');
  throw lastError || new Error('Failed to save survey data after multiple attempts');
}