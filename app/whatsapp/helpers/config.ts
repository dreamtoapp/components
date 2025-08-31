import { WhatsAppConfig } from './types';

export const WHATSAPP_CONFIG: WhatsAppConfig = {
  PERMANENT_TOKEN: process.env.NEXT_PUBLIC_WHATSAPP_PERMANENT_TOKEN,
  PHONE_NUMBER_ID: process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID,
  BUSINESS_ACCOUNT_ID: process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ACCOUNT_ID,
  WEBHOOK_VERIFY_TOKEN: process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_VERIFY_TOKEN,
  APP_SECRET: process.env.NEXT_PUBLIC_WHATSAPP_APP_SECRET,
  API_VERSION: process.env.NEXT_PUBLIC_WHATSAPP_API_VERSION || 'v23.0',
  ENVIRONMENT: process.env.NEXT_PUBLIC_WHATSAPP_ENVIRONMENT || 'production'
};

export const WHATSAPP_API_BASE_URL = `https://graph.facebook.com/${WHATSAPP_CONFIG.API_VERSION}/${WHATSAPP_CONFIG.PHONE_NUMBER_ID}/messages`;

export const TEMPLATE_CONFIG = {
  CONFIRM: {
    name: "confirm",
    language: "ar"
  },
  HELLO_WORLD: {
    name: "hello_world",
    language: "en_US"
  }
};
