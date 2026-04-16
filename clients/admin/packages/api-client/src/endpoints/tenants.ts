import type { AxiosInstance } from "axios";
import type { PagedResponse, PaginationParams } from "../types/common";
import type { Tenant, CreateTenantRequest, UpdateTenantRequest } from "../types/tenant";

export function createTenantEndpoints(client: AxiosInstance) {
  return {
    list: (params?: PaginationParams) =>
      client.get<PagedResponse<Tenant>>("/api/v1/tenants", { params }),

    get: (id: string) =>
      client.get<Tenant>(`/api/v1/tenants/${id}`),

    create: (data: CreateTenantRequest) =>
      client.post<string>("/api/v1/tenants", data),

    update: (id: string, data: UpdateTenantRequest) =>
      client.put(`/api/v1/tenants/${id}`, data),

    activate: (id: string) =>
      client.post(`/api/v1/tenants/${id}/activate`),

    deactivate: (id: string) =>
      client.post(`/api/v1/tenants/${id}/deactivate`),
  };
}
