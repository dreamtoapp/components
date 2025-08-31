import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Hardcoded test config (same as sendOtp.ts)
const TEST_CONFIG = {
  PERMANENT_TOKEN: "EAAlbxe42UBwBPB583mFV5rUr0f4i9jPbGlZCwmZAwYyclfGJyA0wqB6pD7cxvKVrN5tceFdygwn84WeeDZBZCsD2ZC1Rbk732lACcbPmBduZBY19xXZCGpOh5Hmz3wVonvnSqASqRvdbMvntHiqReXxmMZAQszNRzJcKXmwm4ASHYREOsbsCJXuTScwYjN4fhH8ZAOQZDZD",
  PHONE_NUMBER_ID: "744540948737430",
  API_VERSION: "v23.0"
};

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json();

    console.log('🔍 DEBUG: Sending simple text message', {
      to: phoneNumber,
      message: message
    });

    // Send simple text message (no templates, no restrictions)
    const response = await axios({
      url: `https://graph.facebook.com/${TEST_CONFIG.API_VERSION}/${TEST_CONFIG.PHONE_NUMBER_ID}/messages`,
      method: 'post',
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.PERMANENT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        }
      }
    });

    console.log('✅ SUCCESS: Simple text message sent', response.data);
    console.log('🔍 DETAILED RESPONSE:', JSON.stringify(response.data, null, 2));

    return NextResponse.json({
      success: true,
      messageId: response.data.messages?.[0]?.id,
      status: response.data.messages?.[0]?.message_status,
      response: response.data,
      contacts: response.data.contacts,
      messaging_product: response.data.messaging_product
    });

  } catch (error) {
    console.error('❌ ERROR: Simple text message failed', error);

    // Log detailed error information
    if (error.response) {
      console.error('Error Response:', error.response.data);
      console.error('Error Status:', error.response.status);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error.response?.data || 'No response details'
      },
      { status: 500 }
    );
  }
}
