import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

export default function Hero({ featuredProducts = [], onOpenDetail }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);

  const hasFeatured = featuredProducts && featuredProducts.length > 0;

  // Auto-play slideshow every 5 seconds
  useEffect(() => {
    if (!hasFeatured || featuredProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % featuredProducts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredProducts, hasFeatured]);

  // Reset cuando cambia de producto
  useEffect(() => {
    setActiveVariantIdx(0);
    if (hasFeatured && featuredProducts[currentIdx]) {
      const sizes = featuredProducts[currentIdx].product_variants?.[0]?.sizes
        || featuredProducts[currentIdx].sizes || [];
      setSelectedSize(sizes[0] || null);
    }
  }, [currentIdx, featuredProducts, hasFeatured]);

  const activeProduct = hasFeatured ? featuredProducts[currentIdx] : null;
  const activeVariant = activeProduct?.product_variants?.[activeVariantIdx]
    || activeProduct?.product_variants?.[0]
    || null;

  const displayImage = activeVariant?.image_url || activeProduct?.image || null;
  const availableSizes = activeVariant?.sizes || activeProduct?.sizes || [];
  const colorsList = activeProduct?.product_variants || [];

  // ── Sin productos destacados: Banner de bienvenida ──────────────────────
  if (!activeProduct) {
    return (
      <section className="relative overflow-hidden bg-[#3CA9E5] text-white py-24 md:py-32">
        {/* Fondo tipográfico */}
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
          <span className="text-[18vw] font-black text-white/10 uppercase tracking-widest leading-none">
            SNEAKERS
          </span>
        </div>
        <div className="relative z-10 text-center px-4 space-y-5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.4em] text-white/60">
            Bienvenido a
          </p>
          <h1 className="text-5xl sm:text-8xl font-black uppercase leading-tight drop-shadow-xl">
            Tu Zapatería
          </h1>
          <p className="text-white/75 text-sm sm:text-base font-light max-w-lg mx-auto leading-relaxed">
            Sube tus primeros productos desde el panel de administración y márcalos
            como <strong>Destacados</strong> para activar este carrusel.
          </p>
        </div>
      </section>
    );
  }

  // ── Con productos destacados: Hero interactivo ───────────────────────────
  return (
    <section className="relative overflow-hidden bg-[#3CA9E5] text-white py-12 md:py-20">
      {/* Fondo tipográfico */}
      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0">
        <span className="text-[14vw] font-black text-white/10 uppercase tracking-widest leading-none">
          NIKE
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[500px]">

          {/* Col 1: Miniaturas (selector de producto) */}
          <div className="lg:col-span-2 flex lg:flex-col flex-row gap-4 items-center justify-center order-3 lg:order-1 mt-6 lg:mt-0">
            <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
              Destacados
            </span>
            <div className="flex lg:flex-col flex-row gap-3 overflow-x-auto py-2">
              {featuredProducts.map((prod, idx) => {
                const thumbImg = prod.product_variants?.[0]?.image_url || prod.image;
                return (
                  <button
                    key={prod.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-20 h-20 p-2 border-2 rounded-xl transition-all flex-shrink-0 cursor-pointer bg-white/5 hover:bg-white/10 flex items-center justify-center ${
                      currentIdx === idx
                        ? 'border-white scale-110 shadow-lg'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    {thumbImg
                      ? <img src={thumbImg} alt={prod.name} className="max-w-full max-h-full object-contain" />
                      : <span className="text-3xl">👟</span>
                    }
                  </button>
                );
              })}
            </div>
          </div>

          {/* Col 2: Imagen principal */}
          <div className="lg:col-span-5 relative flex justify-center items-center h-[300px] sm:h-[400px] order-1 lg:order-2">
            <div className="absolute w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-white/10 rounded-full blur-[80px] pointer-events-none" />
            {displayImage
              ? (
                <img
                  src={displayImage}
                  alt={activeProduct.name}
                  className="relative z-10 w-full h-full max-w-md object-contain transform hover:scale-105 transition-transform duration-700 drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] cursor-pointer rotate-[-10deg]"
                  onClick={() => onOpenDetail && onOpenDetail(activeProduct)}
                />
              )
              : (
                <div
                  className="relative z-10 w-48 h-48 flex items-center justify-center cursor-pointer"
                  onClick={() => onOpenDetail && onOpenDetail(activeProduct)}
                >
                  <span className="text-[7rem]">👟</span>
                </div>
              )
            }
          </div>

          {/* Col 3: Información del producto */}
          <div className="lg:col-span-5 space-y-5 text-left order-2 lg:order-3 bg-black/10 backdrop-blur-sm lg:bg-transparent p-6 sm:p-8 lg:p-0 rounded-2xl">
            <div className="space-y-2">
              {activeProduct.category && (
                <span className="inline-block bg-white/20 text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest rounded-full">
                  {activeProduct.category}
                  {activeProduct.subcategory ? ` · ${activeProduct.subcategory}` : ''}
                </span>
              )}
              <h2 className="text-3xl sm:text-5xl font-black tracking-wide leading-tight uppercase">
                {activeProduct.name}
              </h2>
              <div className="text-2xl sm:text-3xl font-extrabold flex items-baseline gap-2">
                <span>${Number(activeProduct.price).toFixed(2)} USD</span>
                {activeProduct.original_price && (
                  <span className="text-sm font-light line-through text-white/50">
                    ${Number(activeProduct.original_price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {activeProduct.description && (
              <p className="text-white/80 text-xs sm:text-sm font-light leading-relaxed max-w-md line-clamp-3">
                {activeProduct.description}
              </p>
            )}

            {/* Selector de color */}
            {colorsList.length > 1 && (
              <div className="space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-white/60">Color</span>
                <div className="flex gap-2 flex-wrap">
                  {colorsList.map((col, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => setActiveVariantIdx(cIdx)}
                      className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 cursor-pointer ${
                        activeVariantIdx === cIdx
                          ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col.color_hex || '#fff' }}
                      title={col.color_name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Selector de talla */}
            {availableSizes.length > 0 && (
              <div className="space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Talla
                </span>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 rounded-full border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-white text-[#3CA9E5] border-white scale-110 shadow-md font-extrabold'
                          : 'border-white/30 text-white hover:border-white hover:bg-white/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={() => onOpenDetail && onOpenDetail(activeProduct)}
                className="group inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-xl cursor-pointer active:scale-95 hover:bg-zinc-100"
              >
                <ShoppingBag size={14} />
                Ver Producto
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
