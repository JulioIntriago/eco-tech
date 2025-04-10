import { supabase } from "@/lib/supabase"

export async function getUserPerfil() {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  if (!userId) return null

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  if (error || !data) {
    console.error("Error al obtener perfil del usuario", error)
    return null
  }

  return data
}
