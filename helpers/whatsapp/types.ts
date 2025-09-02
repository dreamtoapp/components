export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  error?: string;
}

export interface WhatsAppApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  messageId?: string;
}



