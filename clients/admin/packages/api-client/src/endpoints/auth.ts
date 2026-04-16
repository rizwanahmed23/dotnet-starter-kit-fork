import type { AxiosInstance } from "axios";
import type { TokenRequest, TokenResponse, RefreshTokenRequest } from "../types/auth";

export function createAuthEndpoints(client: AxiosInstance) {
  return {
    getToken: (data: TokenRequest) =>
      client.post<TokenResponse>("/api/v1/identity/token/issue", data),

    refreshToken: (data: RefreshTokenRequest) =>
      client.post<TokenResponse>("/api/v1/identity/token/refresh", data),
  };
}
