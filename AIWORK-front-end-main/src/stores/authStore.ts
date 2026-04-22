import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { RouteConfig } from '~/constants/RouteConfig';
import { useNextTranslation } from '~/hooks/useNextTranslation';
import { Token } from '~/models/Token';
import { UserInfo } from '~/models/UserInfo';
import { getMessageError } from '~/services/_shared/utils/getMessageError';
import { login, Login } from '~/services/Auth/login';
import { requestResetPassword, RequestResetPassword } from '~/services/Auth/requestResetPassword';
import { resetPassword, ResetPassword } from '~/services/Auth/resetPassword';
import { signup, SignupPayload } from '~/services/Auth/signup';
import { validateOTP, ValidateOTP } from '~/services/Auth/validateOTP';
import { oauthLogin, OAuthLoginPayload } from '~/services/Auth/oauthLogin';
import { onboardingSendInfo } from '~/services/onboarding/onboardingSendInfo';
import { toast } from "sonner";
import { setAuthCookie, removeAuthCookie } from '~/utils/authCookie';
interface AuthState {
  isLoggingIn: boolean;
  token: Token | null;
  userInfo: UserInfo | null;
  isLoginModalOpen?: boolean;
  isSignUpModalOpen?: boolean;
  isSigningUp?: boolean;
  isForgetPasswordModalOpen?: boolean;
  isOTPValidationModalOpen?: boolean;
  isResetPasswordModalOpen?: boolean;
  isSwitchLanguageModalOpen?: boolean;
  isChangePasswordModalOpen?: boolean;
  isEmailVerificationModalOpen?: boolean;
  // Forgot password states
  isRequestingResetPassword?: boolean;
  isValidatingOTP?: boolean;
  isResettingPassword?: boolean;
  // OAuth login state
  isOAuthLoggingIn?: boolean;
}

interface AuthStore {
  data: AuthState;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setToken: (token: Token) => void;
  logout: () => void;
  login: (params: { data: Login; onSuccess?: () => void; onError?: () => void }) => void;
  oauthLogin: (params: { data: OAuthLoginPayload; onSuccess?: () => void; onError?: () => void }) => void;
  setIsLoginModalOpen: (isLoginModalOpen: boolean) => void;
  setIsSignUpModalOpen: (isSignUpModalOpen: boolean) => void;
  signup: (params: { data: SignupPayload; onSuccess?: () => void; onError?: () => void }) => void;
  setIsForgetPasswordModalOpen: (isForgetPasswordModalOpen: boolean) => void;
  setIsOTPValidationModalOpen: (isOTPValidationModalOpen: boolean) => void;
  setIsResetPasswordModalOpen: (isResetPasswordModalOpen: boolean) => void;
  setIsLanguageSwitcherModalOpen: (isSwitchLanguageModalOpen: boolean) => void;
  setIsChangePasswordModalOpen: (isChangePasswordModalOpen: boolean) => void;
  setIsEmailVerificationModalOpen: (isEmailVerificationModalOpen: boolean) => void;
  // Forgot password functions
  requestResetPassword: (params: { data: RequestResetPassword; onSuccess?: () => void; onError?: () => void }) => void;
  validateOTP: (params: { data: ValidateOTP; onSuccess?: () => void; onError?: () => void }) => void;
  resetPassword: (params: { data: ResetPassword; onSuccess?: () => void; onError?: () => void }) => void;
  resetForgotPasswordState: () => void;
  setUserInfo: (userInfo: any) => void;
  setIsLoggingIn: (isLoggingIn: boolean) => void;
}

const defaultDataState: AuthState = {
  isLoggingIn: false,
  token: null,
  userInfo: null,
  isLoginModalOpen: false,
  isSignUpModalOpen: false,
  isSigningUp: false,
  isSwitchLanguageModalOpen: true,
  isEmailVerificationModalOpen: false,
  isRequestingResetPassword: false,
  isValidatingOTP: false,
  isResettingPassword: false,
  isOAuthLoggingIn: false,
};
export const useAuthStore = create<AuthStore>()(
  persist(
    set => {
      return {
        data: defaultDataState,
        _hasHydrated: false,
        setHasHydrated: (state) => {
          set({ _hasHydrated: state });
        },
        setIsLoggingIn: (isLoggingIn: boolean) => {
          set(state => {
            return {
              data: {
                ...state.data,
                isLoggingIn,
              },
            };
          });
        },
        setUserInfo: userInfo => {
          set(state => {
            return {
              data: {
                ...state.data,
                userInfo,
              },
            };
          });
        },
        setToken: token => {
          set(state => {
            return {
              data: {
                ...state.data,
                token,
              },
            };
          });
        },
        logout: () => {
          // Clear cookie
          removeAuthCookie();

          set({
            data: {
              ...defaultDataState,
            },
          });
          window.location.replace(RouteConfig.HomePage.path);
        },
        login: async ({ data, onError, onSuccess }) => {
          set(state => {
            return {
              data: {
                ...state.data,
                token: null,
                userInfo: null,
                isLoggingIn: true,
              },
            };
          });
          try {
            //FIXME: UNCOMPLETED
            const response = await login(data);
            const accessToken = response.data.access_token;

            // Set auth cookie
            setAuthCookie(accessToken);


            set(state => {
              return {
                data: {
                  ...state.data,
                  userInfo: response.data.user,
                  token: {
                    accessToken: ["Bearer", response.data.access_token].join(' '),
                    //TODO: fill refresh token 
                    refreshToken: undefined,
                  },
                  isLoginModalOpen: false,
                },
              };
            });
            console.log('respons===e', response);

            onSuccess?.();
          } catch (error) {
            console.log('error', error);
            toast.error(useNextTranslation.translate('AuthLocales.login_error'), {
              description: getMessageError(error),
            })
            onError?.();
          } finally {
            set(state => {
              return {
                data: {
                  ...state.data,
                  isSigningUp: false,
                  isSignUpModalOpen: false,
                },
              };
            });
          }
        },
        oauthLogin: async ({ data, onError, onSuccess }) => {
          set(state => {
            return {
              data: {
                ...state.data,
                token: null,
                userInfo: null,
                isOAuthLoggingIn: true,
              },
            };
          });
          try {
            const response = await oauthLogin(data);
            const accessToken = response.data.access_token;

            // Set auth cookie
            setAuthCookie(accessToken);

            set(state => {
              return {
                data: {
                  ...state.data,
                  userInfo: response.data.user,
                  token: {
                    accessToken: ["Bearer", response.data.access_token].join(' '),
                    refreshToken: undefined,
                  },
                  isOAuthLoggingIn: false,
                },
              };
            });

            // Subscribe to newsletter with external_flow tags
            try {
              await onboardingSendInfo({
                name: data.name,
                email: data.email,
                tags: ['external_flow'],
                utmSource: 'external_flow',
                utmMedium: 'web',
                utmCampaign: 'external_flow',
              });
            } catch (newsletterError) {
              // Don't block login if newsletter subscription fails
              console.warn('Newsletter subscription failed:', newsletterError);
            }

            onSuccess?.();
          } catch (error) {
            console.error('OAuth login error:', error);
            toast.error(useNextTranslation.translate('AuthLocales.login_error'), {
              description: getMessageError(error),
            });
            onError?.();
          } finally {
            set(state => {
              return {
                data: {
                  ...state.data,
                  isOAuthLoggingIn: false,
                },
              };
            });
          }
        },
        setIsLoginModalOpen: isLoginModalOpen => {
          return set(state => {
            return {
              data: {
                ...state.data,
                isLoginModalOpen,
              },
            };
          });
        },
        setIsSignUpModalOpen: isSignUpModalOpen => {
          return set(state => {
            return {
              data: {
                ...state.data,
                isSignUpModalOpen,
              },
            };
          });
        },
        signup: async ({ data, onSuccess, onError }) => {
          set(state => {
            return {
              data: {
                ...state.data,
                token: null,
                userInfo: null,
                isSigningUp: true,
              },
            };
          });
          try {
            //FIXME: UNCOMPLETED
            const response = await signup(data);
            const accessToken = response.data.access_token;

            // Set auth cookie
            setAuthCookie(accessToken);

            set(state => {
              return {
                data: {
                  ...state.data,
                  userInfo: response.data.user,
                  token: {
                    accessToken: ["Bearer", response.data.access_token].join(' '),
                    //TODO: fill refresh token
                    refreshToken: undefined,
                  },
                  isLoginModalOpen: false,
                },
              };
            });
            onSuccess?.();
          } catch (error) {
            toast.error(useNextTranslation.translate('AuthLocales.signup_error'), {
              description: getMessageError(error),
            })
            onError?.();
          } finally {
            set(state => {
              return {
                data: {
                  ...state.data,
                  isLoggingIn: false,
                  isSigningUp: false,
                  isSignUpModalOpen: false,
                },
              };
            });
          }
        },
        setIsForgetPasswordModalOpen: isForgetPasswordModalOpen => {
          return set(state => {
            return {
              data: {
                ...state.data,
                isForgetPasswordModalOpen,
              },
            };
          });
        },
        setIsLanguageSwitcherModalOpen: isSwitchLanguageModalOpen => {
          return set(state => {
            return {
              data: {
                ...state.data,
                isSwitchLanguageModalOpen,
              },
            };
          });
        },
        setIsChangePasswordModalOpen: isChangePasswordModalOpen => {
          return set(state => {
            return {
              data: {
                ...state.data,
                isChangePasswordModalOpen,
              },
            };
          });
        },
        setIsEmailVerificationModalOpen: isEmailVerificationModalOpen => {
          return set(state => {
            return {
              data: {
                ...state.data,
                isEmailVerificationModalOpen,
              },
            };
          });
        },
        requestResetPassword: async ({ data, onError, onSuccess }) => {
          set(state => {
            return {
              data: {
                ...state.data,
                isRequestingResetPassword: true,
              },
            };
          });
          try {
            const _response = await requestResetPassword(data);
            set(state => {
              return {
                data: {
                  ...state.data,
                  isRequestingResetPassword: false,
                },
              };
            });
            onSuccess?.();
          } catch (error) {
            // Reset loading state khi có lỗi
            set(state => {
              return {
                data: {
                  ...state.data,
                  isRequestingResetPassword: false,
                },
              };
            });
            toast(useNextTranslation.translate('AuthLocales.request_reset_password_error'), {
              description: getMessageError(error),
            })
            onError?.();
          }
        },
        validateOTP: async ({ data, onError, onSuccess }) => {
          set(state => {
            return {
              data: {
                ...state.data,
                isValidatingOTP: true,
              },
            };
          });
          try {
            const _response = await validateOTP(data);

            if (_response.data === false) {
              throw new Error();
            }
            set(state => {
              return {
                data: {
                  ...state.data,
                  isValidatingOTP: false,
                },
              };
            });
            onSuccess?.();
          } catch (error) {
            set(state => {
              return {
                data: {
                  ...state.data,
                  isValidatingOTP: false,
                },
              };
            });
            toast(useNextTranslation.translate('AuthLocales.otp_invalid'), {
              description: getMessageError(error),
            })
            onError?.();
          }
        },
        resetPassword: async ({ data, onError, onSuccess }) => {
          set(state => {
            return {
              data: {
                ...state.data,
                isResettingPassword: true,
              },
            };
          });
          try {
            const _response = await resetPassword(data);
            if (_response.data === false) {
              throw new Error();
            }
            set(state => {
              return {
                data: {
                  ...state.data,
                  isResettingPassword: false,
                },
              };
            });
            onSuccess?.();
          } catch (error) {
            set(state => {
              return {
                data: {
                  ...state.data,
                  isResettingPassword: false,
                },
              };
            });
            toast(useNextTranslation.translate('AuthLocales.reset_password_error'), {
              description: getMessageError(error),
            })
            onError?.();
          }
        },
        resetForgotPasswordState: () => {
          set(state => {
            return {
              data: {
                ...state.data,
                isRequestingResetPassword: false,
                isValidatingOTP: false,
                isResettingPassword: false,
              },
            };
          });
        },
        setIsOTPValidationModalOpen: isOTPValidationModalOpen => {
          return set(state => {
            return {
              data: {
                ...state.data,
                isOTPValidationModalOpen,
              },
            };
          });
        },
        setIsResetPasswordModalOpen: isResetPasswordModalOpen => {
          return set(state => {
            return {
              data: {
                ...state.data,
                isResetPasswordModalOpen,
              },
            };
          });
        },
      };
    },
    {
      name: 'useAuthStore',
      storage: createJSONStorage(() => localStorage),

      version: 1,
      partialize: state => {
        return {
          data: {
            ...state.data,
            isSwitchLanguageModalOpen: false,
            isForgetPasswordModalOpen: false,
            isOTPValidationModalOpen: false,
            isResetPasswordModalOpen: false,
            isLoginModalOpen: false,
            isSignUpModalOpen: false,
            isLoggingIn: false,
            isSigningUp: false,
            isChangePasswordModalOpen: false,
            isOAuthLoggingIn: false,
          },
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
