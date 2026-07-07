import React from 'react';

export default function Hero({ heroSettings = {} }) {
  return (
    <section className="relative overflow-hidden bg-[#3CA9E5] text-white py-24 md:py-32">
      {/* Fondo tipográfico decorativo */}
      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
        <span className="text-[18vw] font-black text-white/10 uppercase tracking-widest leading-none">
          SNEAKERS
        </span>
      </div>
      
      {/* Contenido de texto configurable desde el panel de admin */}
      <div className="relative z-10 text-center px-4 space-y-5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.4em] text-white/60">
          Colección Oficial
        </p>
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase leading-tight drop-shadow-xl max-w-4xl mx-auto">
          {heroSettings.hero_title || 'ENCUENTRA TU CALZADO IDEAL'}
        </h1>
        <p className="text-white/75 text-sm sm:text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed">
          {heroSettings.hero_subtitle || 'Estilo, comodidad y calidad en cada paso. Explora nuestra colección de calzado para toda la familia.'}
        </p>
        {heroSettings.hero_cta && (
          <div className="pt-4">
            <a
              href="#catalog"
              className="inline-block bg-white text-[#3CA9E5] font-black text-xs sm:text-sm uppercase tracking-widest px-8 py-3.5 hover:bg-zinc-100 transition-all shadow-lg rounded-2xl active:scale-95"
            >
              {heroSettings.hero_cta}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
