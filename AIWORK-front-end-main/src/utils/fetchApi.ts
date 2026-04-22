import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { ServiceException } from "~/services/_shared/utils/ServiceException";
import { FetchAPI } from "~/shared/Utilities";
import { useAuthStore } from "~/stores/authStore";
import { removeAuthCookie } from "~/utils/authCookie";
import { RouteConfig } from "~/constants/RouteConfig";

interface RefreshTokenResponseData {
  member: {
    _id: string;
    merchantCode: string;
    memberCode: string;
    email: string;
    memberName: string;
    phone: string;
    roleSample: string;
    role: string;
    gender: string;
    position: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: 0;
  };
  payload: {
    type: string;
    accessToken: string;
    refreshToken: string;
  };
}

export const fetchApi = new FetchAPI({
  baseConfig: {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  refreshTokenConfig: {
    request: async ({ axiosInstance, accessToken, refreshToken }) => {
      const response = await axiosInstance.request<
        ResponseDetailSuccess<RefreshTokenResponseData> | ResponseFailure
      >({
        url: "/authz/refresh-token",
        method: "POST",
        data: { accessToken, refreshToken },
      });
      if (ServiceException.isResponseError(response)) {
        throw new ServiceException(response.data.message, response.data);
      }
      return response.data as ResponseDetailSuccess<RefreshTokenResponseData>;
    },
    success: (response) => {
      console.log("Refresh token successfully!", response);
      const authStore = useAuthStore.getState();
      authStore.setToken({
        accessToken: [
          response.data.payload.type,
          response.data.payload.accessToken,
        ].join(" "),
        refreshToken: response.data.payload.refreshToken,
      });
    },
    failure: (error) => {
      console.log("Refresh token failed", error);
      const authStore = useAuthStore.getState();
      authStore.logout();
    },
    setRefreshCondition: (error) => {
      return error.response?.status === 403;
    },
  },
  setAccessToken: () => {
    const { data } = useAuthStore.getState();
    return data?.token?.accessToken;
  },
  setRefreshToken: () => {
    const { data } = useAuthStore.getState();
    return data?.token?.refreshToken;
  },
  setConditionApplyAccessToken: () => {
    return true;
  },
  onUnauthorized: () => {
    // Clear auth cookie
    removeAuthCookie();

    // Clear auth token and user info from store
    const currentState = useAuthStore.getState();
    useAuthStore.setState({
      data: {
        ...currentState.data,
        token: null,
        userInfo: null,
      },
    });

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.replace(RouteConfig.LoginPage.path);
    }
  },
});

export const localFetchApi = new FetchAPI({
  baseConfig: {
    baseURL: "",
  },
  refreshTokenConfig: {
    request: async () => {
      return {} as any;
    },
    success: () => {},
    failure: () => {},
    setRefreshCondition: () => {
      return false;
    },
  },
  setAccessToken: () => {
    return undefined;
  },
  setRefreshToken: () => {
    return undefined;
  },
  setConditionApplyAccessToken: () => {
    return false;
  },
});
