"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabase"

type Configuracion = {
  logo: string
  nombre_empresa: string
}

type ConfiguracionContextProps = Configuracion & {
  setConfiguracion: (config: Configuracion) => void
}

// Creamos el contexto
const ConfiguracionContext = createContext<ConfiguracionContextProps | undefined>(undefined)

// Provider que debe envolver el layout del dashboard
export const ConfiguracionProvider = ({ children }: { children: ReactNode }) => {
  const [configuracion, setConfiguracion] = useState<Configuracion>({
    logo: "",
    nombre_empresa: "",
  })

  useEffect(() => {
    const fetchConfiguracion = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const empresa_id = userData.user?.user_metadata?.empresa_id

      if (!empresa_id) return

      const { data, error } = await supabase
        .from("configuracion")
        .select("logo, nombre_empresa")
        .eq("empresa_id", empresa_id)
        .maybeSingle()

      if (error) {
        console.error("Error al cargar configuración:", error)
        return
      }

      if (data) {
        setConfiguracion({
          logo: data.logo || "",
          nombre_empresa: data.nombre_empresa || "",
        })
      }
    }

    fetchConfiguracion()
  }, [])

  return (
    <ConfiguracionContext.Provider value={{ ...configuracion, setConfiguracion }}>
      {children}
    </ConfiguracionContext.Provider>
  )
}

// Hook para consumir el contexto
export const useConfiguracion = () => {
  const context = useContext(ConfiguracionContext)
  if (!context) {
    throw new Error("useConfiguracion debe usarse dentro de ConfiguracionProvider")
  }
  return context
}
