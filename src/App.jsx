import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import CartDrawer from './components/CartDrawer'
import FloatingCart from './components/FloatingCart'
import { CartProvider } from './context/CartContext'
import Store from './pages/Store'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-50 flex flex-col">
          <Routes>
            {/* Public Store Layout */}
            <Route path="/" element={
              <>
                <Header />
                <main className="flex-1">
                  <Store />
                </main>
                <footer className="bg-zinc-900 text-white py-12 border-t border-zinc-800">
                  <div className="container mx-auto px-4 text-center md:text-left">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                      <div>
                        <h4 className="text-secondary font-bold text-lg mb-4 uppercase tracking-wider">Pizzaria Ramos</h4>
                        <p className="text-zinc-400 text-sm">
                          A melhor pizza da região com o tempero que você ama. Qualidade e rapidez na sua entrega.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-zinc-200 font-bold mb-4 uppercase tracking-wider text-sm">Contato</h4>
                        <p className="text-zinc-400 text-sm">WhatsApp: (86) 99447-1909</p>
                        <p className="text-zinc-400 text-sm">Endereço: Novo Amarante</p>
                      </div>
                      <div>
                        <h4 className="text-zinc-200 font-bold mb-4 uppercase tracking-wider text-sm">Horário</h4>
                        <p className="text-zinc-400 text-sm">Terça a Domingo</p>
                        <p className="text-zinc-400 text-sm">18:00 às 23:30</p>
                      </div>
                    </div>
                    <div className="border-t border-zinc-800 pt-8 text-center text-zinc-500 text-xs">
                      &copy; 2026 Pizzaria Ramos. Todos os direitos reservados.
                    </div>
                  </div>
                </footer>
                <CartDrawer />
                <FloatingCart />
              </>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
