

export interface AnalyticsConfig {
  name:string,
  email:string,
  apiUrl: string;       // Backend endpoint e.g. "http://localhost:3000/api/events"
  apiKey: string;       // Mock API key for now
  userId: string;      // Optional: can be added by client
  debug?: boolean;      // If true → console logs network activity
  flushInterval?: number; // in ms, default 3000
  maxBatchSize?: number;  // number of events before auto flush
}

export interface EventPayload {
  event: string;
  metadata?:  Record<string, any>;
  timestamp: number;
}

export interface SendResponse {
  success: boolean;
  status?: number;
  message?: string;
}