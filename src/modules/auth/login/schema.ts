
import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address.').min(1, 'Email is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.').min(1, 'Password is required.'),
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;
