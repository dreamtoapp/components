export const logError = (error: any, context: string) => {
  console.error(`❌ ${context}:`, error);

  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
  }

  return {
    success: false,
    error: error.message || 'Unknown error',
    details: error.response?.data || 'No response details'
  };
};

export const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};



