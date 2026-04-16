import type { AxiosInstance } from "axios";
import type { PagedResponse, PaginationParams } from "../types/common";
import type { User, CreateUserRequest, UpdateUserRequest } from "../types/user";
import type { UserRole } from "../types/role";

export function createUserEndpoints(client: AxiosInstance) {
  return {
    list: (params?: PaginationParams) =>
      client.get<PagedResponse<User>>("/api/v1/identity/users/search", { params }),

    get: (id: string) =>
      client.get<User>(`/api/v1/identity/users/${id}`),

    create: (data: CreateUserRequest) =>
      client.post<string>("/api/v1/identity/register", data),

    update: (id: string, data: UpdateUserRequest) =>
      client.put(`/api/v1/identity/users/${id}`, data),

    toggleStatus: (id: string) =>
      client.post(`/api/v1/identity/users/${id}/toggle-status`),

    getRoles: (id: string) =>
      client.get<UserRole[]>(`/api/v1/identity/users/${id}/roles`),

    assignRoles: (id: string, roles: { roleId: string; enabled: boolean }[]) =>
      client.post(`/api/v1/identity/users/${id}/roles`, roles),
  };
}
