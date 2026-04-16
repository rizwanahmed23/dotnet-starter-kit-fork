import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null>;
  getTenantId?: () => string | null;
}

export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use(async (req: InternalAxiosRequestConfig) => {
    if (config.getAccessToken) {
      const token = await config.getAccessToken();
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (config.getTenantId) {
      const tenantId = config.getTenantId();
      if (tenantId) {
        req.headers["tenant"] = tenantId;
      }
    }

    return req;
  });

  return client;
}
