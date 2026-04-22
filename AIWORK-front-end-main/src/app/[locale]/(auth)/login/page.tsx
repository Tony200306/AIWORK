"use client";
import { Form } from "@/components/Form/Form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RouteConfig, ONBOARDING_FLOW_KEYS } from "@/constants/RouteConfig";
import { FormMutationStateValues } from "@/shared/TypescriptUtilities";
import { useAuthStore } from "@/stores/authStore";
import { useGetLastSprintId } from "@/hooks/shared/useGetLastSprintId";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { TFunction, useNextTranslation } from "~/hooks/useNextTranslation";
import { getRequiredMessage } from "~/utils/functions/getRequiredMessage";
import { zodAlwaysRefine } from "~/utils/functions/zodAlwaysRefine";

export const getFormLoginSchema = (t: TFunction) => {
  return z.object({
    email: z
      .string({
        required_error: getRequiredMessage(t, "AuthLocales.user_name"),
      })
      .trim()
      .min(1, { message: getRequiredMessage(t, "AuthLocales.user_name") }),

    password: z
      .string({
        required_error: getRequiredMessage(t, "AuthLocales.password"),
      })
      .trim()
      .min(1, { message: getRequiredMessage(t, "AuthLocales.password") }),
  });
};

export type FormLoginValues = z.infer<ReturnType<typeof getFormLoginSchema>>;
export type FormLoginStateValues = FormMutationStateValues<FormLoginValues>;

export default function LoginPage() {
  const t = useNextTranslation();
  const authStore = useAuthStore();
  const router = useRouter();
  const isLoggingIn = authStore.data.isLoggingIn;
  const { data: lastSprintData } = useGetLastSprintId();

  const formInstance = useForm<FormLoginValues>({
    resolver: zodResolver(zodAlwaysRefine(getFormLoginSchema(t))),
    defaultValues: {
      email: "cuongvu22@gmail.com",
      password: "12345678",
    },
  });
  const { handleSubmit, watch } = formInstance;
  const values = watch();

  const handleSubmitFormLogin = (values: FormLoginValues) => {
    const email = values.email;
    const password = values.password;
    authStore.login({
      data: {
        email: email,
        password: password,
      },
      onSuccess: () => {
        toast.success(t("AuthLocales.login_success"));

        // Check for get-vantum-landing-page flow key
        const getVantumFlowKey = sessionStorage.getItem(ONBOARDING_FLOW_KEYS.GET_VANTUM_LANDING_PAGE);
        const fromOnboarding = sessionStorage.getItem("onboarding_redirect_braindump");

        if (getVantumFlowKey) {
          // Clear the flow key
          sessionStorage.removeItem(ONBOARDING_FLOW_KEYS.GET_VANTUM_LANDING_PAGE);

          // Handle get-vantum flow redirect
          const sprintData = lastSprintData?.data;

          if (!sprintData) {
            // No sprint data → go to braindump
            router.push(RouteConfig.BrainDumpPage.path);
          } else {
            // Sprint exists
            const { id, isActive } = sprintData;

            if (isActive) {
              // Active sprint → go to master kanban
              router.push(RouteConfig.MasterKanBan.getPath(id));
            } else {
              // Completed sprint → go to sprint complete
              router.push(RouteConfig.SprintComplete.getPath(id));
            }
          }
        } else if (fromOnboarding) {
          sessionStorage.removeItem("onboarding_redirect_braindump");
          router.push(RouteConfig.BrainDumpPage.path);
        } else {
          router.push(RouteConfig.HomePage.path);
        }

        setTimeout(() => {
          authStore.setIsLoggingIn?.(false);
        }, 3000);
      },
      onError: () => {
          authStore.setIsLoggingIn?.(false);

      }
    });
  };
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side - Login Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <span className="text-lg font-semibold">
              {t("Metadata.site_title")}
            </span>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {t("AuthLocales.login_title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("AuthLocales.login_description")}
              </p>
            </div>
            <Form
              onSubmit={handleSubmit(handleSubmitFormLogin as any, console.log)}
            >
              {" "}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("AuthLocales.email_label")}</Label>
                  <Input
                  disabled={isLoggingIn}
                    id="email"
                    type="email"
                    onChange={(value) => {
                      formInstance.setValue("email", value.target.value);
                    }}
                    value={values.email}
                    placeholder={t("AuthLocales.email_placeholder")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">
                      {t("AuthLocales.password_label")}
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {t("AuthLocales.forgot_password")}
                    </Link>
                  </div>
                  <Input
                    disabled={isLoggingIn}
                    id="password"
                    type="password"
                    required
                    onChange={(value) => {
                      formInstance.setValue("password", value.target.value);
                    }}
                    value={values.password}
                  />
                </div>

                <Button 
              disabled={isLoggingIn}
              className="w-full" size="lg">
                  {t("AuthLocales.login_button")}
                </Button>
              </div>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">
                  {t("AuthLocales.or_continue_with")}
                </span>
              </div>
            </div>

            <Button
              disabled={isLoggingIn}
              variant="outline"
              className="w-full"
              size="lg"
              type="button"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              {t("AuthLocales.login_with_github")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("AuthLocales.no_account")}{" "}
              <Link
                href="/register"
                className="font-medium underline underline-offset-4 hover:text-foreground"
              >
                {t("AuthLocales.sign_up")}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden bg-muted lg:block">
        <div className="flex h-full items-center justify-center p-8">
          <div className="flex h-96 w-96 items-center justify-center rounded-full border-[40px] border-border/50 bg-background/5">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-muted-foreground"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
