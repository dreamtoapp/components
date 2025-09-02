"use server"

import axios from 'axios';
// import { WHATSAPP_CONFIG } from '../helpers/config';
import { formatPhoneNumber, generateOTP, logDebug, logError, logSuccess } from '../helpers/utils';


// Hardcoded test data - will be replaced with environment variables once confirmed working
const TEST_CONFIG = {
  PERMANENT_TOKEN: "EAAlbxe42UBwBPB583mFV5rUr0f4i9jPbGlZCwmZAwYyclfGJyA0wqB6pD7cxvKVrN5tceFdygwn84WeeDZBZCsD2ZC1Rbk732lACcbPmBduZBY19xXZCGpOh5Hmz3wVonvnSqASqRvdbMvntHiqReXxmMZAQszNRzJcKXmwm4ASHYREOsbsCJXuTScwYjN4fhH8ZAOQZDZD",
  PHONE_NUMBER_ID: "744540948737430",
  BUSINESS_ACCOUNT_ID: "752435584083272",
  WEBHOOK_VERIFY_TOKEN: "ammwag_webhook_2024",
  APP_SECRET: "bde6d09b706496ceb34352ce56f518df",
  API_VERSION: "v23.0",
  ENVIRONMENT: "production"
};


export async function sendTemplateMessage() {
  try {
    // Hardcoded phone number for testing
    const formattedPhone = "966502699023"; // Your phone number
    const otp = generateOTP();

    logDebug('Sending OTP template message', {
      to: formattedPhone,
      otp: otp
    });

    // FIRST: Send a session message to establish 24-hour window
    try {
      const sessionResponse = await axios({
        url: `https://graph.facebook.com/${TEST_CONFIG.API_VERSION}/${TEST_CONFIG.PHONE_NUMBER_ID}/messages`,
        method: 'post',
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.PERMANENT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        data: {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: {
            body: `مرحباً! هذا اختبار من أمواج - DreamToApp. رمز التحقق الخاص بك هو: ${otp}`
          }
        }
      });

      logSuccess('Session message sent successfully', sessionResponse.data);

      // Wait 2 seconds before sending template
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (sessionError) {
      logError('Session message failed, trying template directly', sessionError);
    }

    // SECOND: Send session message OTP (works immediately)
    const response = await axios({
      url: `https://graph.facebook.com/${TEST_CONFIG.API_VERSION}/${TEST_CONFIG.PHONE_NUMBER_ID}/messages`,
      method: 'post',
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.PERMANENT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: `🔐 رمز التحقق الخاص بك هو: ${otp}\n\nمرحباً بك في أمواج - DreamToApp\n\nهذا رمز آمن للتحقق من هويتك.`
        }
      }
    });

    logSuccess('OTP template message sent successfully', response.data);
    return { success: true, otp, response: response.data };

  } catch (error) {
    logError('Failed to send OTP template message', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to send OTP');
  }
}

// NEW: Send OTP via Template (no user initiation required) - AUTHENTICATION FOCUSED
export async function sendOTPViaTemplate(phoneNumber: string) {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const otp = generateOTP();

    logDebug('🔐 AUTHENTICATION: Sending OTP via confirm template (no opt-in required)', {
      to: formattedPhone,
      otp: otp,
      template: 'confirm',
      language: 'ar'
    });

    // Send confirm template directly for authentication (no 24-hour window needed)
    const response = await axios({
      url: `https://graph.facebook.com/${TEST_CONFIG.API_VERSION}/${TEST_CONFIG.PHONE_NUMBER_ID}/messages`,
      method: 'post',
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.PERMANENT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'template',
        template: {
          name: 'confirm',
          language: {
            code: 'ar'
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: otp
                }
              ]
            }
          ]
        }
      }
    });

    logSuccess('🔐 AUTHENTICATION: OTP template sent successfully', response.data);

    // Return detailed response for debugging
    return {
      success: true,
      otp,
      response: response.data,
      messageId: response.data.messages?.[0]?.id,
      status: response.data.messages?.[0]?.message_status,
      templateUsed: 'confirm',
      language: 'ar',
      authenticationType: 'template_no_optin'
    };

  } catch (error) {
    logError('🔐 AUTHENTICATION: Failed to send OTP via template', error);

    // Enhanced error details for debugging without using any
    const maybeAxiosError = error as { response?: { data?: unknown; status?: number } };
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      response: maybeAxiosError.response?.data,
      status: maybeAxiosError.response?.status,
      template: 'confirm',
      language: 'ar'
    };

    throw new Error(`Authentication OTP failed: ${errorDetails.message}`);
  }
}

// NEW: Send OTP via Session Message (requires user to message first)
export async function sendOTPViaSession(phoneNumber: string) {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const otp = generateOTP();

    logDebug('Sending OTP via session message (requires user initiation)', {
      to: formattedPhone,
      otp: otp
    });

    // Send session message (only works if user messaged first within 24 hours)
    const response = await axios({
      url: `https://graph.facebook.com/${TEST_CONFIG.API_VERSION}/${TEST_CONFIG.PHONE_NUMBER_ID}/messages`,
      method: 'post',
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.PERMANENT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: `🔐 رمز التحقق الخاص بك هو: ${otp}\n\nمرحباً بك في أمواج - DreamToApp\n\nهذا رمز آمن للتحقق من هويتك.`
        }
      }
    });

    logSuccess('OTP session message sent successfully', response.data);
    return { success: true, otp, response: response.data };

  } catch (error) {
    logError('Failed to send OTP via session message', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to send OTP session message');
  }
}