import api from './api';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  assigned: boolean;
}

export interface UserPermissionsResponse {
  user_id: string;
  permissions: Permission[];
}

export const permissionsService = {
  getUserPermissions: async (
    userId: string
  ): Promise<UserPermissionsResponse> => {
    const response = await api.get<UserPermissionsResponse>(
      `/user-permissions/${userId}`
    );

    return response.data;
  },

  updateUserPermissions: async (
    userId: string,
    permissionIds: string[]
  ): Promise<UserPermissionsResponse> => {
    const response = await api.put<UserPermissionsResponse>(
      `/user-permissions/${userId}`,
      {
        permission_ids: permissionIds,
      }
    );

    return response.data;
  },
};