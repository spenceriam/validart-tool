import { api } from "encore.dev/api";

interface HealthResponse {
  status: string;
  timestamp: string;
}

// Health check endpoint for the service
export const health = api<void, HealthResponse>(
  { expose: true, method: "GET", path: "/health" },
  async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
);
