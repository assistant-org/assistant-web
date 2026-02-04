
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginFormSchema, LoginFormSchema } from './schema';
import { ILoginPresentationProps } from './types';
import LoginPresentation from './presentation';
import { useSession } from '../../../shared/hooks/useSession';
import authService from '../../../shared/services/auth.service';
import { UserLevel } from '../../../shared/@types/global';

export default function LoginContainer() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { login } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFormSchema) => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Mocking a successful API call
      await authService.login(data);
      const mockUser = {
        name: 'John Doe',
        email: data.email,
        level: UserLevel.ADMIN,
      };
      const mockToken = 'fake-jwt-token-for-demonstration';
      login(mockUser, mockToken);
    } catch (error) {
      console.error("Login failed:", error);
      setApiError("Invalid email or password. Please try again.");
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
    apiError,
  };

  return <LoginPresentation {...presentationProps} />;
}
