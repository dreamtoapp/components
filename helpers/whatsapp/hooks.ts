import { useState, useCallback } from 'react';
import { WhatsAppApiService } from '../../../../actions/whatsapp-api';
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
      logError('Failed to send OTP', error);
      throw error;
    }
  }, []);

  const verifyOTP = useCallback(async (phoneNumber: string) => {
    try {
      await WhatsAppApiService.sendVerificationMessage(phoneNumber);
      setIsOtpVerified(true);
      return { success: true };
    } catch (error) {
      logError('Failed to verify OTP', error);
      throw error;
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
      logError('Failed to send message', error);
      throw error;
    }
  }, []);

  const sendTestMessage = useCallback(async (phoneNumber: string) => {
    try {
      return await WhatsAppApiService.sendTestMessage(phoneNumber);
    } catch (error) {
      logError('Failed to send test message', error);
      throw error;
    }
  }, []);

  const sendSimpleTextMessage = useCallback(async (phoneNumber: string) => {
    try {
      return await WhatsAppApiService.sendSimpleTextMessage(phoneNumber);
    } catch (error) {
      logError('Failed to send simple text message', error);
      throw error;
    }
  }, []);

  const sendHelloWorldTemplate = useCallback(async (phoneNumber: string) => {
    try {
      return await WhatsAppApiService.sendHelloWorldTemplate(phoneNumber);
    } catch (error) {
      logError('Failed to send hello world template', error);
      throw error;
    }
  }, []);

  const sendAutomatedReply = useCallback(async (phoneNumber: string) => {
    try {
      return await WhatsAppApiService.sendAutomatedReply(phoneNumber);
    } catch (error) {
      logError('Failed to send automated reply', error);
      throw error;
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
