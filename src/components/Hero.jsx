import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Hero({ onExploreClick, featuredProducts = [], settings = {}, onOpenDetail }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const hasFeatured = featuredProducts && featuredProducts.length > 0;

  // Auto-play slideshow every 1.25 seconds
  useEffect(() => {
    if (!hasFeatured || featuredProducts.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % featuredProducts.length);
    }, 1250);

    return () => clearInterval(interval);
  }, [featuredProducts, hasFeatured]);

  // Reset index if featured products list changes length
  useEffect(() => {
    setCurrentIdx(0);
  }, [featuredProducts.length]);

  // Determine active product & image
  const activeProduct = hasFeatured ? featuredProducts[currentIdx] : null;
  const displayImage = activeProduct?.product_variants?.[0]?.image_url || activeProduct?.image || '/images/air_max_speed_turf.png';

  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pt-16 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left z-10 pl-4 lg:pl-0">
            <div className="space-y-6">
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-wide text-white leading-[1.1] uppercase">
               ENCUENTRA   <br/>
                <span className="italic font-serif text-[#FFC107]">TU ESTILO</span> 
              </h1>
            </div>
            
            <p className="text-zinc-400 text-sm sm:text-base font-light leading-relaxed max-w-md">
              Calzado premium que combina comodidad, diseño y rendimiento para cada paso de tu día.
            </p>
            
            <div className="pt-2">
              <button
                onClick={onExploreClick}
                className="group relative inline-flex items-center gap-3 bg-[#FFC107] hover:bg-[#FFD54F] text-black px-8 py-3.5 text-sm font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(255,193,7,0.2)] hover:shadow-[0_0_30px_rgba(255,193,7,0.4)] cursor-pointer"
              >
               Explora Nuestra coleccion
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Dummy logos below button */}
           
          </div>

          {/* Visual Showcase */}
          <div className="lg:col-span-6 relative flex justify-center items-center h-[500px]">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#FFC107]/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            {/* Image */}
            <img
              src={displayImage}
              alt={activeProduct ? activeProduct.name : 'Signature Scent'}
              className="relative z-10 w-full h-full max-w-sm object-contain object-center transform hover:scale-105 transition-transform duration-700 drop-shadow-2xl cursor-pointer"
              onClick={() => activeProduct && onOpenDetail && onOpenDetail(activeProduct)}
            />
          </div>
          
        </div>
      </div>
    </section>
  );
}
