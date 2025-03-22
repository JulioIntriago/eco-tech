export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          nombre: string
          correo: string
          rol: "admin" | "tecnico" | "vendedor"
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          correo: string
          rol?: "admin" | "tecnico" | "vendedor"
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          correo?: string
          rol?: "admin" | "tecnico" | "vendedor"
          created_at?: string
        }
      }
      clientes: {
        Row: {
          id: string
          nombre: string
          telefono: string
          correo: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          telefono: string
          correo?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          telefono?: string
          correo?: string | null
          created_at?: string
        }
      }
      ordenes_trabajo: {
        Row: {
          id: string
          cliente_id: string
          dispositivo: string
          problema: string
          estado: "pendiente" | "en_proceso" | "finalizado" | "entregado"
          fecha_ingreso: string
          fecha_entrega: string | null
          costo_estimado: number
          tecnico_asignado: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          dispositivo: string
          problema: string
          estado?: "pendiente" | "en_proceso" | "finalizado" | "entregado"
          fecha_ingreso?: string
          fecha_entrega?: string | null
          costo_estimado: number
          tecnico_asignado?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          dispositivo?: string
          problema?: string
          estado?: "pendiente" | "en_proceso" | "finalizado" | "entregado"
          fecha_ingreso?: string
          fecha_entrega?: string | null
          costo_estimado?: number
          tecnico_asignado?: string | null
          created_at?: string
        }
      }
      inventario: {
        Row: {
          id: string
          nombre: string
          categoria: string
          precio: number
          cantidad: number
          proveedor_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          categoria: string
          precio: number
          cantidad: number
          proveedor_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          categoria?: string
          precio?: number
          cantidad?: number
          proveedor_id?: string | null
          created_at?: string
        }
      }
      ventas: {
        Row: {
          id: string
          cliente_id: string | null
          total: number
          fecha: string
          metodo_pago: string
          created_at: string
        }
        Insert: {
          id?: string
          cliente_id?: string | null
          total: number
          fecha?: string
          metodo_pago: string
          created_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string | null
          total?: number
          fecha?: string
          metodo_pago?: string
          created_at?: string
        }
      }
      ventas_detalle: {
        Row: {
          id: string
          venta_id: string
          producto_id: string
          cantidad: number
          precio_unitario: number
          created_at: string
        }
        Insert: {
          id?: string
          venta_id: string
          producto_id: string
          cantidad: number
          precio_unitario: number
          created_at?: string
        }
        Update: {
          id?: string
          venta_id?: string
          producto_id?: string
          cantidad?: number
          precio_unitario?: number
          created_at?: string
        }
      }
    }
  }
}

