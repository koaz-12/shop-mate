'use client';

import { useRouter } from 'next/navigation';
import { ShoppingBasket, ChefHat, Wallet, TrendingUp, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 rounded-lg p-1.5 text-white">
              <ShoppingBasket size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight">ShopMate</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors">
              Iniciar Sesión
            </Link>
            <Link
              href="/login?mode=signup"
              className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              Empezar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-8 border border-emerald-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Nueva función: Cartera Digital 💳
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Tu compra,<br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400"> más inteligente.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Olvídate de las notas de papel. Gestiona tu despensa, controla tu presupuesto y comparte listas con tu familia en tiempo real.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200 hover:shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 group"
          >
            Crear mi Lista
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all"
          >
            Ver características
          </a>
        </div>
      </header>

      {/* Features Graphics */}
      <div id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Colaborativo</h3>
            <p className="text-slate-500 leading-relaxed">
              Crea un hogar y añade a tu familia. Todos ven y editan la misma lista en tiempo real.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-24 bg-emerald-50/50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                <ChefHat size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Despensa y Stocks</h3>
              <p className="text-slate-500 leading-relaxed">
                Mueve ítems a la "Despensa" cuando los compras. ShopMate recuerda precios y cantidades.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Control de Gastos</h3>
            <p className="text-slate-500 leading-relaxed">
              Define un presupuesto mensual y visualiza cuánto llevas gastado antes de llegar a la caja.
            </p>
          </div>
          {/* Feature 4 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow md:col-span-3 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
                <Wallet size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Tu Cartera Digital</h3>
              <p className="text-slate-500 leading-relaxed text-lg">
                Guarda tus tarjetas de fidelidad y cupones. Escanea códigos de barras directamente desde la app y olvídate de los plásticos.
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-64 h-40 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl rotate-3 border-t border-white/20 p-6 flex flex-col justify-between group hover:rotate-0 transition-transform duration-500">
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 rounded-full bg-white/20" />
                  <Wallet className="text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-3/4 bg-white/10 rounded-full" />
                  <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 text-center text-slate-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ShoppingBasket size={16} />
          <span className="font-bold text-slate-500">ShopMate</span>
        </div>
        <p>© 2026 ShopMate App. Hecho con ❤️ para organizarte mejor.</p>
      </footer>
    </div>
  );
}
