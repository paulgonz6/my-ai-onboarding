import { supabase } from './supabase'
import { saveSurveyWithRetry, verifySurveyAnswers } from './profile-helpers'

/**
 * Check for and process any pending survey data after email confirmation
 * This runs when a user logs in for the first time after confirming their email
 */
export async function handlePendingSurveyData(userId: string) {
  console.log('Checking for pending survey data...');
  
  const pendingDataStr = localStorage.getItem('pendingSurveyData');
  
  if (!pendingDataStr) {
    console.log('No pending survey data found');
    return null;
  }
  
  try {
    const pendingData = JSON.parse(pendingDataStr);
    
    // Verify this is for the correct user
    if (pendingData.userId !== userId) {
      console.log('Pending data is for different user, skipping');
      return null;
    }
    
    console.log('Found pending survey data, attempting to save...');
    
    // Save the survey data with retry logic
    const savedProfile = await saveSurveyWithRetry(
      userId,
      pendingData.answers,
      pendingData.persona,
      pendingData.fullName,
      3 // max retries
    );
    
    // Verify the save was successful
    const verified = await verifySurveyAnswers(userId);
    
    if (verified && verified.survey_answers && Object.keys(verified.survey_answers).length > 0) {
      console.log('✅ Successfully saved pending survey data');
      // Clear the pending data
      localStorage.removeItem('pendingSurveyData');
      return savedProfile;
    } else {
      console.error('Failed to verify pending survey data save');
      // Keep the pending data for next attempt
      return null;
    }
  } catch (error) {
    console.error('Error processing pending survey data:', error);
    // Keep the pending data for next attempt
    return null;
  }
}

/**
 * Clear any pending survey data (call this on logout or when appropriate)
 */
export function clearPendingSurveyData() {
  localStorage.removeItem('pendingSurveyData');
}