import React, { useState } from 'react';
import { Heart, ShoppingBag, Trash2, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';



export default function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onOpenDetail,
  onAddToCart,
  isAdmin,
  onDelete,
  onEdit
}) {
  const { name, price, originalPrice, category, rating } = product;

  // Handle Supabase structure vs Fallback static data
  const variants = product.product_variants || [];
  const hasVariants = variants.length > 0;

  // Track active color variant index
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const activeVariant = hasVariants ? variants[activeVariantIdx] : null;

  // Active image & colors
  const displayImage = activeVariant ? activeVariant.image_url : (product.image || '/images/air_max_speed_turf.png');
  const colorsList = hasVariants 
    ? variants.map(v => ({ name: v.color_name, hex: v.color_hex }))
    : (product.colors || []);

  // Available sizes for the active variant
  const availableSizes = activeVariant ? activeVariant.sizes : (product.sizes || []);
  const [selectedSize, setSelectedSize] = useState(null);

  // Auto-select first size if none is selected
  const activeSize = selectedSize && availableSizes.includes(selectedSize)
    ? selectedSize 
    : (availableSizes[0] || 'Única');

  // Resolve size-specific price
  const resolvedPrice = activeVariant?.price_by_size?.[activeSize] !== undefined
    ? Number(activeVariant.price_by_size[activeSize])
    : Number(price);

  const resolvedOriginalPrice = activeVariant?.original_price_by_size?.[activeSize] !== undefined && activeVariant.original_price_by_size[activeSize] !== null
    ? (activeVariant.original_price_by_size[activeSize] ? Number(activeVariant.original_price_by_size[activeSize]) : null)
    : (originalPrice ? Number(originalPrice) : null);

  // Calculate discount percentage
  const discount = resolvedOriginalPrice ? Math.round(((resolvedOriginalPrice - resolvedPrice) / resolvedOriginalPrice) * 100) : 0;

  // Calculate total product stock
  const totalStock = hasVariants 
    ? variants.reduce((acc, variant) => {
        const sizesStock = Object.values(variant.stock_by_size || {}).reduce((sAcc, s) => sAcc + Number(s), 0);
        return acc + sizesStock;
      }, 0)
    : 999;
  const isCompletelyOut = hasVariants && totalStock === 0;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (isCompletelyOut) return;
    
    // Prepare the selected variant color details
    const selectedColorObj = hasVariants 
      ? { name: activeVariant.color_name, hex: activeVariant.color_hex }
      : (product.colors ? product.colors[0] : null);

    onAddToCart(product, 1, activeSize, selectedColorObj);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`group flex flex-col w-full relative bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 ${isCompletelyOut ? 'opacity-85 grayscale-[20%]' : ''}`}
    >
      {/* Image Showcase */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors rounded-xl flex items-center justify-center p-4">
        {/* Glow behind image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-[#3CA9E5]/5 blur-[40px] rounded-full pointer-events-none"></div>
        
        {/* Out of Stock Badge */}
        {isCompletelyOut ? (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-zinc-950/90 text-white text-[10px] font-bold px-4 py-2 uppercase tracking-[0.2em] shadow-lg backdrop-blur-sm whitespace-nowrap rotate-[-5deg]">
            Agotado
          </div>
        ) : discount > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-md">
            -{discount}%
          </span>
        )}

        {!isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            className="absolute top-3 right-3 z-30 p-2 bg-white dark:bg-zinc-900 text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:scale-110 active:scale-95 transition-all rounded-full shadow-sm cursor-pointer"
            aria-label="Add to favorites"
          >
            <Heart size={15} fill={isFavorite ? '#f43f5e' : 'none'} className={isFavorite ? 'text-rose-500' : ''} />
          </button>
        )}

        {/* Admin Actions Bar */}
        {isAdmin && (
          <div className="absolute top-3 right-3 z-30 flex gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="p-1.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center"
              title="Editar producto"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product.id);
              }}
              className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center"
              title="Eliminar producto"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}

        {/* Product Image */}
        <img
          src={displayImage}
          alt={name}
          className="relative z-10 max-h-full max-w-full object-contain p-2 transform group-hover:scale-110 group-hover:rotate-[-5deg] transition-all duration-500 ease-out cursor-pointer drop-shadow-lg"
          onClick={() => onOpenDetail(product)}
        />

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden sm:flex bg-black/5 backdrop-blur-[1px] z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(product);
            }}
            className="pointer-events-auto bg-zinc-950/90 hover:bg-black text-white text-[9px] font-bold py-2 px-5 uppercase tracking-[0.15em] rounded-full shadow-md cursor-pointer transition-all"
          >
            Vista Rápida
          </button>
        </div>
      </div>

      {/* Product Details Info */}
      <div className="mt-4 flex flex-col flex-grow text-left space-y-1">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#3CA9E5]">
          {category}
        </span>
        
        {/* Name & Desc */}
        <h3 
          onClick={() => onOpenDetail(product)}
          className="text-sm font-bold text-zinc-900 dark:text-white hover:text-[#3CA9E5] cursor-pointer line-clamp-1 transition-colors tracking-wide uppercase"
        >
          {name}
        </h3>
        
        {product.description && (
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-light">
            {product.description}
          </p>
        )}

        {/* Variants Selection Thumbnails */}
        {variants.length > 1 && (
          <div className="flex gap-1.5 py-1">
            {variants.map((v, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveVariantIdx(idx);
                }}
                className={`w-5 h-6 overflow-hidden border flex items-center justify-center transition-all cursor-pointer ${
                  activeVariantIdx === idx
                    ? 'border-[#3CA9E5] scale-115 ring-1 ring-[#3CA9E5]/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:scale-105'
                }`}
                title={v.color_name || `Variante ${idx + 1}`}
              >
                <img src={v.image_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Interactive Sizes selection bar directly on the card! */}
        <div className="flex flex-wrap gap-1 py-1">
          {availableSizes.map((size) => (
            <button
              key={size}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSize(size);
              }}
              className={`text-[8px] font-bold px-1.5 py-0.5 border cursor-pointer transition-all rounded ${
                activeSize === size
                  ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white font-extrabold'
                  : 'border-zinc-200 dark:border-zinc-850 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Price & Add to Cart button */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-zinc-100 dark:border-zinc-850">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-extrabold text-zinc-950 dark:text-white">
                ${resolvedPrice.toFixed(2)}
              </span>
              {resolvedOriginalPrice && (
                <span className="text-[10px] text-zinc-400 line-through">
                  ${resolvedOriginalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {!isAdmin && (
            <button
              onClick={handleQuickAdd}
              className="p-2 bg-zinc-950 text-white hover:bg-[#3CA9E5] hover:text-white rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center"
              aria-label="Add to cart"
            >
              <ShoppingBag size={13} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
