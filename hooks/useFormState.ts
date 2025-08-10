import { useState, useCallback } from 'react'

interface FormState<T> {
  data: T
  isLoading: boolean
  error: string | null
  success: boolean
}

interface UseFormStateOptions<T> {
  initialData: T
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useFormState<T extends Record<string, any>>({
  initialData,
  onSuccess,
  onError
}: UseFormStateOptions<T>) {
  const [data, setData] = useState<T>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Update single field
  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setData(prev => ({ ...prev, [field]: value }))
    setError(null) // Clear error on field update
  }, [])

  // Update multiple fields
  const updateFields = useCallback((updates: Partial<T>) => {
    setData(prev => ({ ...prev, ...updates }))
    setError(null)
  }, [])

  // Reset form to initial state
  const reset = useCallback(() => {
    setData(initialData)
    setError(null)
    setSuccess(false)
    setIsLoading(false)
  }, [initialData])

  // Submit handler wrapper
  const handleSubmit = useCallback(async (
    submitFn: (data: T) => Promise<any>
  ) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await submitFn(data)
      setSuccess(true)
      onSuccess?.(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [data, onSuccess, onError])

  // Validation helper
  const validate = useCallback((
    validationRules: Partial<Record<keyof T, (value: any) => string | null>>
  ): boolean => {
    for (const [field, validator] of Object.entries(validationRules)) {
      if (validator) {
        const fieldError = (validator as Function)(data[field as keyof T])
        if (fieldError) {
          setError(fieldError)
          return false
        }
      }
    }
    return true
  }, [data])

  return {
    // State
    data,
    isLoading,
    error,
    success,
    
    // Actions
    updateField,
    updateFields,
    reset,
    handleSubmit,
    validate,
    
    // Direct setters (for advanced use cases)
    setData,
    setError,
    setSuccess,
    setIsLoading
  }
}

// Common validation functions
export const validators = {
  required: (fieldName: string) => (value: any) => 
    !value ? `${fieldName} is required` : null,
    
  email: (value: string) => 
    !value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) 
      ? 'Invalid email address' 
      : null,
      
  minLength: (min: number) => (value: string) =>
    !value || value.length < min 
      ? `Must be at least ${min} characters` 
      : null,
      
  maxLength: (max: number) => (value: string) =>
    !value || value.length > max 
      ? `Must be no more than ${max} characters` 
      : null,
      
  pattern: (pattern: RegExp, message: string) => (value: string) =>
    !value || !pattern.test(value) 
      ? message 
      : null
}