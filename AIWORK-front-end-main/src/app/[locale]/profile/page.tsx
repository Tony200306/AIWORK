"use client";

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
import { signup } from "@/services/user/updateUser";
import { signup as getUserProfile } from "@/services/user/getUser";
import { getMessageError } from "@/services/_shared/utils/getMessageError";
import { useEffect, useState } from "react";

const updateProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().min(1),
  password: z.string().optional(),
  role: z.string().min(1),
});

type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

export default function ProfilePage() {
  const t = useNextTranslation();
  const router = useRouter();
  const authStore = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

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
      updateProfileSchema.shape.name.refine((val) => val.trim().length > 0, {
        message: getRequiredMessage(t, "AuthLocales.name_label"),
      })
    ),
    email: zodAlwaysRefine(
      updateProfileSchema.shape.email.refine((val) => val.trim().length > 0, {
        message: getRequiredMessage(t, "AuthLocales.email_label"),
      })
    ),
    password: z.string().optional(),
    role: zodAlwaysRefine(
      updateProfileSchema.shape.role.refine((val) => val.trim().length > 0, {
        message: getRequiredMessage(t, "AuthLocales.role_label"),
      })
    ),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
    },
  });

  const values = watch();

  // Fetch and populate form with user data from API
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const response = await getUserProfile();
        if (response.data) {
          setValue("name", response.data.name || "");
          setValue("email", response.data.email || "");
          setValue("role", response.data.role || "");
          setUserId(response.data.id);
          
          // Update auth store with fresh data
          authStore.setUserInfo(response.data);
        }
      } catch (error) {
        toast.error("Failed to load user profile", {
          description: getMessageError(error),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleSubmitFormUpdate = async (data: UpdateProfileFormValues) => {
    if (!userId) {
      toast.error("User not found. Please login again.");
      return;
    }

    setIsUpdating(true);
    try {
      // Build payload - password is required by API
      const payload = {
        name: data.name,
        email: data.email,
        role: data.role,
        password: data.password && data.password.trim() 
          ? data.password 
          : authStore.data.userInfo?.password || "",
      };

      // Check if we have a password (either new or existing)
      if (!payload.password) {
        toast.error("Password is required. Please enter your password.");
        setIsUpdating(false);
        return;
      }

      const response = await signup(payload, userId);
      
      // Update user info in store with the response data if available
      if (response.data) {
        authStore.setUserInfo({
          ...authStore.data.userInfo,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
        });
      } else {
        // Fallback to form data if response doesn't contain user data
        authStore.setUserInfo({
          ...authStore.data.userInfo,
          name: data.name,
          email: data.email,
          role: data.role,
        });
      }

      toast.success("Profile updated successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to update profile", {
        description: getMessageError(error),
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="mx-auto max-w-2xl w-full">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="mx-auto max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Update Profile</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSubmitFormUpdate)}>
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
                  placeholder="Enter password to update profile"
                  {...register("password")}
                  value={values.password}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter your current password, or a new password to change it
                </p>
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

              <Button type="submit" className="w-full" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
