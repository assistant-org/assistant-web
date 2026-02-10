import {
  UseFormRegister,
  UseFormHandleSubmit,
  FieldErrors,
} from "react-hook-form";
import { LoginFormSchema } from "./schema";

export interface ILoginPresentationProps {
  readonly register: UseFormRegister<LoginFormSchema>;
  readonly handleSubmit: UseFormHandleSubmit<LoginFormSchema>;
  readonly onSubmit: (data: LoginFormSchema) => void;
  readonly errors: FieldErrors<LoginFormSchema>;
  readonly isLoading: boolean;
}
