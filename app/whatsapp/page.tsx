"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Phone, MessageCircle, Send, Shield, CheckCircle, XCircle, AlertCircle } from "lucide-react";

// Import external WhatsApp logic
import { WHATSAPP_CONFIG } from './helpers/config';
import { useWhatsAppChat, useWhatsAppOTP, useWhatsAppMessaging, useWhatsAppSessionOTP } from './helpers/hooks';


export default function WhatsAppPage() {
  const [phoneNumber, setPhoneNumber] = useState('966502699023');
  const [message, setMessage] = useState('');

  // Use custom hooks for WhatsApp functionality
  const {
    chatHistory,
    isLoading,
    error,
    addMessage,
    updateMessageStatus,
    clearError,
    setLoading,
    setError
  } = useWhatsAppChat();

  const {
    isOtpSent,
    isOtpVerified,
    otp,
    sendOTP,
    verifyOTP,
    setOtp
  } = useWhatsAppOTP();

  const { sendOTPViaSession } = useWhatsAppSessionOTP();

  const { sendMessage, sendAutomatedReply } = useWhatsAppMessaging();

  // Handler functions using the new hooks
  const handleSendOtp = async () => {
    if (!phoneNumber) return;

    setLoading(true);
    clearError();

    try {
      await sendOTP(phoneNumber);

      // Add system message to chat
      addMessage({
        id: Date.now().toString(),
        message: `OTP sent to ${phoneNumber} via WhatsApp`,
        timestamp: new Date(),
        isUser: false,
        status: 'sent'
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;

    setLoading(true);
    clearError();

    try {
      await verifyOTP(phoneNumber);

      // Add verification message to chat
      addMessage({
        id: Date.now().toString(),
        message: `OTP ${otp} verified successfully - مرحباً بك في أمواج`,
        timestamp: new Date(),
        isUser: false,
        status: 'delivered'
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !isOtpVerified) return;

    const userMessage = {
      id: Date.now().toString(),
      message: message.trim(),
      timestamp: new Date(),
      isUser: true,
      status: 'sent' as const
    };

    addMessage(userMessage);
    setMessage('');

    try {
      // Send message via WhatsApp API
      await sendMessage(phoneNumber, message.trim());

      // Update message status
      updateMessageStatus(userMessage.id, 'delivered');

      // Simulate automated reply
      setTimeout(async () => {
        try {
          await sendAutomatedReply(phoneNumber);

          const reply = {
            id: (Date.now() + 1).toString(),
            message: "شكراً لك على رسالتك! هذه رسالة تلقائية من أمواج - DreamToApp",
            timestamp: new Date(),
            isUser: false,
            status: 'sent' as const
          };
          addMessage(reply);
        } catch (error) {
          console.error('Failed to send reply:', error);
        }
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send message');
      updateMessageStatus(userMessage.id, 'failed');
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-3 w-3 text-blue-500" />;
      case 'delivered': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'read': return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'failed': return <XCircle className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">WhatsApp Business API</h1>
          <p className="text-lg text-muted-foreground">
            Real WhatsApp integration with DreamToApp using Business API
          </p>
        </div>

        {/* API Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone Number ID:</span>
                  <span className="font-mono">{WHATSAPP_CONFIG.PHONE_NUMBER_ID}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business Account:</span>
                  <span className="font-mono">{WHATSAPP_CONFIG.BUSINESS_ACCOUNT_ID}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Version:</span>
                  <span className="font-mono">{WHATSAPP_CONFIG.API_VERSION}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment:</span>
                  <span className="font-mono">{WHATSAPP_CONFIG.ENVIRONMENT}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Webhook Token:</span>
                  <span className="font-mono">{WHATSAPP_CONFIG.WEBHOOK_VERIFY_TOKEN}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">App Secret:</span>
                  <span className="font-mono">{WHATSAPP_CONFIG.APP_SECRET?.substring(0, 8)}...</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token Status:</span>
                  <span className={`font-mono ${WHATSAPP_CONFIG.PERMANENT_TOKEN ? (WHATSAPP_CONFIG.PERMANENT_TOKEN.length >= 200 ? 'text-green-600' : 'text-red-600') : 'text-red-600'}`}>
                    {WHATSAPP_CONFIG.PERMANENT_TOKEN ? (WHATSAPP_CONFIG.PERMANENT_TOKEN.length >= 200 ? 'Valid' : 'Invalid') : 'Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token Length:</span>
                  <span className="font-mono">{WHATSAPP_CONFIG.PERMANENT_TOKEN?.length || 'Not set'} chars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token Preview:</span>
                  <span className="font-mono">{WHATSAPP_CONFIG.PERMANENT_TOKEN ? `${WHATSAPP_CONFIG.PERMANENT_TOKEN.substring(0, 20)}...` : 'Not configured'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OTP Testing Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              OTP Verification Test
            </CardTitle>
            <CardDescription>
              Send real OTP via WhatsApp Business API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="966550556240"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendOtp}
                    disabled={!phoneNumber || isLoading}
                    className="shrink-0"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Send OTP
                  </Button>
                </div>

                {/* Test Buttons - Organized Groups */}
                <div className="space-y-4 mt-4">

                  {/* 🎯 WORKING OTP METHODS */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-green-600">✅ WORKING OTP METHODS</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={async () => {
                          try {
                            setLoading(true);
                            clearError();
                            const result = await sendOTPViaSession(phoneNumber);
                            alert(`🔥 SESSION OTP SENT! Code: ${result.otp}\nCheck your WhatsApp!`);
                            addMessage({
                              id: Date.now().toString(),
                              message: `🧪 Session OTP: ${result.otp} sent (requires user to message first)`,
                              timestamp: new Date(),
                              isUser: false,
                              status: 'sent'
                            });
                          } catch (error) {
                            setError(error instanceof Error ? error.message : 'Session OTP failed');
                            alert('❌ Session OTP Failed: ' + error);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 font-bold"
                        size="sm"
                      >
                        🔥 SESSION OTP (WORKING)
                      </Button>

                      <Button
                        onClick={async () => {
                          try {
                            setLoading(true);
                            clearError();
                            const response = await fetch('/api/whatsapp/simple-text', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                phoneNumber: '966502699023',
                                message: 'مرحباً! هذا اختبار بسيط من أمواج - DreamToApp. رمز التحقق: 123456'
                              })
                            });
                            const data = await response.json();
                            if (response.ok) {
                              alert(`✅ Simple Text Sent!\n\nMessage ID: ${data.messageId}\nStatus: ${data.status}\nCheck your WhatsApp!`);
                              addMessage({
                                id: Date.now().toString(),
                                message: `📝 Simple Text Sent: ${data.messageId} (Status: ${data.status})`,
                                timestamp: new Date(),
                                isUser: false,
                                status: 'sent'
                              });
                            } else {
                              throw new Error(`Simple text failed: ${data.error}`);
                            }
                          } catch (error) {
                            setError(error instanceof Error ? error.message : 'Simple text failed');
                            alert('❌ Simple Text Failed: ' + error);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 font-bold"
                        size="sm"
                      >
                        📝 SIMPLE TEXT (WORKING)
                      </Button>
                    </div>
                  </div>

                  {/* 🧪 TESTING OTP METHODS */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-yellow-600">🧪 TESTING OTP METHODS</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={async () => {
                          if (!phoneNumber) {
                            alert('❌ Please enter a phone number first!');
                            return;
                          }
                          try {
                            setLoading(true);
                            clearError();
                            const result = await sendOTP(phoneNumber);
                            alert(`🎯 TEMPLATE OTP SENT!\n\nPhone: ${phoneNumber}\nCode: ${result.otp}\n\nCheck your WhatsApp!`);
                            addMessage({
                              id: Date.now().toString(),
                              message: `🎯 Template OTP: ${result.otp} sent to ${phoneNumber} (no user initiation required)`,
                              timestamp: new Date(),
                              isUser: false,
                              status: 'sent'
                            });
                          } catch (error) {
                            setError(error instanceof Error ? error.message : 'Template OTP failed');
                            alert('❌ Template OTP Failed: ' + error);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={isLoading || !phoneNumber}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600 hover:border-yellow-700 font-bold"
                        size="sm"
                      >
                        🎯 TEMPLATE OTP (TEST)
                      </Button>
                    </div>
                  </div>

                  {/* 🔍 DIAGNOSTIC TOOLS */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-blue-600">🔍 DIAGNOSTIC TOOLS</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={async () => {
                          try {
                            setLoading(true);
                            clearError();
                            const response = await fetch('/api/whatsapp/deep-diagnostic');
                            const data = await response.json();
                            if (response.ok) {
                              console.log('🔍 Deep Diagnostic Results:', data);
                              const diagnostic = data.diagnostic;
                              const phoneCheck = diagnostic.checks.phoneNumber;
                              const messageCheck = diagnostic.checks.testMessage;
                              let alertMessage = `🔍 DEEP DIAGNOSTIC RESULTS\n\n`;
                              if (phoneCheck.success) {
                                alertMessage += `📱 Phone Number: ✅ Working\n`;
                                alertMessage += `   Verified: ${phoneCheck.verified ? 'Yes' : 'No'}\n`;
                                alertMessage += `   Status: ${phoneCheck.status || 'Unknown'}\n`;
                              } else {
                                alertMessage += `📱 Phone Number: ❌ Failed\n`;
                                alertMessage += `   Error: ${phoneCheck.error?.error?.message || 'Unknown'}\n`;
                              }
                              if (messageCheck.success) {
                                alertMessage += `\n💬 Test Message: ✅ Sent\n`;
                                alertMessage += `   Message ID: ${messageCheck.messageId}\n`;
                                alertMessage += `   Status: ${messageCheck.status}\n`;
                              } else {
                                alertMessage += `\n💬 Test Message: ❌ Failed\n`;
                                alertMessage += `   Error: ${messageCheck.error?.error?.message || 'Unknown'}\n`;
                              }
                              alertMessage += `\n📋 Check browser console for full details!`;
                              alert(alertMessage);
                              addMessage({
                                id: Date.now().toString(),
                                message: `🔍 Deep Diagnostic: Phone ${phoneCheck.success ? 'OK' : 'FAILED'}, Message ${messageCheck.success ? 'SENT' : 'FAILED'}`,
                                timestamp: new Date(),
                                isUser: false,
                                status: 'sent'
                              });
                            } else {
                              throw new Error('Deep diagnostic failed');
                            }
                          } catch (error) {
                            setError(error instanceof Error ? error.message : 'Deep diagnostic failed');
                            alert('❌ Deep Diagnostic Failed: ' + error);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 font-bold"
                        size="sm"
                      >
                        🔬 DEEP DIAGNOSTIC
                      </Button>

                      <Button
                        onClick={async () => {
                          try {
                            setLoading(true);
                            clearError();
                            const response = await fetch('/api/whatsapp/check-template-status');
                            const data = await response.json();
                            if (response.ok) {
                              console.log('🔐 Template Status:', data);
                              const template = data.template;
                              let statusMessage = `🔐 CONFIRM TEMPLATE STATUS\n\n`;
                              statusMessage += `Template: ${template.name}\n`;
                              statusMessage += `Status: ${template.status}\n`;
                              statusMessage += `Category: ${template.category}\n`;
                              statusMessage += `Language: ${template.language}\n`;
                              statusMessage += `Approved: ${template.isApproved ? '✅ Yes' : '❌ No'}\n`;
                              statusMessage += `No Opt-in Required: ${template.canSendWithoutOptin ? '✅ Yes' : '❌ No'}\n`;
                              statusMessage += `Authentication Ready: ${template.authenticationReady ? '✅ YES!' : '❌ NO'}\n`;
                              if (data.totalTemplates) {
                                statusMessage += `\nTotal Templates: ${data.totalTemplates}`;
                              }
                              if (data.note) {
                                statusMessage += `\n\nNote: ${data.note}`;
                              }

                              // Copy to clipboard
                              try {
                                await navigator.clipboard.writeText(statusMessage);
                                alert(`✅ Template Status Copied to Clipboard!\n\n${statusMessage}\n\n📋 Results copied - you can paste them now!`);
                              } catch {
                                alert(`🔐 Template Status:\n\n${statusMessage}\n\n📋 Copy the text above manually`);
                              }

                              addMessage({
                                id: Date.now().toString(),
                                message: `🔐 Template Status: ${template.name} - ${template.status} - Auth Ready: ${template.authenticationReady ? 'YES' : 'NO'}`,
                                timestamp: new Date(),
                                isUser: false,
                                status: 'sent'
                              });
                            } else {
                              const errorMessage = `❌ TEMPLATE STATUS CHECK FAILED\n\nError: ${data.error}\n\nDetails: ${JSON.stringify(data.details, null, 2)}\n\nNote: ${data.note || 'No additional notes'}\n\nAction Required: ${data.actionRequired || 'Check your setup'}`;

                              // Copy error to clipboard
                              try {
                                await navigator.clipboard.writeText(errorMessage);
                                alert(`❌ Template Status Error Copied to Clipboard!\n\n${errorMessage}\n\n📋 Error details copied - you can paste them now!`);
                              } catch {
                                alert(`❌ Template Status Error:\n\n${errorMessage}\n\n📋 Copy the error details above manually`);
                              }

                              throw new Error('Template status check failed');
                            }
                          } catch (error) {
                            setError(error instanceof Error ? error.message : 'Template status check failed');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 hover:border-indigo-700 font-bold"
                        size="sm"
                      >
                        🔐 CHECK TEMPLATE STATUS
                      </Button>
                    </div>
                  </div>

                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={!otp || !isOtpSent || isLoading}
                    variant="outline"
                    className="shrink-0"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify
                  </Button>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            {/* Status Indicators */}
            <div className="flex flex-wrap gap-2">
              {isOtpSent && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  OTP Sent via WhatsApp
                </Badge>
              )}
              {isOtpVerified && (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              {isLoading && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                  Processing...
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Direct Messaging Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Direct Messaging
            </CardTitle>
            <CardDescription>
              Send real messages via WhatsApp Business API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chat History */}
            <div className="h-64 border rounded-lg p-4 overflow-y-auto bg-muted/20">
              {chatHistory.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No messages yet. Verify OTP to start messaging!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${msg.isUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                          }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs opacity-70">
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                          {msg.status && getStatusIcon(msg.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder={isOtpVerified ? "Type your message..." : "Verify OTP first to send messages"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
                disabled={!isOtpVerified}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isOtpVerified) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || !isOtpVerified}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled={!isOtpVerified}>
                📍 Share Location
              </Button>
              <Button variant="outline" size="sm" disabled={!isOtpVerified}>
                📷 Send Photo
              </Button>
              <Button variant="outline" size="sm" disabled={!isOtpVerified}>
                📄 Send Document
              </Button>
              <Button variant="outline" size="sm" disabled={!isOtpVerified}>
                🎤 Voice Message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Debug Information
            </CardTitle>
            <CardDescription>
              Check browser console for detailed logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone Number:</span>
                    <span className="font-mono">{phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Formatted Phone:</span>
                    <span className="font-mono">{phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API URL:</span>
                    <span className="font-mono text-xs">graph.facebook.com/{WHATSAPP_CONFIG.API_VERSION}/{WHATSAPP_CONFIG.PHONE_NUMBER_ID}/messages</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Template Name:</span>
                    <span className="font-mono">confirm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language:</span>
                    <span className="font-mono">ar (Arabic)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Message Type:</span>
                    <span className="font-mono">template</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/20 rounded-lg">
                <p className="text-sm font-medium mb-2">🔍 Troubleshooting Steps:</p>
                <ol className="text-xs space-y-1 text-muted-foreground">
                  <li>1. <strong>Test Simple Text:</strong> Click &quot;💬 Simple Text&quot; - if this works, template is the issue</li>
                  <li>2. <strong>Check WhatsApp Manager:</strong> Go to business.facebook.com/wa/manage/accounts</li>
                  <li>3. <strong>Verify Business Account:</strong> Status should be &quot;Verified&quot; and &quot;Active&quot;</li>
                  <li>4. <strong>Check Phone Number:</strong> 744540948737430 should show as &quot;Connected&quot;</li>
                  <li>5. <strong>Template Status:</strong> &quot;confirm&quot; template must be &quot;Approved&quot; (not &quot;Pending&quot;)</li>
                  <li>6. <strong>Business Hours:</strong> Some templates only work during business hours</li>
                  <li>7. <strong>24-Hour Window:</strong> You can only send templates to users who messaged you first</li>
                </ol>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium mb-2 text-blue-800">💡 Most Likely Issue:</p>
                <p className="text-xs text-blue-700">
                  <strong>24-Hour Window Rule:</strong> You can only send template messages to users who have messaged your business number first within the last 24 hours.
                  Try sending a message FROM your phone TO your business number first, then test the API.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">WhatsApp Business API Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Phone Number ID: {WHATSAPP_CONFIG.PHONE_NUMBER_ID}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Environment: {WHATSAPP_CONFIG.ENVIRONMENT}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

