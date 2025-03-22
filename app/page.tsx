"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Smartphone, ShieldCheck, Users, Settings } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUserSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push("/dashboard") // Redirigir si está autenticado
      } else {
        setLoading(false) // Mostrar landing si no está autenticado
      }
    }

    checkUserSession()
  }, [router])

  if (loading) return <div className="flex h-screen items-center justify-center text-lg">Cargando...</div>

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="w-full py-6 bg-white shadow-md">
        <div className="container mx-auto flex justify-between items-center px-6">
          <h1 className="text-2xl font-bold text-primary">Fixie</h1>
          <div className="space-x-4">
            <Button asChild variant="outline">
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Regístrate</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-20 bg-gradient-to-b from-primary/10 to-white">
        <Smartphone className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-4xl font-bold">Gestión inteligente para tu negocio de reparación</h2>
        <p className="mt-4 text-lg text-gray-600">
          Controla órdenes, inventario y clientes con facilidad. ¡Únete a Fixie hoy!
        </p>
        <div className="mt-6 space-x-4">
          <Button asChild size="lg">
            <Link href="/auth/register">Comenzar ahora</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Ya tengo cuenta</Link>
          </Button>
        </div>
      </section>

      {/* Características */}
      <section className="container mx-auto py-16 px-6">
        <h3 className="text-3xl font-bold text-center mb-8">¿Por qué elegir Fixie?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
            <h4 className="text-xl font-semibold">Seguridad y Fiabilidad</h4>
            <p className="text-gray-600 mt-2">
              Tus datos están protegidos con la mejor tecnología en la nube.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h4 className="text-xl font-semibold">Gestión de Clientes</h4>
            <p className="text-gray-600 mt-2">
              Administra y comunica con tus clientes de forma eficiente.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <Settings className="h-12 w-12 text-primary mx-auto mb-4" />
            <h4 className="text-xl font-semibold">Control Total</h4>
            <p className="text-gray-600 mt-2">
              Maneja órdenes, inventario y empleados desde un solo lugar.
            </p>
          </div>
        </div>
      </section>

      {/* Llamado a la acción */}
      <section className="text-center py-16 bg-primary text-white">
        <h3 className="text-3xl font-bold">¡Empieza a gestionar tu negocio con Fixie!</h3>
        <p className="mt-4 text-lg">Regístrate gratis y lleva tu negocio al siguiente nivel.</p>
        <div className="mt-6">
          <Button asChild size="lg" variant="secondary">
            <Link href="/auth/register">Regístrate ahora</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-800 text-white text-center">
        <p>&copy; {new Date().getFullYear()} Fixie. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
