import { supabase } from "@/lib/supabase"

export async function getCurrentUserEmpresa(): Promise<string | null> {
  const { data: userSession } = await supabase.auth.getUser()
  const userId = userSession?.user?.id

  if (!userId) throw new Error("Usuario no autenticado")

  const { data, error } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", userId)
    .single()

  if (error) throw error
  return data.empresa_id
}
