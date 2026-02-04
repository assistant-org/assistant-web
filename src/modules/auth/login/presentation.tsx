
import React from 'react';
import { ILoginPresentationProps } from './types';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';

export default function LoginPresentation({
  register,
  handleSubmit,
  onSubmit,
  errors,
  isLoading,
  apiError,
}: ILoginPresentationProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            id="email"
            label="Email Address"
            type="email"
            register={register('email')}
            error={errors.email?.message}
            disabled={isLoading}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            register={register('password')}
            error={errors.password?.message}
            disabled={isLoading}
          />

          {apiError && (
            <p className="text-sm text-red-500 text-center">{apiError}</p>
          )}

          <Button type="submit" isLoading={isLoading} fullWidth>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
