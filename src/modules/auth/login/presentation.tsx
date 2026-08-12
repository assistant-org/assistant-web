import React from "react";
import { ClipLoader } from "react-spinners";
import { ILoginPresentationProps } from "./types";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { PROPOSAL_BRAND } from "../../../shared/services/budgets/pdf/proposal.brand";

const labelBrown = "!text-[#3d2a1c]";

export default function LoginPresentation({
  register,
  handleSubmit,
  onSubmit,
  errors,
  isLoading,
}: ILoginPresentationProps) {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        backgroundColor: "#f7f3eb",
        backgroundImage:
          "radial-gradient(circle at 18% 22%, rgba(120,90,50,0.07) 0 1px, transparent 1px), radial-gradient(circle at 82% 78%, rgba(120,90,50,0.05) 0 1px, transparent 1px)",
        backgroundSize: "44px 44px, 60px 60px",
      }}
    >
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src={PROPOSAL_BRAND.logoSrc}
            alt={PROPOSAL_BRAND.name}
            width={88}
            height={88}
            className="mb-4 h-20 w-20 object-contain"
          />
          <h1 className="text-2xl font-extrabold tracking-tight text-[#2c2118] sm:text-3xl">
            {PROPOSAL_BRAND.name}
          </h1>
          <p className="mt-2 text-sm text-[#6b5a4a]">Entre na sua conta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            id="email"
            label="E-mail"
            type="email"
            autoComplete="email"
            register={register("email")}
            error={errors.email?.message}
            disabled={isLoading}
            labelClassName={labelBrown}
            className="!bg-transparent border-[#d6c8b4] shadow-none focus:border-[#3d2a1c] focus:ring-[#3d2a1c]"
          />
          <Input
            id="password"
            label="Senha"
            type="password"
            autoComplete="current-password"
            register={register("password")}
            error={errors.password?.message}
            disabled={isLoading}
            labelClassName={labelBrown}
            className="!bg-transparent border-[#d6c8b4] shadow-none focus:border-[#3d2a1c] focus:ring-[#3d2a1c]"
          />

          <Button
            type="submit"
            disabled={isLoading}
            fullWidth
            className="!mt-7 !bg-[#3d2a1c] hover:!bg-[#2c2118] focus-visible:!ring-[#3d2a1c]"
          >
            {isLoading ? <ClipLoader size={20} color="#ffffff" /> : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
