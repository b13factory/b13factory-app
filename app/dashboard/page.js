'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { LogOut, Loader2, Package, ShoppingCart, TrendingUp, Users } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Cek session lebih stabil daripada getUser langsung
        const { data: sessionData, error } = await supabase.auth.getSession()
        if (error) throw error

        let session = sessionData?.session
        let currentUser = session?.user

        // Jika session belum ada, coba polling singkat (karena penulisan cookie mungkin delay)
        if (!session || !currentUser) {
          let tries = 0
          while (tries < 8 && (!session || !currentUser)) {
            await new Promise((r) => setTimeout(r, 300))
            const { data: s2 } = await supabase.auth.getSession()
            session = s2?.session
            currentUser = session?.user
            tries++
          }
        }

        if (!session || !currentUser) {
          // Tidak ada session: redirect ke login
          router.push('/')
          return
        }

        setUser(currentUser)
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">B13</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">B13 Garment</h1>
                <p className="text-xs text-muted-foreground">Sistem Manajemen Internal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-foreground font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-border hover:bg-accent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Selamat datang di sistem manajemen B13 Garment</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border hover:border-primary transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Orderan</p>
                  <p className="text-3xl font-bold text-foreground">0</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Katalog Produk</p>
                  <p className="text-3xl font-bold text-foreground">0</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pendapatan</p>
                  <p className="text-3xl font-bold text-foreground">Rp 0</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pelanggan</p>
                  <p className="text-3xl font-bold text-foreground">0</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Menu Utama</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start border-border hover:bg-accent" disabled>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Orderan Baru
              </Button>
              <Button variant="outline" className="w-full justify-start border-border hover:bg-accent" disabled>
                <Package className="h-4 w-4 mr-2" />
                Katalog Bahan
              </Button>
              <Button variant="outline" className="w-full justify-start border-border hover:bg-accent" disabled>
                <TrendingUp className="h-4 w-4 mr-2" />
                History & Neraca
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Orderan Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Belum ada orderan</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
