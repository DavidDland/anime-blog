// Email validation using Mailgun API

interface MailgunValidationResponse {
  address: string;
  is_disposable_address: boolean;
  is_role_address: boolean;
  reason: string[];
  result: string;
  risk: string;
}

// Basic email format validation (client-side)
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Mailgun email validation
export async function validateEmailWithMailgun(email: string): Promise<{ isValid: boolean; error?: string }> {
  // First, do basic format check
  if (!isValidEmailFormat(email)) {
    return { isValid: false, error: 'Please enter a valid email address format' };
  }

  try {
    // Use Mailgun's public email validation endpoint
    // Note: This is a simplified version. For production, you'd want to use your own API key
    const response = await fetch(`https://api.mailgun.net/v4/address/validate?address=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`api:${process.env.NEXT_PUBLIC_MAILGUN_API_KEY || 'pubkey-5ogiflzbnjrljiky49qngiozqefo156'}`)}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If API fails, fall back to basic validation
      return { isValid: true, error: undefined };
    }

    const data: MailgunValidationResponse = await response.json();

    // Check validation results
    if (data.result === 'deliverable') {
      // Check for disposable emails
      if (data.is_disposable_address) {
        return { isValid: false, error: 'Disposable email addresses are not allowed' };
      }

      // Check for role-based emails (optional - you might want to allow these)
      if (data.is_role_address) {
        return { isValid: false, error: 'Role-based email addresses (admin@, info@, etc.) are not allowed' };
      }

      return { isValid: true };
    } else {
      // Handle different validation results
      switch (data.result) {
        case 'undeliverable':
          return { isValid: false, error: 'This email address appears to be invalid' };
        case 'unknown':
          return { isValid: false, error: 'Unable to verify this email address' };
        case 'risky':
          return { isValid: false, error: 'This email address appears to be risky or invalid' };
        default:
          return { isValid: false, error: 'Email validation failed' };
      }
    }
  } catch (error) {
    // If API call fails, fall back to basic validation
    console.warn('Mailgun validation failed, falling back to basic validation:', error);
    return { isValid: true, error: undefined };
  }
}

// Simplified validation for real-time form feedback
export function getEmailValidationMessage(email: string): string {
  if (!email) return '';
  
  if (!isValidEmailFormat(email)) {
    return 'Please enter a valid email format';
  }

  // Check for obvious fake patterns
  const fakePatterns = [
    /^test@/i,
    /^fake@/i,
    /^temp@/i,
    /^tmp@/i,
    /^example@/i,
    /^demo@/i,
    /^sample@/i,
    /^dummy@/i,
    /^invalid@/i,
    /^noreply@/i,
    /^no-reply@/i,
    /^admin@/i,
    /^info@/i,
    /^contact@/i,
    /^hello@/i,
    /^hi@/i,
    /^user@/i,
    /^guest@/i,
    /^anonymous@/i,
    /^unknown@/i,
    /^random@/i,
    /^123@/i,
    /^abc@/i,
    /^xyz@/i,
    /^qwerty@/i,
    /^asdf@/i,
    /^password@/i,
    /^email@/i,
    /^mail@/i,
  ];

  if (fakePatterns.some(pattern => pattern.test(email))) {
    return 'Please use a real email address';
  }

  // Check for common typos in popular domains
  const domain = email.split('@')[1]?.toLowerCase();
  const commonTypos: { [key: string]: string } = {
    'gmial.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gmeil.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'yhoo.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'yhaoo.com': 'yahoo.com',
    'hotmai.com': 'hotmail.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outllok.com': 'outlook.com',
  };

  if (domain && commonTypos[domain]) {
    return `Did you mean ${email.split('@')[0]}@${commonTypos[domain]}?`;
  }

  return '';
}

// Comprehensive validation function that combines client-side and API validation
export async function validateEmail(email: string): Promise<{ isValid: boolean; error?: string }> {
  // First, do client-side validation
  const clientSideMessage = getEmailValidationMessage(email);
  if (clientSideMessage) {
    return { isValid: false, error: clientSideMessage };
  }

  // Then, do API validation
  return await validateEmailWithMailgun(email);
} 