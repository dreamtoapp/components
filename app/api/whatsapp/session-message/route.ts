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

    console.log('🔍 DEBUG: Sending session message', {
      to: phoneNumber,
      message: message
    });

    // According to WhatsApp Business API docs, we need to use a different approach
    // Let's try sending a simple text message without any restrictions
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
        to: phoneNumber,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      }
    });

    console.log('✅ SUCCESS: Session message sent', response.data);

    return NextResponse.json({
      success: true,
      messageId: response.data.messages?.[0]?.id,
      status: response.data.messages?.[0]?.message_status
    });

  } catch (error) {
    console.error('❌ ERROR: Session message failed', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
