/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';

// Hardcoded test config (same as sendOtp.ts)
const TEST_CONFIG = {
  PERMANENT_TOKEN: "EAAlbxe42UBwBPB583mFV5rUr0f4i9jPbGlZCwmZAwYyclfGJyA0wqB6pD7cxvKVrN5tceFdygwn84WeeDZBZCsD2ZC1Rbk732lACcbPmBduZBY19xXZCGpOh5Hmz3wVonvnSqASqRvdbMvntHiqReXxmMZAQszNRzJcKXmwm4ASHYREOsbsCJXuTScwYjN4fhH8ZAOQZDZD",
  PHONE_NUMBER_ID: "744540948737430",
  BUSINESS_ACCOUNT_ID: "752435584083272",
  API_VERSION: "v23.0"
};

interface DiagnosticCheck {
  success: boolean;
  data?: any;
  error?: any;
  verified?: boolean;
  code_verification_status?: string;
  quality_rating?: string;
  status?: string | number;
  name?: string;
  currency?: string;
  timezone_id?: string;
  statusCode?: number;
  statusText?: string;
  id?: string;
  templates?: any[];
  total?: number;
  messageId?: string;
  contacts?: any;
}

interface DiagnosticResults {
  timestamp: string;
  config: {
    phoneNumberId: string;
    businessAccountId: string;
    apiVersion: string;
    tokenLength: number;
  };
  checks: {
    phoneNumber?: DiagnosticCheck;
    businessAccount?: DiagnosticCheck;
    testMessage?: DiagnosticCheck;
    appPermissions?: DiagnosticCheck;
    templates?: DiagnosticCheck;
  };
}

export async function GET() {
  try {
    console.log('🔍 DEBUG: Running deep diagnostic...');

    const diagnosticResults: DiagnosticResults = {
      timestamp: new Date().toISOString(),
      config: {
        phoneNumberId: TEST_CONFIG.PHONE_NUMBER_ID,
        businessAccountId: TEST_CONFIG.BUSINESS_ACCOUNT_ID,
        apiVersion: TEST_CONFIG.API_VERSION,
        tokenLength: TEST_CONFIG.PERMANENT_TOKEN.length
      },
      checks: {}
    };

    // Check 1: Phone Number Status
    try {
      const phoneResponse = await axios({
        url: `https://graph.facebook.com/${TEST_CONFIG.API_VERSION}/${TEST_CONFIG.PHONE_NUMBER_ID}`,
        method: 'get',
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.PERMANENT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      diagnosticResults.checks.phoneNumber = {
        success: true,
        data: phoneResponse.data,
        verified: phoneResponse.data.verified,
        code_verification_status: phoneResponse.data.code_verification_status,
        quality_rating: phoneResponse.data.quality_rating,
        status: phoneResponse.data.status
      };

      console.log('✅ Phone Number Check:', phoneResponse.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      diagnosticResults.checks.phoneNumber = {
        success: false,
        error: axiosError.response?.data || axiosError.message
      };
      console.error('❌ Phone Number Check Failed:', axiosError.response?.data);
    }

    // Check 2: Business Account Status
    try {
      const businessResponse = await axios({
        url: `https://graph.facebook.com/${TEST_CONFIG.API_VERSION}/${TEST_CONFIG.BUSINESS_ACCOUNT_ID}`,
        method: 'get',
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.PERMANENT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      diagnosticResults.checks.businessAccount = {
        success: true,
        data: businessResponse.data,
        name: businessResponse.data.name,
        currency: businessResponse.data.currency,
        timezone_id: businessResponse.data.timezone_id
      };

      console.log('✅ Business Account Check:', businessResponse.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      diagnosticResults.checks.businessAccount = {
        success: false,
        error: axiosError.response?.data || axiosError.message
      };
      console.error('❌ Business Account Check Failed:', axiosError.response?.data);
    }

    // Check 3: Test Message Send (with detailed logging)
    try {
      const testMessageResponse = await axios({
        url: `https://graph.facebook.com/${TEST_CONFIG.API_VERSION}/${TEST_CONFIG.PHONE_NUMBER_ID}/messages`,
        method: 'post',
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.PERMANENT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        data: {
          messaging_product: 'whatsapp',
          to: '966502699023',
          type: 'text',
          text: {
            body: '🔍 Diagnostic Test Message - DreamToApp'
          }
        }
      });

      diagnosticResults.checks.testMessage = {
        success: true,
        data: testMessageResponse.data,
        messageId: testMessageResponse.data.messages?.[0]?.id,
        status: testMessageResponse.data.messages?.[0]?.message_status,
        contacts: testMessageResponse.data.contacts
      };

      console.log('✅ Test Message Check:', testMessageResponse.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      diagnosticResults.checks.testMessage = {
        success: false,
        error: axiosError.response?.data || axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText
      };
      console.error('❌ Test Message Check Failed:', axiosError.response?.data);
    }

    // Check 4: App Permissions
    try {
      const appResponse = await axios({
        url: `https://graph.facebook.com/${TEST_CONFIG.API_VERSION}/me`,
        method: 'get',
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.PERMANENT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      diagnosticResults.checks.appPermissions = {
        success: true,
        data: appResponse.data,
        id: appResponse.data.id,
        name: appResponse.data.name
      };

      console.log('✅ App Permissions Check:', appResponse.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      diagnosticResults.checks.appPermissions = {
        success: false,
        error: axiosError.response?.data || axiosError.message
      };
      console.error('❌ App Permissions Check Failed:', axiosError.response?.data);
    }

    // Check 5: Template Status
    try {
      const templateResponse = await axios({
        url: `https://graph.facebook.com/${TEST_CONFIG.API_VERSION}/${TEST_CONFIG.PHONE_NUMBER_ID}/message_templates`,
        method: 'get',
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.PERMANENT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      diagnosticResults.checks.templates = {
        success: true,
        data: templateResponse.data,
        templates: templateResponse.data.data,
        total: templateResponse.data.data?.length || 0
      };

      console.log('✅ Template Status Check:', templateResponse.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      diagnosticResults.checks.templates = {
        success: false,
        error: axiosError.response?.data || axiosError.message,
        status: axiosError.response?.status
      };
      console.error('❌ Template Status Check Failed:', axiosError.response?.data);
    }

    console.log('🔍 COMPLETE DIAGNOSTIC RESULTS:', JSON.stringify(diagnosticResults, null, 2));

    return NextResponse.json({
      success: true,
      diagnostic: diagnosticResults
    });

  } catch (error) {
    console.error('❌ ERROR: Deep diagnostic failed', error);

    const axiosError = error as AxiosError;
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: axiosError.response?.data || 'No response details'
      },
      { status: 500 }
    );
  }
}
