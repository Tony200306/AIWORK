"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNextTranslation } from "@/hooks/useNextTranslation";
import { getRequiredMessage } from "@/utils/functions/getRequiredMessage";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().min(1),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const t = useNextTranslation();
  const router = useRouter();

  const zodAlwaysRefine = <T,>(schema: z.ZodType<T>) => {
    return z.any().superRefine(async (value, ctx) => {
      const result = await schema.safeParseAsync(value);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue(issue);
        }
      }
    }) as unknown as z.ZodType<T>;
  };

  const formSchema = z.object({
    name: zodAlwaysRefine(
      registerSchema.shape.name.refine((val) => val.trim().length > 0, {
        message: getRequiredMessage(t, "AuthLocales.name_label"),
      })
    ),
    email: zodAlwaysRefine(
      registerSchema.shape.email.refine((val) => val.trim().length > 0, {
        message: getRequiredMessage(t, "AuthLocales.email_label"),
      })
    ),
    password: zodAlwaysRefine(
      registerSchema.shape.password.refine((val) => val.trim().length > 0, {
        message: getRequiredMessage(t, "AuthLocales.password_label"),
      })
    ),
    role: zodAlwaysRefine(
      registerSchema.shape.role.refine((val) => val.trim().length > 0, {
        message: getRequiredMessage(t, "AuthLocales.role_label"),
      })
    ),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
    },
  });

  const values = watch();

  const authStore = useAuthStore();
  const handleSubmitFormRegister = async (data: RegisterFormValues) => {
    await authStore.signup({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      },
      onSuccess: () => {
        toast.success(t("AuthLocales.signup_success"));
        router.push("/");
      },
    });
  };
  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <Card className="mx-auto max-w-sm w-full shadow-none border-none">
          <CardHeader>
            <CardTitle className="text-2xl">
              {t("AuthLocales.register_title")}
            </CardTitle>
            <CardDescription>
              {t("AuthLocales.register_description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleSubmitFormRegister)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("AuthLocales.name_label")}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t("AuthLocales.name_placeholder")}
                    {...register("name")}
                    value={values.name}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">{t("AuthLocales.email_label")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("AuthLocales.email_placeholder")}
                    {...register("email")}
                    value={values.email}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">
                    {t("AuthLocales.password_label")}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    value={values.password}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">{t("AuthLocales.role_label")}</Label>
                  <Input
                    id="role"
                    type="text"
                    placeholder={t("AuthLocales.role_placeholder")}
                    {...register("role")}
                    value={values.role}
                  />
                  {errors.role && (
                    <p className="text-sm text-red-500">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  {t("AuthLocales.register_button")}
                </Button>
                <Button variant="outline" className="w-full" type="button">
                  {t("AuthLocales.register_with_github")}
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
              {t("AuthLocales.already_have_account")}{" "}
              <Link href={`/login`} className="underline">
                {t("AuthLocales.sign_in")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="hidden bg-muted lg:block">
        <div className="flex items-center justify-center h-full">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold mb-4">Join Vantum AI</h2>
            <p className="text-muted-foreground">
              Create your account and start your journey with us today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
