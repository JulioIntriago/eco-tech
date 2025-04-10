// lib/usePerfil.ts
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function usePerfil() {
  const [perfil, setPerfil] = useState<{ rol: string; empresa_id: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPerfil = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (!user || authError) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("rol, empresa_id")
        .eq("id", user.id)
        .single()

      if (!error && data) {
        setPerfil({
          rol: data.rol,
          empresa_id: data.empresa_id,
        })
      }

      setLoading(false)
    }

    fetchPerfil()
  }, [])

  return { perfil, loading }
}
