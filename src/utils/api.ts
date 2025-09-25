/**
 * API utility functions for TransparencyBot frontend.
 * Handles all communication with the backend API.
 */

interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  data?: any;
  files?: any;
  requireAuth?: boolean;
  token?: string;
}

export const apiRequest = async ({
  method,
  endpoint,
  data,
  files,
  requireAuth = false,
  token
}: ApiRequestOptions): Promise<Response | null> => {
  const headers: HeadersInit = {};

  // Add authentication token if available and required
  if (requireAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    let response: Response;

    if (method === 'GET') {
      const params = data ? new URLSearchParams(data).toString() : '';
      const url = params ? `${endpoint}?${params}` : endpoint;
      response = await fetch(url, { method, headers });
    } else if (files) {
      // Handle file uploads
      const formData = new FormData();
      if (data) {
        Object.keys(data).forEach(key => {
          formData.append(key, data[key]);
        });
      }
      if (files) {
        Object.keys(files).forEach(key => {
          formData.append(key, files[key]);
        });
      }
      response = await fetch(endpoint, {
        method,
        headers,
        body: formData,
      });
    } else {
      // Handle JSON requests
      if (data) {
        headers['Content-Type'] = 'application/json';
      }
      response = await fetch(endpoint, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });
    }

    return response;
  } catch (error) {
    console.error('API request error:', error);
    return null;
  }
};

// Convenience functions
export const get = (endpoint: string, params?: any, token?: string) =>
  apiRequest({ method: 'GET', endpoint, data: params, token, requireAuth: false });

export const post = (endpoint: string, data?: any, token?: string) =>
  apiRequest({ method: 'POST', endpoint, data, token, requireAuth: false });

export const put = (endpoint: string, data?: any, token?: string) =>
  apiRequest({ method: 'PUT', endpoint, data, token });

export const del = (endpoint: string, token?: string) =>
  apiRequest({ method: 'DELETE', endpoint, token });

export const patch = (endpoint: string, data?: any, token?: string) =>
  apiRequest({ method: 'PATCH', endpoint, data, token });

// Supabase Edge Function helpers
export const callChatbot = async (message: string) => {
  return apiRequest({
    method: 'POST',
    endpoint: 'https://xavvqukrbpkcxsmdtrui.supabase.co/functions/v1/chatbot',
    data: { message },
    requireAuth: false
  });
};

export const submitReport = async (reportData: any) => {
  return apiRequest({
    method: 'POST',
    endpoint: 'https://xavvqukrbpkcxsmdtrui.supabase.co/functions/v1/submit-report',
    data: reportData,
    requireAuth: false
  });
};

export const detectAnomalies = async (token?: string) => {
  return apiRequest({
    method: 'POST',
    endpoint: 'https://xavvqukrbpkcxsmdtrui.supabase.co/functions/v1/detect-anomalies',
    requireAuth: true,
    token
  });
};