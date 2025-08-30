import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Color variant type
export type ColorVariant = {
  name: string
  hex: string
  images: string[]
  is_sold_out?: boolean
  stock_quantity?: number | null
}

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          image_url: string
          images: string[] | null
          has_color_variants: boolean
          colors: ColorVariant[] | null
          is_sold_out: boolean
          stock_quantity: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          image_url: string
          images?: string[] | null
          has_color_variants?: boolean
          colors?: ColorVariant[] | null
          is_sold_out?: boolean
          stock_quantity?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          image_url?: string
          images?: string[] | null
          has_color_variants?: boolean
          colors?: ColorVariant[] | null
          is_sold_out?: boolean
          stock_quantity?: number | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          tracking_number: string
          customer_name: string
          phone: string
          address: string
          product_id: string
          selected_color: string | null
          status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          tracking_number?: string
          customer_name: string
          phone: string
          address: string
          product_id: string
          selected_color?: string | null
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          tracking_number?: string
          customer_name?: string
          phone?: string
          address?: string
          product_id?: string
          selected_color?: string | null
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          created_at?: string
        }
      }
    }
  }
}
