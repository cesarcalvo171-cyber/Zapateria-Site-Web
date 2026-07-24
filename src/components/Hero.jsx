import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hero({ heroSettings = {}, productsList = [], onOpenDetail, onAddToCart }) {
  const featuredProducts = productsList.filter(p => p.is_featured === true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play / slider automático cada 5 segundos si hay más de 1 producto destacado
  useEffect(() => {
    if (featuredProducts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredProducts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  const activeProduct = featuredProducts[currentIndex] || null;

  const handleNext = () => {
    if (featuredProducts.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const handlePrev = () => {
    if (featuredProducts.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  return (
    <section className="relative overflow-hidden bg-[#3CA9E5] text-white py-16 md:py-24">
      {/* Fondo tipográfico decorativo */}
      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
        <span className="text-[18vw] font-black text-white/10 uppercase tracking-widest leading-none">
          SNEAKERS
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LADO IZQUIERDO: Texto del Hero y CTA */}
          <div className={`space-y-6 text-left ${featuredProducts.length > 0 ? 'lg:col-span-6' : 'lg:col-span-12 text-center max-w-3xl mx-auto'}`}>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.4em] text-white/70">
              Colección Oficial
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase leading-tight drop-shadow-xl">
              {heroSettings.hero_title || 'ENCUENTRA TU CALZADO IDEAL'}
            </h1>
            <p className="text-white/80 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-xl">
              {heroSettings.hero_subtitle || 'Estilo, comodidad y calidad en cada paso. Explora nuestra colección de calzado para toda la familia.'}
            </p>
            
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#catalog"
                className="inline-block bg-white text-[#3CA9E5] font-black text-xs sm:text-sm uppercase tracking-widest px-8 py-3.5 hover:bg-zinc-100 transition-all shadow-lg rounded-2xl active:scale-95"
              >
                {heroSettings.hero_cta || 'Explorar Colección'}
              </a>
            </div>
          </div>

          {/* LADO DERECHO: Tarjeta de Producto Destacado / Carrusel */}
          {featuredProducts.length > 0 && activeProduct && (
            <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
              <div className="w-full max-w-md relative">
                
                {/* Indicador Badge 'DESTACADO' */}
                <div className="absolute top-4 left-4 z-20 bg-amber-400 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  Destacado
                </div>

                {/* Precio Tag */}
                <div className="absolute top-4 right-4 z-20 bg-white text-zinc-950 text-sm sm:text-base font-black px-4 py-1.5 rounded-full shadow-lg">
                  ${(activeProduct.price ?? 0).toFixed(2)}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProduct.id}
                    initial={{ opacity: 0, x: 50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
                  >
                    {/* Imagen del Calzado */}
                    <div
                      className="w-full h-64 sm:h-72 flex items-center justify-center cursor-pointer my-2 group"
                      onClick={() => onOpenDetail && onOpenDetail(activeProduct)}
                    >
                      {activeProduct.product_variants?.[0]?.image_url || activeProduct.image ? (
                        <img
                          src={activeProduct.product_variants?.[0]?.image_url || activeProduct.image}
                          alt={activeProduct.name}
                          className="max-h-full max-w-full object-contain transform -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                        />
                      ) : (
                        <span className="text-6xl">👟</span>
                      )}
                    </div>

                    {/* Información del Producto */}
                    <div className="space-y-1 w-full text-left">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">
                        {activeProduct.category || 'Calzado'} {activeProduct.brand ? `• ${activeProduct.brand}` : ''}
                      </span>
                      <h3 className="text-2xl font-black uppercase tracking-wide truncate">
                        {activeProduct.name}
                      </h3>
                    </div>

                    {/* Botón Ver Detalles / Comprar */}
                    <button
                      onClick={() => onOpenDetail && onOpenDetail(activeProduct)}
                      className="mt-5 w-full py-3.5 bg-white text-zinc-950 hover:bg-zinc-100 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={15} />
                      Ver Producto
                    </button>
                  </motion.div>
                </AnimatePresence>

                {/* Controles de Navegación del Carrusel si hay múltiples destacados */}
                {featuredProducts.length > 1 && (
                  <div className="flex items-center justify-between mt-4 px-2">
                    <div className="flex gap-1.5 items-center">
                      {featuredProducts.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Ir a producto destacado ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePrev}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer active:scale-90"
                        aria-label="Anterior destacado"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={handleNext}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer active:scale-90"
                        aria-label="Siguiente destacado"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

