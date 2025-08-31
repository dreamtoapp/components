export interface WhatsAppConfig {
  PERMANENT_TOKEN: string | undefined;
  PHONE_NUMBER_ID: string | undefined;
  BUSINESS_ACCOUNT_ID: string | undefined;
  WEBHOOK_VERIFY_TOKEN: string | undefined;
  APP_SECRET: string | undefined;
  API_VERSION: string;
  ENVIRONMENT: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  timestamp: Date;
  isUser: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface WhatsAppApiResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
    message_status: string;
  }>;
}

export interface WhatsAppApiError {
  error: {
    message: string;
    type: string;
    code: number;
  };
}

export interface SendMessagePayload {
  messaging_product: "whatsapp";
  to: string;
  type: "text" | "template";
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
}
