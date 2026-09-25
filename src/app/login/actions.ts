"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function authentifier(_etat: string | null, formData: FormData) {
  const supabase = await createClient();
  const identifiants = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  if (formData.get("mode") === "inscription") {
    const origine = (await headers()).get("origin");
    const { data, error } = await supabase.auth.signUp({
      ...identifiants,
      options: { emailRedirectTo: `${origine}/auth/confirm` },
    });
    if (error) return error.message;
    // Sans session, Supabase attend la confirmation de l'email
    if (!data.session) return "Vérifie tes emails pour confirmer ton compte.";
  } else {
    const { error } = await supabase.auth.signInWithPassword(identifiants);
    if (error) return error.message;
  }

  redirect("/");
}

export async function deconnecter() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
