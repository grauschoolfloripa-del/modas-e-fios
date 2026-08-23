"use server";

import { createClient } from "@/lib/supabase/server";

export async function signUp(prevState, formData) {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!fullName || fullName.length < 2) {
    return { error: "Informe seu nome." };
  }
  if (!email) {
    return { error: "Informe seu e-mail." };
  }
  if (password.length < 8) {
    return { error: "A senha precisa ter pelo menos 8 caracteres." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { error: "O cadastro ainda não está configurado neste site." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Já existe uma conta com este e-mail." };
    }
    return { error: "Não foi possível criar a conta. Tente novamente." };
  }

  if (data.session) {
    return { success: true, confirmEmail: false };
  }
  return { success: true, confirmEmail: true };
}
