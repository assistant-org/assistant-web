import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, LoginFormSchema } from "./schema";
import { ILoginPresentationProps } from "./types";
import LoginPresentation from "./presentation";
import { useSession } from "../../../shared/hooks/useSession";
import authService from "../../../shared/services/auth.service";
import { IUser, UserLevel } from "../../../shared/@types/global";
import { useToast } from "../../../shared/context/ToastContext";

export default function LoginContainer() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useSession();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFormSchema) => {
    setIsLoading(true);
    try {
      const authData = await authService.login(data);
      if (authData.user) {
        const user: IUser = {
          name:
            (authData.user as any).display?.name ||
            authData.user.user_metadata?.display?.name ||
            authData.user.user_metadata?.name ||
            authData.user.email?.split("@")[0] ||
            "User",
          email: authData.user.email || "",
          level: UserLevel.ADMIN,
        };
        const token = authData.session?.access_token || "";
        login(user, token);
        success("Login realizado com sucesso!");
      } else {
        throw new Error("Login failed");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      error(err.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  const presentationProps: ILoginPresentationProps = {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isLoading,
  };

  return <LoginPresentation {...presentationProps} />;
}
