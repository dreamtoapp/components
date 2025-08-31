import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Hardcoded test config (same as sendOtp.ts)
const TEST_CONFIG = {
  PERMANENT_TOKEN: "EAAlbxe42UBwBPB583mFV5rUr0f4i9jPbGlZCwmZAwYyclfGJyA0wqB6pD7cxvKVrN5tceFdygwn84WeeDZBZCsD2ZC1Rbk732lACcbPmBduZBY19xXZCGpOh5Hmz3wVonvnSqASqRvdbMvntHiqReXxmMZAQszNRzJcKXmwm4ASHYREOsbsCJXuTScwYjN4fhH8ZAOQZDZD",
  PHONE_NUMBER_ID: "744540948737430",
  BUSINESS_ACCOUNT_ID: "752435584083272",
  API_VERSION: "v23.0"
};

export async function GET() {
  try {
    console.log('🔍 DEBUG: Checking WhatsApp Business account status');

    // Check 1: Phone Number Status
    const phoneNumberResponse = await axios({
      url: `https://graph.facebook.com/${TEST_CONFIG.API_VERSION}/${TEST_CONFIG.PHONE_NUMBER_ID}`,
      method: 'get',
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.PERMANENT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Phone Number Status:', phoneNumberResponse.data);

    // Check 2: Business Account Status
    const businessAccountResponse = await axios({
      url: `https://graph.facebook.com/${TEST_CONFIG.API_VERSION}/${TEST_CONFIG.BUSINESS_ACCOUNT_ID}`,
      method: 'get',
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.PERMANENT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Business Account Status:', businessAccountResponse.data);

    // Check 3: Available Templates
    const templatesResponse = await axios({
      url: `https://graph.facebook.com/${TEST_CONFIG.API_VERSION}/${TEST_CONFIG.PHONE_NUMBER_ID}/message_templates`,
      method: 'get',
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.PERMANENT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Available Templates:', templatesResponse.data);

    return NextResponse.json({
      success: true,
      phoneNumber: phoneNumberResponse.data,
      businessAccount: businessAccountResponse.data,
      templates: templatesResponse.data
    });

  } catch (error) {
    console.error('❌ ERROR: Status check failed', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : 'No stack trace'
      },
      { status: 500 }
    );
  }
}
