import { renderHook, act } from '@testing-library/react'
import { useFormState, validators } from '../useFormState'

describe('useFormState', () => {
  const initialData = {
    name: '',
    email: '',
    age: 0,
  }

  describe('Initial state', () => {
    it('initializes with provided data', () => {
      const { result } = renderHook(() =>
        useFormState({ initialData })
      )

      expect(result.current.data).toEqual(initialData)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.success).toBe(false)
    })
  })

  describe('updateField', () => {
    it('updates a single field', () => {
      const { result } = renderHook(() =>
        useFormState({ initialData })
      )

      act(() => {
        result.current.updateField('name', 'John Doe')
      })

      expect(result.current.data.name).toBe('John Doe')
      expect(result.current.data.email).toBe('')
      expect(result.current.data.age).toBe(0)
    })

    it('clears error when field is updated', () => {
      const { result } = renderHook(() =>
        useFormState({ initialData })
      )

      act(() => {
        result.current.setError('Test error')
      })

      expect(result.current.error).toBe('Test error')

      act(() => {
        result.current.updateField('name', 'John')
      })

      expect(result.current.error).toBeNull()
    })

    it('handles different field types', () => {
      const { result } = renderHook(() =>
        useFormState({ initialData })
      )

      act(() => {
        result.current.updateField('age', 25)
      })

      expect(result.current.data.age).toBe(25)
      expect(typeof result.current.data.age).toBe('number')
    })
  })

  describe('updateFields', () => {
    it('updates multiple fields at once', () => {
      const { result } = renderHook(() =>
        useFormState({ initialData })
      )

      act(() => {
        result.current.updateFields({
          name: 'Jane Doe',
          email: 'jane@example.com',
          age: 30,
        })
      })

      expect(result.current.data).toEqual({
        name: 'Jane Doe',
        email: 'jane@example.com',
        age: 30,
      })
    })

    it('updates partial fields', () => {
      const { result } = renderHook(() =>
        useFormState({ initialData })
      )

      act(() => {
        result.current.updateFields({
          name: 'John',
        })
      })

      expect(result.current.data.name).toBe('John')
      expect(result.current.data.email).toBe('')
      expect(result.current.data.age).toBe(0)
    })

    it('clears error when fields are updated', () => {
      const { result } = renderHook(() =>
        useFormState({ initialData })
      )

      act(() => {
        result.current.setError('Test error')
      })

      act(() => {
        result.current.updateFields({ name: 'John' })
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('reset', () => {
    it('resets form to initial state', () => {
      const { result } = renderHook(() =>
        useFormState({ initialData })
      )

      act(() => {
        result.current.updateFields({
          name: 'John',
          email: 'john@example.com',
          age: 25,
        })
        result.current.setError('Some error')
        result.current.setSuccess(true)
        result.current.setIsLoading(true)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.data).toEqual(initialData)
      expect(result.current.error).toBeNull()
      expect(result.current.success).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('handleSubmit', () => {
    it('handles successful submission', async () => {
      const onSuccess = jest.fn()
      const submitFn = jest.fn().mockResolvedValue({ id: 1 })

      const { result } = renderHook(() =>
        useFormState({ initialData, onSuccess })
      )

      let submitResult: any
      await act(async () => {
        submitResult = await result.current.handleSubmit(submitFn)
      })

      expect(submitFn).toHaveBeenCalledWith(initialData)
      expect(result.current.success).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(onSuccess).toHaveBeenCalledWith({ id: 1 })
      expect(submitResult).toEqual({ id: 1 })
    })

    it('handles submission error', async () => {
      const onError = jest.fn()
      const submitFn = jest.fn().mockRejectedValue(new Error('Submit failed'))

      const { result } = renderHook(() =>
        useFormState({ initialData, onError })
      )

      await act(async () => {
        try {
          await result.current.handleSubmit(submitFn)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(submitFn).toHaveBeenCalledWith(initialData)
      expect(result.current.success).toBe(false)
      expect(result.current.error).toBe('Submit failed')
      expect(result.current.isLoading).toBe(false)
      expect(onError).toHaveBeenCalledWith('Submit failed')
    })

    it('sets loading state during submission', async () => {
      const submitFn = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))

      const { result } = renderHook(() =>
        useFormState({ initialData })
      )

      const submitPromise = act(async () => {
        return result.current.handleSubmit(submitFn)
      })

      // Check loading state immediately after starting submission
      expect(result.current.isLoading).toBe(true)

      await submitPromise

      expect(result.current.isLoading).toBe(false)
    })

    it('handles non-Error objects in catch', async () => {
      const submitFn = jest.fn().mockRejectedValue('String error')

      const { result } = renderHook(() =>
        useFormState({ initialData })
      )

      await act(async () => {
        try {
          await result.current.handleSubmit(submitFn)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('An error occurred')
    })

    it('passes current data to submit function', async () => {
      const submitFn = jest.fn().mockResolvedValue({ success: true })

      const { result } = renderHook(() =>
        useFormState({ initialData })
      )

      act(() => {
        result.current.updateFields({
          name: 'Updated Name',
          email: 'updated@example.com',
        })
      })

      await act(async () => {
        await result.current.handleSubmit(submitFn)
      })

      expect(submitFn).toHaveBeenCalledWith({
        name: 'Updated Name',
        email: 'updated@example.com',
        age: 0,
      })
    })
  })

  describe('validate', () => {
    it('returns true when all validations pass', () => {
      const { result } = renderHook(() =>
        useFormState({ 
          initialData: {
            name: 'John',
            email: 'john@example.com',
          }
        })
      )

      const isValid = act(() => {
        return result.current.validate({
          name: (value) => value ? null : 'Name required',
          email: (value) => value ? null : 'Email required',
        })
      })

      expect(isValid).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('returns false and sets error for first failing validation', () => {
      const { result } = renderHook(() =>
        useFormState({ 
          initialData: {
            name: '',
            email: '',
          }
        })
      )

      let isValid: boolean
      act(() => {
        isValid = result.current.validate({
          name: (value) => !value ? 'Name is required' : null,
          email: (value) => !value ? 'Email is required' : null,
        })
      })

      expect(isValid!).toBe(false)
      expect(result.current.error).toBe('Name is required')
    })

    it('handles partial validation rules', () => {
      const { result } = renderHook(() =>
        useFormState({ 
          initialData: {
            name: 'John',
            email: '',
            age: 25,
          }
        })
      )

      let isValid: boolean
      act(() => {
        isValid = result.current.validate({
          name: (value) => !value ? 'Name required' : null,
          // No validation for email or age
        })
      })

      expect(isValid!).toBe(true)
    })

    it('skips undefined validators', () => {
      const { result } = renderHook(() =>
        useFormState({ 
          initialData: {
            name: 'John',
            email: 'test@example.com',
          }
        })
      )

      let isValid: boolean
      act(() => {
        isValid = result.current.validate({
          name: undefined as any,
          email: (value) => value ? null : 'Email required',
        })
      })

      expect(isValid!).toBe(true)
    })
  })

  describe('Direct setters', () => {
    it('setData updates data directly', () => {
      const { result } = renderHook(() =>
        useFormState({ initialData })
      )

      const newData = { name: 'New', email: 'new@example.com', age: 30 }
      
      act(() => {
        result.current.setData(newData)
      })

      expect(result.current.data).toEqual(newData)
    })

    it('setError updates error directly', () => {
      const { result } = renderHook(() =>
        useFormState({ initialData })
      )

      act(() => {
        result.current.setError('Custom error')
      })

      expect(result.current.error).toBe('Custom error')
    })

    it('setSuccess updates success directly', () => {
      const { result } = renderHook(() =>
        useFormState({ initialData })
      )

      act(() => {
        result.current.setSuccess(true)
      })

      expect(result.current.success).toBe(true)
    })

    it('setIsLoading updates loading state directly', () => {
      const { result } = renderHook(() =>
        useFormState({ initialData })
      )

      act(() => {
        result.current.setIsLoading(true)
      })

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('Callbacks', () => {
    it('maintains callback references across renders', () => {
      const { result, rerender } = renderHook(() =>
        useFormState({ initialData })
      )

      const initialUpdateField = result.current.updateField
      const initialUpdateFields = result.current.updateFields
      const initialReset = result.current.reset
      const initialHandleSubmit = result.current.handleSubmit
      const initialValidate = result.current.validate

      rerender()

      expect(result.current.updateField).toBe(initialUpdateField)
      expect(result.current.updateFields).toBe(initialUpdateFields)
      expect(result.current.reset).toBe(initialReset)
      expect(result.current.handleSubmit).toBe(initialHandleSubmit)
      expect(result.current.validate).toBe(initialValidate)
    })
  })
})

describe('validators', () => {
  describe('required', () => {
    const requiredValidator = validators.required('Field')

    it('returns error for empty value', () => {
      expect(requiredValidator('')).toBe('Field is required')
      expect(requiredValidator(null)).toBe('Field is required')
      expect(requiredValidator(undefined)).toBe('Field is required')
    })

    it('returns null for non-empty value', () => {
      expect(requiredValidator('value')).toBeNull()
      expect(requiredValidator(123)).toBeNull()
      expect(requiredValidator(0)).toBeNull()
      expect(requiredValidator(false)).toBeNull()
    })
  })

  describe('email', () => {
    it('returns error for invalid email', () => {
      expect(validators.email('notanemail')).toBe('Invalid email address')
      expect(validators.email('missing@domain')).toBe('Invalid email address')
      expect(validators.email('@nodomain.com')).toBe('Invalid email address')
      expect(validators.email('spaces in@email.com')).toBe('Invalid email address')
    })

    it('returns null for valid email', () => {
      expect(validators.email('user@example.com')).toBeNull()
      expect(validators.email('user.name@example.co.uk')).toBeNull()
      expect(validators.email('user+tag@example.com')).toBeNull()
    })

    it('returns error for empty value', () => {
      expect(validators.email('')).toBe('Invalid email address')
    })
  })

  describe('minLength', () => {
    const minLength5 = validators.minLength(5)

    it('returns error for too short value', () => {
      expect(minLength5('abc')).toBe('Must be at least 5 characters')
      expect(minLength5('')).toBe('Must be at least 5 characters')
    })

    it('returns null for sufficient length', () => {
      expect(minLength5('12345')).toBeNull()
      expect(minLength5('123456')).toBeNull()
    })

    it('handles different minimum values', () => {
      const minLength10 = validators.minLength(10)
      expect(minLength10('short')).toBe('Must be at least 10 characters')
      expect(minLength10('long enough')).toBeNull()
    })
  })

  describe('maxLength', () => {
    const maxLength10 = validators.maxLength(10)

    it('returns error for too long value', () => {
      expect(maxLength10('this is too long')).toBe('Must be no more than 10 characters')
    })

    it('returns null for acceptable length', () => {
      expect(maxLength10('short')).toBeNull()
      expect(maxLength10('exactly10!')).toBeNull()
      expect(maxLength10('')).toBeNull()
    })

    it('handles different maximum values', () => {
      const maxLength3 = validators.maxLength(3)
      expect(maxLength3('four')).toBe('Must be no more than 3 characters')
      expect(maxLength3('ok')).toBeNull()
    })
  })

  describe('pattern', () => {
    const phonePattern = validators.pattern(
      /^\d{3}-\d{3}-\d{4}$/,
      'Invalid phone number format (XXX-XXX-XXXX)'
    )

    it('returns error for non-matching pattern', () => {
      expect(phonePattern('1234567890')).toBe('Invalid phone number format (XXX-XXX-XXXX)')
      expect(phonePattern('123-456')).toBe('Invalid phone number format (XXX-XXX-XXXX)')
      expect(phonePattern('not a phone')).toBe('Invalid phone number format (XXX-XXX-XXXX)')
    })

    it('returns null for matching pattern', () => {
      expect(phonePattern('123-456-7890')).toBeNull()
      expect(phonePattern('555-555-5555')).toBeNull()
    })

    it('handles empty value', () => {
      expect(phonePattern('')).toBe('Invalid phone number format (XXX-XXX-XXXX)')
    })

    it('works with different patterns', () => {
      const alphaOnly = validators.pattern(/^[a-zA-Z]+$/, 'Letters only')
      expect(alphaOnly('abc123')).toBe('Letters only')
      expect(alphaOnly('abc')).toBeNull()
    })
  })

  describe('Combining validators', () => {
    it('can chain multiple validators', () => {
      const emailValidator = validators.email
      const minLengthValidator = validators.minLength(5)

      // Test email that's too short
      const shortEmail = 'a@b'
      expect(emailValidator(shortEmail)).toBe('Invalid email address')

      // Test valid but short string
      const shortString = 'abc'
      expect(minLengthValidator(shortString)).toBe('Must be at least 5 characters')

      // Test valid email with sufficient length
      const validEmail = 'test@example.com'
      expect(emailValidator(validEmail)).toBeNull()
      expect(minLengthValidator(validEmail)).toBeNull()
    })
  })
})