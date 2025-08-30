# 🆘 E-commerce Integration - Troubleshooting Guide

## 📋 **Overview**
This guide helps resolve common issues that may arise during the integration of Google Maps and WhatsApp Cloud API into your e-commerce application.

## 🗺️ **Google Maps Issues**

### **Map Not Loading**

#### **Issue: Blank map area**
```typescript
// Check console for errors
console.log('API Key:', process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY);
console.log('Map ref:', mapRef.current);
```

**Solutions:**
1. **API Key Issues**
   ```bash
   # Verify environment variable
   echo $NEXT_PUBLIC_GOOGLE_MAP_API_KEY
   
   # Check .env.local file
   cat .env.local | grep GOOGLE_MAP
   ```

2. **Billing Issues**
   - Verify Google Cloud billing is enabled
   - Check Maps JavaScript API quota
   - Ensure API key has correct permissions

3. **Domain Restrictions**
   - Verify API key is not restricted to specific domains
   - Check if localhost is allowed for development

#### **Issue: Map loads but no controls**
```typescript
// Ensure map options are correct
const mapOptions = {
  center,
  zoom,
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  mapTypeControl: true,      // Enable map type control
  streetViewControl: true,    // Enable street view
  fullscreenControl: true,    // Enable fullscreen
  zoomControl: true,          // Enable zoom control
};
```

### **Geolocation Issues**

#### **Issue: Location permission denied**
```typescript
// Better error handling
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    setError("Geolocation not supported by this browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      handleLocationUpdate(position);
    },
    (error) => {
      switch(error.code) {
        case error.PERMISSION_DENIED:
          setError("Location access denied. Please enable in browser settings.");
          break;
        case error.POSITION_UNAVAILABLE:
          setError("Location information unavailable.");
          break;
        case error.TIMEOUT:
          setError("Location request timed out.");
          break;
        default:
          setError("An unknown error occurred.");
          break;
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
};
```

#### **Issue: Location inaccurate**
```typescript
// Improve accuracy settings
const options = {
  enableHighAccuracy: true,    // Use GPS when available
  timeout: 15000,              // Increase timeout
  maximumAge: 30000            // Accept cached position up to 30 seconds
};

// Fallback to lower accuracy if high accuracy fails
navigator.geolocation.getCurrentPosition(
  successCallback,
  errorCallback,
  { enableHighAccuracy: true, timeout: 10000 }
);

// If high accuracy fails, try with lower accuracy
setTimeout(() => {
  navigator.geolocation.getCurrentPosition(
    successCallback,
    errorCallback,
    { enableHighAccuracy: false, timeout: 15000 }
  );
}, 1000);
```

### **Performance Issues**

#### **Issue: Map loads slowly**
```typescript
// Implement lazy loading
import dynamic from 'next/dynamic';

const GoogleMap = dynamic(() => import('@/components/GoogleMap'), {
  loading: () => (
    <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
      <div className="text-gray-600">Loading map...</div>
    </div>
  ),
  ssr: false // Important: Google Maps doesn't work with SSR
});
```

#### **Issue: Memory leaks**
```typescript
// Proper cleanup in useEffect
useEffect(() => {
  let isMounted = true;
  let mapInstance: google.maps.Map | null = null;

  const initMap = async () => {
    // ... map initialization
    if (isMounted) {
      mapInstance = new google.maps.Map(/* ... */);
      setMap(mapInstance);
    }
  };

  initMap();

  return () => {
    isMounted = false;
    if (mapInstance) {
      // Clean up map instance
      google.maps.event.clearInstanceListeners(mapInstance);
    }
  };
}, []);
```

## 📱 **WhatsApp API Issues**

### **Message Sending Failures**

#### **Issue: "Invalid phone number" error**
```typescript
// Phone number validation
const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Must start with + and have 10-15 digits
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  
  return phoneRegex.test(cleaned);
};

// Usage
if (!validatePhoneNumber(phoneNumber)) {
  throw new Error('Invalid phone number format. Must be international format (e.g., +1234567890)');
}
```

#### **Issue: "Template not found" error**
```typescript
// Template validation
const validateTemplate = (template: TemplateMessage): boolean => {
  const requiredFields = ['name', 'language'];
  const hasRequiredFields = requiredFields.every(field => 
    template.hasOwnProperty(field)
  );
  
  if (!hasRequiredFields) {
    return false;
  }
  
  // Check if template name exists in approved templates
  const approvedTemplates = ['welcome_message', 'order_confirmation', 'delivery_update'];
  return approvedTemplates.includes(template.name);
};
```

### **Webhook Issues**

#### **Issue: Webhook not receiving messages**
```typescript
// Webhook verification
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return new Response(challenge, { status: 200 });
  }

  console.log('Webhook verification failed');
  return new Response('Forbidden', { status: 403 });
}
```

#### **Issue: Webhook signature verification fails**
```typescript
// Improved signature verification
import crypto from 'crypto';

const verifyWebhookSignature = (body: string, signature: string): boolean => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WHATSAPP_VERIFY_TOKEN || '')
      .update(body)
      .digest('hex');
    
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

// Usage in webhook handler
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256') || '';
  
  if (!verifyWebhookSignature(body, signature)) {
    console.error('Invalid webhook signature');
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Process webhook
  const data = JSON.parse(body);
  // ... handle webhook data
}
```

### **Rate Limiting Issues**

#### **Issue: "Rate limit exceeded" errors**
```typescript
// Implement exponential backoff
class RateLimitHandler {
  private static delays = [1000, 2000, 4000, 8000]; // Exponential backoff delays
  
  static async handleRateLimit<T>(
    operation: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (error.status === 429 && attempt < this.delays.length) {
        const delay = this.delays[attempt];
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.handleRateLimit(operation, attempt + 1);
      }
      throw error;
    }
  }
}

// Usage
const sendMessage = async (phoneNumber: string, message: string) => {
  return RateLimitHandler.handleRateLimit(async () => {
    return await sendWhatsAppMessage(phoneNumber, message);
  });
};
```

## 🔒 **Security Issues**

### **API Key Exposure**

#### **Issue: API keys visible in client code**
```typescript
// ❌ Wrong: Exposing API key in client component
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;

// ✅ Correct: Use server-side API calls for sensitive operations
// Create API route for WhatsApp operations
// app/api/whatsapp/send/route.ts
export async function POST(request: Request) {
  // API key is only accessible server-side
  const apiKey = process.env.WHATSAPP_ACCESS_TOKEN;
  // ... rest of implementation
}
```

#### **Issue: Environment variables not loading**
```bash
# Check if variables are loaded
echo $NEXT_PUBLIC_GOOGLE_MAP_API_KEY
echo $WHATSAPP_ACCESS_TOKEN

# Verify .env.local file exists and has correct format
cat .env.local

# Restart development server after changing .env.local
npm run dev
```

### **CORS Issues**

#### **Issue: CORS errors in development**
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/whatsapp/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};
```

## 📱 **Mobile-Specific Issues**

### **Touch Interaction Problems**

#### **Issue: Map controls not touch-friendly**
```typescript
// Ensure touch targets are large enough
const mapOptions = {
  // ... other options
  zoomControlOptions: {
    position: google.maps.ControlPosition.RIGHT_TOP,
    style: google.maps.ZoomControlStyle.LARGE // Large touch targets
  },
  mapTypeControlOptions: {
    style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
    position: google.maps.ControlPosition.TOP_LEFT
  }
};
```

#### **Issue: Geolocation not working on mobile**
```typescript
// Mobile-specific geolocation handling
const getMobileLocation = () => {
  // Check if device is mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Use more aggressive timeout for mobile
    const options = {
      enableHighAccuracy: true,
      timeout: 20000,        // 20 seconds for mobile
      maximumAge: 300000     // 5 minutes cache for mobile
    };
    
    navigator.geolocation.getCurrentPosition(
      handleLocationUpdate,
      handleLocationError,
      options
    );
  } else {
    // Desktop options
    getCurrentLocation();
  }
};
```

## 🧪 **Testing Issues**

### **Development vs Production**

#### **Issue: Works in development but not production**
```typescript
// Environment-specific configuration
const config = {
  development: {
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY_DEV,
    whatsappToken: process.env.WHATSAPP_ACCESS_TOKEN_DEV,
    baseUrl: 'http://localhost:3000'
  },
  production: {
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
    whatsappToken: process.env.WHATSAPP_ACCESS_TOKEN,
    baseUrl: process.env.NEXT_PUBLIC_APP_URL
  }
};

const currentConfig = config[process.env.NODE_ENV] || config.development;
```

### **API Testing**

#### **Issue: Can't test WhatsApp webhooks locally**
```typescript
// Use ngrok for local webhook testing
// 1. Install ngrok: npm install -g ngrok
// 2. Start your app: npm run dev
// 3. In another terminal: ngrok http 3000
// 4. Use the ngrok URL as your webhook URL in WhatsApp

// Test webhook locally
const testWebhook = async () => {
  const response = await fetch('http://localhost:3000/api/whatsapp/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Test webhook payload
    })
  });
  
  console.log('Webhook test response:', response.status);
};
```

## 📊 **Performance Issues**

### **Memory Leaks**

#### **Issue: App becomes slow over time**
```typescript
// Monitor memory usage
const monitorMemory = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('Memory usage:', {
      used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
    });
  }
};

// Call periodically
setInterval(monitorMemory, 30000); // Every 30 seconds
```

### **Network Issues**

#### **Issue: Slow API responses**
```typescript
// Implement request timeout
const sendWhatsAppMessageWithTimeout = async (
  phoneNumber: string, 
  message: string, 
  timeout: number = 10000
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, message }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};
```

## 🆘 **Emergency Recovery**

### **Quick Fixes**

#### **Issue: App completely broken after integration**
```bash
# 1. Stop the application
pkill -f "next"

# 2. Remove integrated components
rm -rf components/GoogleMap.tsx
rm -rf app/api/whatsapp
rm -rf lib/whatsapp

# 3. Remove dependencies
npm uninstall @googlemaps/js-api-loader @types/google.maps axios crypto

# 4. Restart
npm run dev
```

#### **Issue: Environment variables corrupted**
```bash
# 1. Backup current .env.local
cp .env.local .env.local.backup

# 2. Create fresh .env.local
cat > .env.local << EOF
# Google Maps
NEXT_PUBLIC_GOOGLE_MAP_API_KEY=your_key_here

# WhatsApp
WHATSAPP_ACCESS_TOKEN=your_token_here
WHATSAPP_PHONE_NUMBER_ID=your_id_here
WHATSAPP_VERIFY_TOKEN=your_verify_token_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_account_id_here
EOF

# 3. Restart application
npm run dev
```

## 📞 **Getting Help**

### **Debug Information to Collect**
```typescript
// Add this to your components for debugging
const debugInfo = {
  environment: process.env.NODE_ENV,
  googleMapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY ? 'Set' : 'Not Set',
  whatsappToken: process.env.WHATSAPP_ACCESS_TOKEN ? 'Set' : 'Not Set',
  userAgent: navigator.userAgent,
  timestamp: new Date().toISOString()
};

console.log('Debug Info:', debugInfo);
```

### **Common Error Codes**
- **403 Forbidden**: API key issues or domain restrictions
- **429 Too Many Requests**: Rate limiting
- **500 Internal Server Error**: Server-side implementation issues
- **CORS errors**: Cross-origin request issues
- **Geolocation errors**: Permission or browser compatibility issues

---
*Last Updated: August 30, 2025* | *For additional help, check the integration guides*
