import axios, { AxiosError, AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Configuration for initializing FetchAPI
 * @typedef {Object} Configure
 * @property {string} reduxSagaCancel - Cancel token of Redux Saga
 * @property {AxiosRequestConfig} baseConfig - Base configuration for Axios
 * @property {Function} setAccessToken - Function to retrieve access token
 * @property {Function} setRefreshToken - Function to retrieve refresh token
 * @property {Function} setConditionApplyAccessToken - Function to check condition for applying access token in headers
 * @property {RefreshTokenConfig} refreshTokenConfig - Configuration for refresh token API setup
 * @property {Function} onUnauthorized - Optional callback when 401 response is received
 */
interface Configure<RefreshTokenSuccess> {
  /** Cancel token of Redux Saga */
  reduxSagaCancel?: string;
  /** Base configuration for Axios */
  baseConfig: AxiosRequestConfig;
  /** Function to retrieve access token */
  setAccessToken: () => string | undefined;
  /** Function to retrieve refresh token */
  setRefreshToken: () => string | undefined;
  /** Function to check condition for applying access token in headers */
  setConditionApplyAccessToken: (config: AxiosRequestConfig) => boolean;
  /** Configuration for refresh token API setup */
  refreshTokenConfig: RefreshTokenConfig<RefreshTokenSuccess>;
  /** Optional callback when 401 Unauthorized response is received */
  onUnauthorized?: () => void;
}

/**
 * Configuration for refresh token functionality
 * @typedef {Object} RefreshTokenConfig
 * @property {string} url - URL for the refresh token API
 * @property {Function} setRefreshCondition - Condition to perform refresh token operation
 * @property {Function} bodyData -
 * @property {Function} success - Callback on successful refresh token request
 * @property {Function} failure - Callback on failed refresh token request
 */
interface RefreshTokenConfig<ResponseSuccess> {
  /** Condition to perform refresh token operation */
  setRefreshCondition: (error: AxiosError) => boolean;
  /** */
  request: (params: {
    axiosInstance: AxiosInstance;
    refreshToken: string | undefined;
    accessToken: string | undefined;
  }) => Promise<ResponseSuccess>;
  /** Callback on successful refresh token request */
  success: (res: ResponseSuccess, originalRequest: AxiosRequestConfig) => void;
  /** Callback on failed refresh token request */
  failure: (error: unknown) => void;
}

/**
 * FetchAPI class to handle API requests and token management
 */
export class FetchAPI<RefreshTokenSuccess = any> {
  /** Instance of Axios for making HTTP requests. */
  private _axiosInstance: AxiosInstance;
  /** Base configuration for Axios requests. */
  private _baseConfig: Pick<AxiosRequestConfig, 'baseURL' | 'headers' | 'params'>;
  /** Configuration related to the refresh token process. */
  private _refreshTokenConfig: RefreshTokenConfig<RefreshTokenSuccess>;
  /** Token used to cancel ongoing requests in Redux Saga. */
  private _reduxSagaCancel?: string;
  /** Callback when 401 Unauthorized response is received. */
  private _onUnauthorized?: () => void;
  /** Function to retrieve the access token. */
  public setAccessToken: Configure<RefreshTokenSuccess>['setAccessToken'];
  /** Function to retrieve the refresh token. */
  public setRefreshToken: Configure<RefreshTokenSuccess>['setRefreshToken'];
  /** Function to determine if the access token should be applied to the request headers. */
  public setConditionApplyAccessToken: Configure<RefreshTokenSuccess>['setConditionApplyAccessToken'];
  /**
   * Initiates an API request with the provided configuration.
   * Returns an object containing the Axios promise, and functions to abort or cancel the request.
   * @template Response - The expected response type.
   * @param {AxiosRequestConfig} requestConfig - The Axios request configuration.
   * @returns An object containing the Axios promise and functions to control the request.
   */
  public request!: <Response>(requestConfig: AxiosRequestConfig) => {
    axiosPromise: AxiosPromise<Response>;
    abortCancel: () => void;
    axiosCancel: () => void;
  };

  constructor({
    baseConfig,
    refreshTokenConfig,
    reduxSagaCancel,
    setAccessToken,
    setRefreshToken,
    setConditionApplyAccessToken,
    onUnauthorized,
  }: Configure<RefreshTokenSuccess>) {
    this.setAccessToken = setAccessToken;
    this.setRefreshToken = setRefreshToken;
    this.setConditionApplyAccessToken = setConditionApplyAccessToken;
    this._axiosInstance = axios.create();
    this._baseConfig = baseConfig;
    this._reduxSagaCancel = reduxSagaCancel;
    this._refreshTokenConfig = refreshTokenConfig;
    this._onUnauthorized = onUnauthorized;
    this._create();
  }

  /**
   * Sets up interceptor to apply access token in request headers.
   */
  private _handleApplyAccessToken = (): void => {
    this._axiosInstance.interceptors.request.use(config => {
      if (config?.url && this.setConditionApplyAccessToken(config)) {
        const accessToken = this.setAccessToken();
        config.headers['Authorization'] = accessToken;
      }
      return config;
    });
  };

  /**
   * Sets up interceptor to handle 401 Unauthorized responses.
   * Calls the onUnauthorized callback when a 401 response is received.
   */
  private _handleUnauthorized = (): void => {
    if (!this._onUnauthorized) return;

    this._axiosInstance.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response?.status === 401 && this._onUnauthorized) {
          this._onUnauthorized();
        }
        return Promise.reject(error);
      },
    );
  };

  /**
   * Handles the refresh token logic.
   * @private
   * @param {RefreshTokenConfig} config - Configuration for handling the refresh token
   * @param {AxiosError} error - The Axios error that triggered the refresh token process
   * @returns {Promise<AxiosResponse>}
   */
  private _handleRefreshToken = async (
    config: RefreshTokenConfig<RefreshTokenSuccess>,
    error: AxiosError,
  ): Promise<AxiosResponse<any, any> | undefined> => {
    const { request, success, failure } = config;
    try {
      const refreshToken = this.setRefreshToken();
      const accessToken = this.setAccessToken();
      const response = await request({ axiosInstance: this._axiosInstance, accessToken, refreshToken });
      if (error.config) {
        success(response, error.config);
        return await this._axiosInstance.request(error.config);
      }
      return;
    } catch (error) {
      failure(error);
      return await Promise.reject(error);
    } finally {
      this._handleSetupRefreshToken(config);
    }
  };

  /**
   * Sets up the refresh token interceptor.
   * @private
   * @param {RefreshTokenConfig} config - Configuration for the refresh token setup
   */
  private _handleSetupRefreshToken = (config: RefreshTokenConfig<RefreshTokenSuccess>): void => {
    const interceptor = this._axiosInstance.interceptors.response.use(undefined, (error: AxiosError) => {
      if (!config.setRefreshCondition(error)) {
        return Promise.reject(error);
      }
      this._axiosInstance.interceptors.response.eject(interceptor);
      return this._handleRefreshToken(config, error);
    });
  };

  /**
   * Creates the FetchAPI instance and sets up required configurations and interceptors.
   * @private
   */
  private _create = (): void => {
    this._handleApplyAccessToken();
    this._handleUnauthorized();
    this._handleSetupRefreshToken(this._refreshTokenConfig);
    const baseConfig = this._baseConfig;
    this.request = (
      requestConfig: AxiosRequestConfig,
    ): { axiosPromise: Promise<AxiosResponse>; axiosCancel: () => void; abortCancel: () => void } => {
      const axiosCancelToken = axios.CancelToken.source();
      const controller = new AbortController();
      const request = this._axiosInstance({
        cancelToken: axiosCancelToken.token,
        signal: controller.signal,
        ...baseConfig,
        ...requestConfig,
        headers: {
          ...baseConfig.headers,
          ...requestConfig.headers,
        },
        params: {
          ...baseConfig.params,
          ...requestConfig.params,
        },
      });
      return {
        axiosPromise: request,
        axiosCancel: axiosCancelToken.cancel,
        abortCancel: (): void => {
          return controller.abort.apply(controller);
        },
        ...(this._reduxSagaCancel ? { [this._reduxSagaCancel]: axiosCancelToken.cancel } : {}),
      };
    };
  };

  //#region For testing
  //#endregion
}
