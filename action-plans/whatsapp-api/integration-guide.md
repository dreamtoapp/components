# 🔗 WhatsApp Cloud API - E-commerce Integration Guide

## 📋 **Integration Overview**
This guide explains how to seamlessly integrate the tested WhatsApp Cloud API into your main e-commerce application for order notifications, delivery updates, and customer communication.

## 🎯 **Pre-Integration Checklist**
- [ ] WhatsApp Business API account fully configured
- [ ] All API endpoints tested and working
- [ ] Webhook handlers verified
- [ ] Environment variables configured
- [ ] Rate limiting tested
- [ ] Security measures implemented

## 📁 **Files to Copy**

### **Core API Files**
```
app/api/whatsapp/ → [ecommerce-app]/app/api/whatsapp/
├── send/route.ts
├── send-template/route.ts
├── webhook/route.ts
└── status/route.ts
```

### **Service Files**
```
lib/whatsapp/ → [ecommerce-app]/lib/whatsapp/
├── whatsapp.service.ts
├── webhook.handler.ts
├── template.manager.ts
└── types.ts
```

### **Dependencies (package.json)**
```json
{
  "axios": "^1.6.0",
  "crypto": "^1.0.1"
}
```

### **Environment Variables**
```env
# .env.local
WHATSAPP_ACCESS_TOKEN=your_production_access_token
WHATSAPP_PHONE_NUMBER_ID=your_production_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_production_webhook_verify_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_production_business_account_id
```

## 🏗️ **Integration Steps**

### 1. **Copy API Structure**
```bash
# Create WhatsApp API directory
mkdir -p [ecommerce-app]/app/api/whatsapp

# Copy all API routes
cp -r app/api/whatsapp/* [ecommerce-app]/app/api/whatsapp/

# Create lib directory for services
mkdir -p [ecommerce-app]/lib/whatsapp

# Copy WhatsApp services
cp -r lib/whatsapp/* [ecommerce-app]/lib/whatsapp/
```

### 2. **Install Dependencies**
```bash
cd [ecommerce-app]
npm install axios crypto
```

### 3. **Configure Environment**
```bash
# Add to your .env.local file
echo "WHATSAPP_ACCESS_TOKEN=your_key" >> .env.local
echo "WHATSAPP_PHONE_NUMBER_ID=your_id" >> .env.local
echo "WHATSAPP_VERIFY_TOKEN=your_token" >> .env.local
echo "WHATSAPP_BUSINESS_ACCOUNT_ID=your_account" >> .env.local
```

### 4. **Update Next.js Config**
```typescript
// next.config.ts
const nextConfig = {
  env: {
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
    WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
  },
};

export default nextConfig;
```

## 🔧 **E-commerce Integration Examples**

### **Order Confirmation Service**
```typescript
// services/order-notification.service.ts
import { sendWhatsAppMessage } from '@/lib/whatsapp/whatsapp.service';

export class OrderNotificationService {
  static async sendOrderConfirmation(
    phoneNumber: string, 
    order: Order
  ) {
    const message = `🎉 Order Confirmed!
    
Order #${order.id}
Total: $${order.total}
Items: ${order.items.length}
Estimated Delivery: ${order.estimatedDelivery}

Track your order: ${order.trackingUrl}`;

    return await sendWhatsAppMessage(phoneNumber, message);
  }

  static async sendDeliveryUpdate(
    phoneNumber: string, 
    order: Order, 
    status: string
  ) {
    const message = `📦 Delivery Update
    
Order #${order.id}
Status: ${status}
${status === 'Delivered' ? 'Your order has been delivered!' : 'On the way to you!'}`;

    return await sendWhatsAppMessage(phoneNumber, message);
  }
}
```

### **Customer Service Integration**
```typescript
// services/customer-service.service.ts
import { sendTemplateMessage } from '@/lib/whatsapp/whatsapp.service';

export class CustomerServiceService {
  static async sendWelcomeMessage(phoneNumber: string, customerName: string) {
    const template = {
      name: 'welcome_message',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customerName }
          ]
        }
      ]
    };

    return await sendTemplateMessage(phoneNumber, template);
  }

  static async sendAbandonedCartReminder(
    phoneNumber: string, 
    cartItems: CartItem[]
  ) {
    const message = `🛒 Don't forget your cart!
    
You have ${cartItems.length} items waiting:
${cartItems.map(item => `• ${item.name} - $${item.price}`).join('\n')}

Complete your order: ${process.env.NEXT_PUBLIC_APP_URL}/cart`;

    return await sendWhatsAppMessage(phoneNumber, message);
  }
}
```

## 🎨 **Template Management**

### **Pre-approved Templates**
```typescript
// lib/whatsapp/templates.ts
export const WHATSAPP_TEMPLATES = {
  ORDER_CONFIRMATION: {
    name: 'order_confirmation',
    language: { code: 'en' },
    components: [
      {
        type: 'header',
        parameters: [{ type: 'text', text: 'order_number' }]
      },
      {
        type: 'body',
        parameters: [
          { type: 'text', text: 'customer_name' },
          { type: 'text', text: 'order_total' },
          { type: 'text', text: 'delivery_date' }
        ]
      },
      {
        type: 'button',
        sub_type: 'url',
        index: 0,
        parameters: [{ type: 'text', text: 'tracking_url' }]
      }
    ]
  },
  
  DELIVERY_UPDATE: {
    name: 'delivery_update',
    language: { code: 'en' },
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: 'order_number' },
          { type: 'text', text: 'delivery_status' },
          { type: 'text', text: 'estimated_time' }
        ]
      }
    ]
  }
};
```

## 🚀 **Performance Optimization**

### **Message Queue System**
```typescript
// lib/whatsapp/queue.service.ts
import { Queue } from 'bull';

export class WhatsAppQueueService {
  private queue: Queue;

  constructor() {
    this.queue = new Queue('whatsapp-messages', {
      redis: process.env.REDIS_URL
    });
  }

  async addMessageToQueue(
    phoneNumber: string, 
    message: string, 
    priority: 'high' | 'normal' | 'low' = 'normal'
  ) {
    return await this.queue.add(
      'send-message',
      { phoneNumber, message },
      { 
        priority: priority === 'high' ? 1 : priority === 'normal' ? 2 : 3,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    );
  }

  async processQueue() {
    this.queue.process('send-message', async (job) => {
      const { phoneNumber, message } = job.data;
      return await sendWhatsAppMessage(phoneNumber, message);
    });
  }
}
```

### **Caching Strategy**
```typescript
// lib/whatsapp/cache.service.ts
import { Redis } from 'ioredis';

export class WhatsAppCacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async cacheMessageStatus(messageId: string, status: string) {
    await this.redis.setex(`whatsapp:${messageId}`, 86400, status); // 24 hours
  }

  async getMessageStatus(messageId: string): Promise<string | null> {
    return await this.redis.get(`whatsapp:${messageId}`);
  }

  async cachePhoneNumberInfo(phoneNumber: string, info: any) {
    await this.redis.setex(`phone:${phoneNumber}`, 3600, JSON.stringify(info)); // 1 hour
  }
}
```

## 🔒 **Security Implementation**

### **Rate Limiting Middleware**
```typescript
// middleware/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function rateLimitMiddleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const key = `rate_limit:${ip}`;
  
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, 60); // 1 minute window
  }
  
  if (current > 10) { // 10 requests per minute
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  return NextResponse.next();
}
```

### **Webhook Security**
```typescript
// lib/whatsapp/security.ts
import crypto from 'crypto';

export class WhatsAppSecurityService {
  static verifyWebhookSignature(
    body: string, 
    signature: string, 
    verifyToken: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', verifyToken)
      .update(body)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  static validatePhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }
}
```

## 📱 **Mobile Optimization**

### **Responsive Webhook Interface**
```typescript
// components/WhatsAppWebhookMonitor.tsx
'use client';

import { useState, useEffect } from 'react';

export default function WhatsAppWebhookMonitor() {
  const [webhooks, setWebhooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/whatsapp/webhooks');
      const data = await response.json();
      setWebhooks(data.webhooks);
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">WhatsApp Webhook Monitor</h2>
      <div className="space-y-2">
        {webhooks.map((webhook, index) => (
          <div key={index} className="p-3 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">
              {new Date(webhook.timestamp).toLocaleString()}
            </p>
            <p className="font-medium">{webhook.type}</p>
            <p className="text-sm">{webhook.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🧪 **Post-Integration Testing**

### **Verify Functionality**
- [ ] All API endpoints accessible
- [ ] Webhook receives messages
- [ ] Message sending works
- [ ] Rate limiting enforced
- [ ] Error handling works
- [ ] Security measures active

### **Test E-commerce Scenarios**
- [ ] Order confirmation messages
- [ ] Delivery update notifications
- [ ] Customer service responses
- [ ] Abandoned cart reminders
- [ ] Welcome messages

## 🆘 **Troubleshooting**

### **Common Issues**
1. **Webhook not receiving**: Check URL accessibility and HTTPS
2. **Messages not sending**: Verify API key and phone number ID
3. **Rate limiting errors**: Implement proper queue system
4. **Template errors**: Ensure templates are pre-approved

### **Debug Commands**
```typescript
// Add to your API routes for debugging
console.log('WhatsApp API Request:', {
  phoneNumber,
  message,
  timestamp: new Date().toISOString()
});

console.log('Webhook received:', {
  body: request.body,
  headers: request.headers,
  timestamp: new Date().toISOString()
});
```

## ✅ **Integration Complete**

Once all steps are completed:
- [ ] WhatsApp API fully integrated
- [ ] All endpoints functional
- [ ] Webhook handling working
- [ ] Security measures active
- [ ] Performance optimized
- [ ] E-commerce use cases implemented
- [ ] Testing completed
- [ ] Documentation updated

---
*Ready for Production Deployment* | *Last Updated: August 30, 2025*
