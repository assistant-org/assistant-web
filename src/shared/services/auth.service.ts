import { supabase } from "../config";
import { LoginFormSchema } from "../../modules/auth/login/schema";
import { AuthResponse, User } from "@supabase/supabase-js";

class AuthService {
  async login(reqBody: LoginFormSchema): Promise<AuthResponse["data"]> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: reqBody.email,
      password: reqBody.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async getUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

  async getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  }

  async getUserProfile(
    userId: string,
  ): Promise<{ name?: string; email?: string } | null> {
    try {
      // Tenta buscar o perfil da tabela 'profiles' ou 'users'
      const { data, error } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Erro ao buscar perfil:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.warn("Erro ao buscar perfil do usuário:", err);
      return null;
    }
  }
}

export default new AuthService();
