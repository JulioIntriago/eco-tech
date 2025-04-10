// lib/getUserRol.ts
import { supabase } from "@/lib/supabase";

export const getUserRol = async () => {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  if (!userId) return null

  const { data, error } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error al obtener rol:", error.message)
    return null
  }

  return data?.rol ?? null
}
