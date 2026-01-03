'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBasket, ChefHat, Wallet, TrendingUp, Users, ArrowRight, Sparkles, ScanBarcode, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden relative">

      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer hover:opacity-90 transition-opacity">
            <div className="relative w-10 h-10 shadow-lg shadow-emerald-200 rounded-xl overflow-hidden hover:scale-105 transition-transform">
              <Image
                src="/icon-192x192.png"
                alt="ShopMate Logo"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              ShopMate
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
              Iniciar Sesión
            </Link>
            <Link
              href="/login?mode=signup"
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-300/50"
            >
              Empezar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-6 text-center max-w-5xl mx-auto z-10">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-emerald-100 text-emerald-800 text-xs font-bold mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 hover:scale-105 transition-transform cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Nueva función: Cartera Digital y Escáner 📸
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-tight">
          Tu compra, <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 animate-gradient-x">
            más inteligente.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 font-medium">
          La app definitiva para organizar tu hogar. Listas compartidas, control de despensa y billetera de fidelidad en un solo lugar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200/50 hover:shadow-2xl hover:bg-emerald-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
          >
            <Sparkles size={20} className="text-yellow-200" />
            Crear mi primera lista
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-white hover:shadow-lg transition-all"
          >
            Descubrir más
          </a>
        </div>
      </header>

      {/* Hero Visual Mockup */}
      <div className="relative max-w-4xl mx-auto mt-0 -mb-20 px-4 z-0 perspective-1000 animate-in fade-in zoom-in-95 duration-1000 delay-500">
        <div className="relative bg-white rounded-3xl p-2 shadow-2xl shadow-emerald-900/10 border border-slate-200 transform md:rotate-x-12 md:hover:rotate-x-0 transition-transform duration-700 ease-out">
          <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 aspect-[16/9] md:aspect-[21/9] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>

            {/* Simulated UI Cards */}
            <div className="flex gap-4 md:gap-8 items-end transform translate-y-10">
              <div className="w-48 bg-white p-4 rounded-xl shadow-lg border border-slate-100 animate-bounce delay-100">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-2"><Wallet size={16} /></div>
                <div className="h-2 w-20 bg-slate-100 rounded mb-1"></div>
                <div className="h-2 w-12 bg-slate-100 rounded"></div>
              </div>
              <div className="w-56 bg-white p-4 rounded-xl shadow-xl border border-emerald-100 -mb-8 z-10 animate-bounce">
                <div className="flex justify-between mb-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><ShoppingBasket size={16} /></div>
                  <div className="w-16 h-6 bg-emerald-50 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-slate-200" /><div className="h-2 w-32 bg-slate-100 rounded" /></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-slate-200 bg-emerald-500 border-none" /><div className="h-2 w-24 bg-slate-100 rounded opacity-50 line-through" /></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-slate-200" /><div className="h-2 w-28 bg-slate-100 rounded" /></div>
                </div>
              </div>
              <div className="w-48 bg-white p-4 rounded-xl shadow-lg border border-slate-100 animate-bounce delay-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2"><TrendingUp size={16} /></div>
                <div className="h-2 w-24 bg-slate-100 rounded mb-1"></div>
                <div className="h-2 w-16 bg-slate-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-[2.5rem] blur-3xl opacity-20 -z-10"></div>
      </div>


      {/* Features Grid */}
      <div id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-32 mt-10">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-slate-900">
          Todo lo que necesitas, <br />
          <span className="text-emerald-500">sin complicaciones.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="group bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">100% Colaborativo</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              Invita a tu pareja o roomies. Los cambios se sincronizan al instante en todos los dispositivos. Adiós al "¿qué faltaba?".
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Compras Inteligentes</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              Items frecuentes, categorías automáticas y precios recordados. La app aprende de ti para que escribas menos.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
              <Wallet size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Cartera & Presupuesto</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              Digitaliza tus tarjetas de fidelidad y establece límites de gasto. Ahorra tiempo en caja y dinero en tu bolsillo.
            </p>
          </div>

          {/* Big Feature: Scanner */}
          <div className="md:col-span-3 group bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
            <div className="absolute top-0 right-0 p-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/30 transition-colors"></div>

            <div className="flex-1 relative z-10 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600 text-emerald-400 text-xs font-bold mb-6">
                <Zap size={12} className="fill-current" />
                Ultra Rápido
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Escanea y Agrega</h3>
              <p className="text-slate-300 text-lg mb-8 max-w-lg">
                ¿Se acabó la leche? Escanea el código de barras y agrégalo a la lista en segundos. O usa el dictado por voz si tienes las manos ocupadas.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors">
                <ScanBarcode size={20} />
                Probar Escáner
              </Link>
            </div>

            <div className="flex-1 flex justify-center relative">
              <div className="relative w-64 h-48 bg-white rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-500 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
                <ScanBarcode className="text-slate-900 w-24 h-24 opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 animate-[pulse_2s_infinite]"></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 text-center text-slate-400 text-sm relative z-10 bg-white/50 backdrop-blur-sm border-t border-slate-100">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
            <ShoppingBasket size={18} />
          </div>
          <span className="font-bold text-slate-600 text-lg">ShopMate</span>
        </div>
        <p>© 2026 ShopMate App. Hecho con ❤️ para organizarte mejor.</p>
      </footer>
    </div>
  );
}

