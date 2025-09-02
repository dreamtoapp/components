/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import axios from 'axios';

// Hardcoded test config (same as sendOtp.ts)
const TEST_CONFIG = {
  PERMANENT_TOKEN: "EAAlbxe42UBwBPB583mFV5rUr0f4i9jPbGlZCwmZAwYyclfGJyA0wqB6pD7cxvKVrN5tceFdygwn84WeeDZBZCsD2ZC1Rbk732lACcbPmBduZBY19xXZCGpOh5Hmz3wVonvnSqASqRvdbMvntHiqReXxmMZAQszNRzJcKXmwm4ASHYREOsbsCJXuTScwYjN4fhH8ZAOQZDZD",
  PHONE_NUMBER_ID: "744540948737430",
  API_VERSION: "v23.0"
};

export async function GET() {
  try {
    console.log('🔐 AUTHENTICATION: Checking confirm template status...');

    // Try to check templates first
    try {
      const response = await axios({
        url: `https://graph.facebook.com/${TEST_CONFIG.API_VERSION}/${TEST_CONFIG.PHONE_NUMBER_ID}/message_templates`,
        method: 'get',
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.PERMANENT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const templates = response.data.data || [];
      const confirmTemplate = templates.find((template: any) => template.name === 'confirm');

      console.log('🔐 AUTHENTICATION: Template check results:', {
        totalTemplates: templates.length,
        confirmTemplateFound: !!confirmTemplate,
        confirmTemplate: confirmTemplate
      });

      if (!confirmTemplate) {
        return NextResponse.json({
          success: false,
          error: 'Confirm template not found',
          availableTemplates: templates.map((t: any) => ({ name: t.name, status: t.status, language: t.language })),
          note: 'You may need to create the "confirm" template in WhatsApp Manager'
        });
      }

      // Check if template is approved for authentication
      const isApproved = confirmTemplate.status === 'APPROVED';
      const canSendWithoutOptin = confirmTemplate.category === 'AUTHENTICATION' || confirmTemplate.category === 'UTILITY';

      return NextResponse.json({
        success: true,
        template: {
          name: confirmTemplate.name,
          status: confirmTemplate.status,
          category: confirmTemplate.category,
          language: confirmTemplate.language,
          components: confirmTemplate.components,
          isApproved,
          canSendWithoutOptin,
          authenticationReady: isApproved && canSendWithoutOptin
        },
        totalTemplates: templates.length,
        availableTemplates: templates.map((t: any) => ({ name: t.name, status: t.status, category: t.category }))
      });

    } catch {
      console.log('🔐 AUTHENTICATION: Template API not accessible, trying direct test...');

      // If template API fails, try a direct template message test
      try {
        const testResponse = await axios({
          url: `https://graph.facebook.com/${TEST_CONFIG.API_VERSION}/${TEST_CONFIG.PHONE_NUMBER_ID}/messages`,
          method: 'post',
          headers: {
            'Authorization': `Bearer ${TEST_CONFIG.PERMANENT_TOKEN}`,
            'Content-Type': 'application/json'
          },
          data: {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: '966502699023',
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
                      text: '123456'
                    }
                  ]
                }
              ]
            }
          }
        });

        // If this works, template exists and is accessible
        return NextResponse.json({
          success: true,
          template: {
            name: 'confirm',
            status: 'APPROVED (tested)',
            category: 'AUTHENTICATION',
            language: 'ar',
            isApproved: true,
            canSendWithoutOptin: true,
            authenticationReady: true,
            testMessageId: testResponse.data.messages?.[0]?.id
          },
          note: 'Template tested successfully - ready for authentication!',
          testResult: 'SUCCESS'
        });

      } catch (testError) {
        console.error('🔐 AUTHENTICATION: Template test failed:', testError);

        return NextResponse.json({
          success: false,
          error: 'Template not accessible or not approved',
          details: (testError as any)?.response?.data || 'No response details',
          note: 'You need to create and approve the "confirm" template in WhatsApp Manager',
          actionRequired: 'Go to business.facebook.com/wa/manage/accounts and create the "confirm" template'
        });
      }
    }

  } catch (error) {
    console.error('🔐 AUTHENTICATION: Template status check failed', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: (error as any)?.response?.data || 'No response details',
        note: 'Check your WhatsApp Business account setup'
      },
      { status: 500 }
    );
  }
}
