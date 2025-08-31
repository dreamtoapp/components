import { WHATSAPP_CONFIG, WHATSAPP_API_BASE_URL, TEMPLATE_CONFIG } from '../app/whatsapp/helpers/config';
import { WhatsAppApiResponse, WhatsAppApiError, SendMessagePayload } from '../app/whatsapp/helpers/types';
import { formatPhoneNumber, generateOTP, validateWhatsAppConfig, logDebug, logError, logSuccess } from '../app/whatsapp/helpers/utils';

export class WhatsAppApiService {
  private static validateConfig() {
    const validation = validateWhatsAppConfig();
    if (!validation.isValid) {
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }
  }

  private static async makeApiRequest(payload: SendMessagePayload): Promise<WhatsAppApiResponse> {
    this.validateConfig();

    logDebug('Making API request', {
      url: WHATSAPP_API_BASE_URL,
      payload: JSON.stringify(payload, null, 2)
    });

    const response = await fetch(WHATSAPP_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_CONFIG.PERMANENT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    logDebug('API Response', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: JSON.stringify(data, null, 2)
    });

    if (!response.ok) {
      const error = data as WhatsAppApiError;
      if (error.error?.message?.includes('Malformed access token')) {
        throw new Error('Access token is malformed. Please check your WhatsApp API credentials.');
      }
      throw new Error(error.error?.message || 'Failed to send message');
    }

    return data as WhatsAppApiResponse;
  }

  static async sendTextMessage(to: string, message: string): Promise<WhatsAppApiResponse> {
    const formattedPhone = formatPhoneNumber(to);

    const payload: SendMessagePayload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "text",
      text: {
        body: message
      }
    };

    logDebug('Sending text message', {
      to: formattedPhone,
      message: message.substring(0, 50) + (message.length > 50 ? '...' : '')
    });

    const result = await this.makeApiRequest(payload);
    logSuccess('Text message sent successfully', result);
    return result;
  }

  static async sendTemplateMessage(to: string, templateName: string, language: string, parameters?: string[]): Promise<WhatsAppApiResponse> {
    const formattedPhone = formatPhoneNumber(to);

    const payload: SendMessagePayload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: language
        }
      }
    };

    // Add components if parameters are provided
    if (parameters && parameters.length > 0) {
      payload.template!.components = [
        {
          type: "body",
          parameters: parameters.map(param => ({
            type: "text",
            text: param
          }))
        }
      ];
    }

    logDebug('Sending template message', {
      to: formattedPhone,
      template: templateName,
      language: language,
      parameters: parameters || []
    });

    const result = await this.makeApiRequest(payload);
    logSuccess('Template message sent successfully', result);
    return result;
  }

  static async sendOTP(to: string): Promise<{ otp: string; response: WhatsAppApiResponse }> {
    const otp = generateOTP();

    logDebug('Sending OTP', {
      to: formatPhoneNumber(to),
      otp: otp
    });

    const response = await this.sendTemplateMessage(
      to,
      TEMPLATE_CONFIG.CONFIRM.name,
      TEMPLATE_CONFIG.CONFIRM.language,
      [otp]
    );

    return { otp, response };
  }

  static async sendHelloWorldTemplate(to: string): Promise<WhatsAppApiResponse> {
    return this.sendTemplateMessage(
      to,
      TEMPLATE_CONFIG.HELLO_WORLD.name,
      TEMPLATE_CONFIG.HELLO_WORLD.language
    );
  }

  static async sendVerificationMessage(to: string): Promise<WhatsAppApiResponse> {
    const message = "تم التحقق من رمز التفعيل بنجاح! مرحباً بك في أمواج";
    return this.sendTextMessage(to, message);
  }

  static async sendAutomatedReply(to: string): Promise<WhatsAppApiResponse> {
    const message = "شكراً لك على رسالتك! هذه رسالة تلقائية من أمواج - DreamToApp";
    return this.sendTextMessage(to, message);
  }

  static async sendTestMessage(to: string): Promise<WhatsAppApiResponse> {
    const message = "Test message from DreamToApp - هذا اختبار";
    return this.sendTextMessage(to, message);
  }

  static async sendSimpleTextMessage(to: string): Promise<WhatsAppApiResponse> {
    const message = "Hello! This is a test message from DreamToApp. مرحباً! هذه رسالة اختبار من DreamToApp";
    return this.sendTextMessage(to, message);
  }
}
