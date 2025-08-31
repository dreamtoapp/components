import { WHATSAPP_CONFIG } from './config';

export const formatPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const validateWhatsAppConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!WHATSAPP_CONFIG.PERMANENT_TOKEN) {
    errors.push('WHATSAPP_PERMANENT_TOKEN environment variable is missing');
  }

  if (!WHATSAPP_CONFIG.PHONE_NUMBER_ID) {
    errors.push('WHATSAPP_PHONE_NUMBER_ID environment variable is missing');
  }

  if (WHATSAPP_CONFIG.PERMANENT_TOKEN && WHATSAPP_CONFIG.PERMANENT_TOKEN.length < 200) {
    errors.push('Invalid or malformed access token');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const logDebug = (message: string, data?: unknown) => {
  console.log(`🔍 DEBUG: ${message}`, data || '');
};

export const logError = (message: string, error?: unknown) => {
  console.error(`❌ ERROR: ${message}`, error || '');
};

export const logSuccess = (message: string, data?: unknown) => {
  console.log(`✅ SUCCESS: ${message}`, data || '');
};
