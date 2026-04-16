export interface TokenRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  accessTokenExpiresAt: string;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}
