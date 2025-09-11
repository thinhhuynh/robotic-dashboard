// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  ENDPOINTS: {
    ROBOTS: '/robots',
    ROBOT_DETAIL: (id: string) => `/robots/${id}`,
  },
  // Timeout configuration
  TIMEOUT: 10000, // 10 seconds
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// API fetch wrapper with error handling
export const apiRequest = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = buildApiUrl(endpoint);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};