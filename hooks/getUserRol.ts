// lib/getUserRol.ts
import { supabase } from "@/lib/supabase";

export const getUserRol = async () => {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  if (!userId) return null

  // Primero en empleados
  const { data: empleadoData } = await supabase
    .from("empleados")
    .select("rol")
    .eq("usuario_id", userId)
    .limit(1)

  if (empleadoData && empleadoData.length > 0) {
    return empleadoData[0].rol
  }

  // Si no está en empleados, buscar en usuarios
  const { data: usuarioData } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", userId)
    .limit(1)

  if (usuarioData && usuarioData.length > 0) {
    return usuarioData[0].rol
  }

  return null
}
