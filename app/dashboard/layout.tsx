"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { SidebarProvider } from "@/components/dashboard/sidebar-provider"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { ConfiguracionProvider } from "@/app/dashboard/context/configuracion-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const syncMetadata = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        router.push("/auth/login")
        return
      }

      // Verifica si ya tiene empresa_id en el token
      const { empresa_id, rol } = user.user_metadata

      if (!empresa_id || !rol) {
        // Consulta desde la tabla usuarios
        const { data: perfil, error: errorPerfil } = await supabase
          .from("usuarios")
          .select("empresa_id, rol")
          .eq("id", user.id)
          .single()

        if (perfil && perfil.empresa_id && perfil.rol) {
          await supabase.auth.updateUser({
            data: {
              empresa_id: perfil.empresa_id,
              rol: perfil.rol,
            },
          })

          console.log("✅ Metadata sincronizada con éxito")
        } else {
          console.warn("⚠️ No se pudo encontrar empresa_id o rol del usuario.")
        }
      }
    }

    syncMetadata()
  }, [router])

  return (
    <SidebarProvider>
      <ConfiguracionProvider>
        <div className="flex min-h-screen">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto bg-background">{children}</main>
        </div>
      </ConfiguracionProvider>
    </SidebarProvider>
  )
}
