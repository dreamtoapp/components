import { useState, useCallback } from 'react';
import { WhatsAppApiService } from '../../actions/whatsapp-api';
import { ChatMessage } from './types';
import { logError } from './utils';

export const useWhatsAppChat = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback((message: ChatMessage) => {
    setChatHistory(prev => [...prev, message]);
  }, []);

  const updateMessageStatus = useCallback((messageId: string, status: ChatMessage['status']) => {
    setChatHistory(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, status } : msg
    ));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    chatHistory,
    isLoading,
    error,
    addMessage,
    updateMessageStatus,
    clearError,
    setLoading,
    setError
  };
};

export const useWhatsAppOTP = () => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');

  const sendOTP = useCallback(async (phoneNumber: string) => {
    try {
      const { otp: generatedOtp, response } = await WhatsAppApiService.sendOTP(phoneNumber);
      setOtp(generatedOtp);
      setIsOtpSent(true);
      return { success: true, otp: generatedOtp, response };
    } catch (error) {
      console.error('❌ Failed to send OTP:', error);
      logError(error as any, 'Failed to send OTP');
      return { success: false, error: 'Failed to send OTP' };
    }
  }, []);

  const verifyOTP = useCallback(async (phoneNumber: string) => {
    try {
      await WhatsAppApiService.sendVerificationMessage(phoneNumber);
      setIsOtpVerified(true);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to verify OTP:', error);
      logError(error as any, 'Failed to verify OTP');
      return { success: false, error: 'Failed to verify OTP' };
    }
  }, []);

  const resetOTP = useCallback(() => {
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setOtp('');
  }, []);

  return {
    isOtpSent,
    isOtpVerified,
    otp,
    sendOTP,
    verifyOTP,
    resetOTP,
    setOtp
  };
};

export const useWhatsAppMessaging = () => {
  const sendMessage = useCallback(async (phoneNumber: string, message: string) => {
    try {
      return await WhatsAppApiService.sendTextMessage(phoneNumber, message);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      logError(error as any, 'Failed to send message');
      return { success: false, error: 'Failed to send message' };
    }
  }, []);

  const sendTestMessage = useCallback(async (phoneNumber: string) => {
    try {
      return await WhatsAppApiService.sendTestMessage(phoneNumber);
    } catch (error) {
      console.error('❌ Failed to send test message:', error);
      logError(error as any, 'Failed to send test message');
      return { success: false, error: 'Failed to send test message' };
    }
  }, []);

  const sendSimpleTextMessage = useCallback(async (phoneNumber: string) => {
    try {
      return await WhatsAppApiService.sendSimpleTextMessage(phoneNumber);
    } catch (error) {
      console.error('❌ Failed to send simple text message:', error);
      logError(error as any, 'Failed to send simple text message');
      return { success: false, error: 'Failed to send simple text message' };
    }
  }, []);

  const sendHelloWorldTemplate = useCallback(async (phoneNumber: string) => {
    try {
      return await WhatsAppApiService.sendHelloWorldTemplate(phoneNumber);
    } catch (error) {
      console.error('❌ Failed to send hello world template:', error);
      logError(error as any, 'Failed to send hello world template');
      return { success: false, error: 'Failed to send hello world template' };
    }
  }, []);

  const sendAutomatedReply = useCallback(async (phoneNumber: string) => {
    try {
      return await WhatsAppApiService.sendAutomatedReply(phoneNumber);
    } catch (error) {
      console.error('❌ Failed to send automated reply:', error);
      logError(error as any, 'Failed to send automated reply');
      return { success: false, error: 'Failed to send automated reply' };
    }
  }, []);

  return {
    sendMessage,
    sendTestMessage,
    sendSimpleTextMessage,
    sendHelloWorldTemplate,
    sendAutomatedReply
  };
};
