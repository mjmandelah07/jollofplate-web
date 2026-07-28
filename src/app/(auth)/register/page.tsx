"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { customerRegister } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { getSafeNextPath, withNextQuery } from "@/lib/auth/redirect";
import { registerSchema, type RegisterValues } from "@/lib/auth/schemas";
import { setCustomerSession } from "@/lib/auth/storage";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = getSafeNextPath(searchParams.get("next"));
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
    mode: "onBlur",
  });

  async function onSubmit(values: RegisterValues) {
    setFormError(null);

    try {
      const result = await customerRegister(values);
      setCustomerSession(result.accessToken, {
        ...result.user,
        role: "customer",
        emailVerified: result.user.emailVerified ?? false,
      });
      toast.success(
        result.message ||
          "Registered. Check your email to verify your account.",
      );
      router.replace(next);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Unable to create your account right now.";

      if (/email.*registered|already.*email|email.*exist/i.test(message)) {
        form.setError("email", { message });
        return;
      }
      if (/phone/i.test(message)) {
        form.setError("phone", { message });
        return;
      }
      if (/password/i.test(message)) {
        form.setError("password", { message });
        return;
      }

      setFormError(message);
    }
  }

  const loading = form.formState.isSubmitting;

  return (
    <AuthShell
      title="Create your account"
      description="Save orders and checkout with WhatsApp in minutes."
      image="/register.png"
      imageAlt="JollofPlate meal ready to share"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={withNextQuery("/login", next)}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="given-name"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="family-name"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <PhoneInput
                    disabled={loading}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>Nigeria (+234)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete="new-password"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>At least 6 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {formError ? (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}

          <Button type="submit" className="w-full py-2" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
