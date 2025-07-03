import {
  isValidEmailFormat,
  getEmailValidationMessage,
  validateEmail,
} from '@/lib/emailValidation'

describe('Email Validation', () => {
  describe('isValidEmailFormat', () => {
    it('should return true for valid email formats', () => {
      const validEmails = [
        'realuser@example.com',
        'user1@gmail.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'abc123@numbers.com',
      ]

      validEmails.forEach(email => {
        expect(isValidEmailFormat(email)).toBe(true)
      })
    })

    it('should return false for invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        '',
        'user@example',
      ]

      invalidEmails.forEach(email => {
        expect(isValidEmailFormat(email)).toBe(false)
      })
    })
  })

  describe('getEmailValidationMessage', () => {
    it('should return empty string for valid emails', () => {
      const validEmails = [
        'realuser@gmail.com',
        'someone@example.org',
        'user.name@domain.com',
      ]

      validEmails.forEach(email => {
        expect(getEmailValidationMessage(email)).toBe('')
      })
    })

    it('should detect fake email patterns', () => {
      const fakeEmails = [
        'test@example.com',
        'fake@temp.com',
        'admin@company.com',
        'info@domain.com',
        'user@temp.com',
      ]

      fakeEmails.forEach(email => {
        const message = getEmailValidationMessage(email)
        expect(message).not.toBe('')
        expect(message).toContain('real email address')
      })
    })

    it('should suggest corrections for common typos', () => {
      const typoEmails = [
        'realuser@gmial.com',
        'someone@yaho.com',
        'abc123@hotmai.com',
        'user1@outlok.com',
      ]

      typoEmails.forEach(email => {
        const message = getEmailValidationMessage(email)
        expect(message).toContain('Did you mean')
      })
    })

    it('should return format error for invalid emails', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
      ]

      invalidEmails.forEach(email => {
        const message = getEmailValidationMessage(email)
        expect(message).toContain('valid email format')
      })
    })
  })

  describe('validateEmail', () => {
    it('should validate email format and return success for valid emails', async () => {
      // Mock the Mailgun API call to return success
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            result: 'deliverable',
            is_disposable_address: false,
            is_role_address: false,
          }),
        })
      ) as jest.Mock

      const result = await validateEmail('realuser@gmail.com')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return error for invalid email format', async () => {
      const result = await validateEmail('invalid-email')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('valid email format')
    })

    it('should return error for fake email patterns', async () => {
      const result = await validateEmail('test@example.com')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('real email address')
    })

    it('should handle API failures gracefully', async () => {
      // Mock the Mailgun API call to fail
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
        })
      ) as jest.Mock

      const result = await validateEmail('realuser@gmail.com')
      expect(result.isValid).toBe(true) // Falls back to basic validation
    })

    it('should handle network errors gracefully', async () => {
      // Mock the fetch to throw an error
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      ) as jest.Mock

      const result = await validateEmail('realuser@gmail.com')
      expect(result.isValid).toBe(true) // Falls back to basic validation
    })
  })
}) 