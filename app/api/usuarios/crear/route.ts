// app/api/usuarios/crear/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      nombre,
      correo,
      rol,
      telefono,
      direccion,
      fecha_contratacion,
      notas,
      empresa_id,
    } = body

    // 1. Crear usuario en Supabase Auth y enviar invitación
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: correo,
      email_confirm: true, // ✅ Supabase enviará un email de confirmación automáticamente
      user_metadata: {
        nombre,
        rol,
      },
      app_metadata: {
        empresa_id,
      },
    })
    if (authError) throw authError



    // 2. Insertar en tabla `usuarios`
    const { error: errorDB } = await supabase.from("usuarios").insert({
      id: authUser.user.id,
      nombre,
      correo,
      rol,
      telefono,
      direccion,
      fecha_contratacion,
      notas,
      empresa_id,
      estado: "activo",
    })

    if (errorDB) throw errorDB

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error en API usuarios/crear:", error)
    return NextResponse.json({ error: error.message || "Error inesperado" }, { status: 500 })
  }
}
