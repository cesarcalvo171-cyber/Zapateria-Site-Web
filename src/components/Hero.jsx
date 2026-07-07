import React, { useState, useEffect } from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function Hero({ onExploreClick, featuredProducts = [], settings = {}, onOpenDetail }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);

  const hasFeatured = featuredProducts && featuredProducts.length > 0;

  // Auto-play slideshow every 5 seconds unless user interacts
  useEffect(() => {
    if (!hasFeatured || featuredProducts.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % featuredProducts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredProducts, hasFeatured]);

  // Reset variant index and size when product changes
  useEffect(() => {
    setActiveVariantIdx(0);
    if (hasFeatured && featuredProducts[currentIdx]) {
      const sizes = featuredProducts[currentIdx].product_variants?.[0]?.sizes || featuredProducts[currentIdx].sizes || [];
      setSelectedSize(sizes[0] || 'Única');
    }
  }, [currentIdx, featuredProducts, hasFeatured]);

  // Determine active product & image
  const activeProduct = hasFeatured ? featuredProducts[currentIdx] : null;
  const activeVariant = activeProduct?.product_variants?.[activeVariantIdx] || activeProduct?.product_variants?.[0] || null;
  
  const displayImage = activeVariant?.image_url || activeProduct?.image || '/images/air_max_speed_turf.png';
  const availableSizes = activeVariant?.sizes || activeProduct?.sizes || ['40', '41', '42', '43'];
  const colorsList = activeProduct?.product_variants || [];

  if (!activeProduct) {
    return (
      <section className="relative h-[400px] bg-[#3CA9E5] flex items-center justify-center text-white">
        <h2 className="text-xl font-bold uppercase tracking-widest">Encuentra Tu Calzado Perfecto</h2>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-[#3CA9E5] text-white transition-colors duration-500 py-12 md:py-20">
      {/* Giant Outline Brand Text behind shoe */}
      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0">
        <h1 className="text-[14vw] font-black text-white/10 uppercase tracking-widest font-sans select-none leading-none">
          NIKE
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[500px]">
          
          {/* Column 1: Thumbnails for product selection (3 cols) */}
          <div className="lg:col-span-2 flex lg:flex-col flex-row gap-4 items-center justify-center order-3 lg:order-1 mt-6 lg:mt-0">
            <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Destacados</span>
            <div className="flex lg:flex-col flex-row gap-3 overflow-x-auto py-2">
              {featuredProducts.map((prod, idx) => {
                const thumbnailImg = prod.product_variants?.[0]?.image_url || prod.image;
                return (
                  <button
                    key={prod.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-20 h-20 p-2 border-2 rounded-xl transition-all flex-shrink-0 cursor-pointer bg-white/5 hover:bg-white/10 flex items-center justify-center ${
                      currentIdx === idx ? 'border-white scale-110 shadow-lg' : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <img src={thumbnailImg} alt={prod.name} className="max-w-full max-h-full object-contain" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: Large main shoe image (5 cols) */}
          <div className="lg:col-span-5 relative flex justify-center items-center h-[300px] sm:h-[400px] order-1 lg:order-2">
            <div className="absolute w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
            <img
              src={displayImage}
              alt={activeProduct.name}
              className="relative z-10 w-full h-full max-w-md object-contain transform hover:scale-105 transition-transform duration-700 drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] cursor-pointer rotate-[-10deg]"
              onClick={() => onOpenDetail && onOpenDetail(activeProduct)}
            />
          </div>

          {/* Column 3: Featured Details & Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-5 text-left order-2 lg:order-3 bg-black/10 backdrop-blur-sm lg:bg-transparent p-6 sm:p-8 lg:p-0 rounded-2xl">
            <div className="space-y-2">
              <span className="inline-block bg-white/20 text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest rounded-full">
                {activeProduct.category}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-wide leading-tight uppercase">
                {activeProduct.name}
              </h1>
              <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-baseline gap-2">
                <span>${activeProduct.price.toFixed(2)} USD</span>
                {activeProduct.originalPrice && (
                  <span className="text-sm font-light line-through text-white/50">${activeProduct.originalPrice.toFixed(2)}</span>
                )}
              </div>
            </div>
            
            <p className="text-white/80 text-xs sm:text-sm font-light leading-relaxed max-w-md">
              {activeProduct.description}
            </p>

            {/* Colors selection */}
            {colorsList.length > 1 && (
              <div className="space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-white/60">Color</span>
                <div className="flex gap-2">
                  {colorsList.map((col, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => setActiveVariantIdx(cIdx)}
                      className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 cursor-pointer ${
                        activeVariantIdx === cIdx ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col.color_hex || '#fff' }}
                      title={col.color_name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes selection */}
            {availableSizes.length > 0 && (
              <div className="space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-white/60">Tallas Disponibles</span>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 rounded-full border text-xs font-bold uppercase flex items-center justify-center transition-all cursor-pointer ${
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

            <div className="pt-4 flex gap-4">
              <button
                onClick={() => onOpenDetail && onOpenDetail(activeProduct)}
                className="flex-grow sm:flex-grow-0 group relative inline-flex items-center justify-center gap-3 bg-white text-black hover:bg-zinc-150 px-8 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-xl cursor-pointer active:scale-95"
              >
                <ShoppingBag size={14} />
                Comprar Calzado
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
