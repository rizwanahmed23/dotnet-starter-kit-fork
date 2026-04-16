import type { NextAuthConfig } from "next-auth";
import type { NextRequest } from "next/server";
import Credentials from "next-auth/providers/credentials";
import { createApiClient, createAuthEndpoints } from "@fsh/api-client";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenantId: { label: "Tenant", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const apiClient = createApiClient({
            baseUrl: process.env.FSH_API_URL ?? "http://localhost:5030",
          });

          if (credentials.tenantId) {
            apiClient.defaults.headers.common["tenant"] =
              credentials.tenantId as string;
          }

          const authApi = createAuthEndpoints(apiClient);

          const response = await authApi.getToken({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          if (!response.data?.accessToken) return null;

          const token = response.data.accessToken;
          const payload = JSON.parse(atob(token.split(".")[1]));

          return {
            id: payload.uid ?? payload.sub,
            email: payload.email,
            firstName: payload.given_name ?? "",
            lastName: payload.family_name ?? "",
            tenantId:
              payload.tenant ?? (credentials.tenantId as string) ?? "",
            permissions: payload.permission ?? [],
            isSuperAdmin: payload.is_superadmin === "true",
            accessToken: token,
            refreshToken: response.data.refreshToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    authorized({
      auth,
      request,
    }: {
      auth: { user?: { email?: string | null } } | null;
      request: NextRequest;
    }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isOnLogin = pathname.startsWith("/login");

      if (isOnLogin) {
        // Redirect logged-in users away from login page
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", request.nextUrl));
        return true;
      }

      // Protect all other routes
      return isLoggedIn;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id!,
          email: user.email!,
          firstName: user.firstName,
          lastName: user.lastName,
          tenantId: user.tenantId,
          permissions: user.permissions,
          isSuperAdmin: user.isSuperAdmin,
        };
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as typeof session.user;
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
