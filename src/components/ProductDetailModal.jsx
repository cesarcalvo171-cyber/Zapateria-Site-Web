import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';



export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  isAdmin = false
}) {
  if (!product || !isOpen) return null;

  const { name, price, category, description, rating, reviewsCount, details } = product;

  // Handle Supabase structure vs static fallback
  const variants = product.product_variants || [];
  const hasVariants = variants.length > 0;

  // Track active variant
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const activeVariant = hasVariants ? variants[activeVariantIdx] : null;

  // Selectable lists
  const colorsList = hasVariants 
    ? variants.map(v => ({ name: v.color_name, hex: v.color_hex }))
    : (product.colors || []);

  const availableSizes = activeVariant ? activeVariant.sizes : (product.sizes || []);

  // Internal states
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  // Sync states when active variant or product changes
  useEffect(() => {
    if (hasVariants) {
      setSelectedColorIdx(activeVariantIdx);
      const sizes = variants[activeVariantIdx]?.sizes || [];
      setSelectedSize(sizes[0] || '');
    } else {
      setSelectedSize(product.sizes?.[0] || 'Única');
    }
    setQuantity(1);
  }, [product, activeVariantIdx]);

  // Adjust active variant index when user selects a color dot
  const handleColorSelect = (idx) => {
    setSelectedColorIdx(idx);
    if (hasVariants) {
      setActiveVariantIdx(idx);
    }
  };

  const currentStock = hasVariants && activeVariant?.stock_by_size 
    ? (activeVariant.stock_by_size[selectedSize] ?? 0)
    : 999; // Default if no stock tracking

  // Reset quantity if it exceeds new stock when changing sizes
  useEffect(() => {
    if (quantity > currentStock && currentStock > 0) {
      setQuantity(currentStock);
    } else if (currentStock === 0) {
      setQuantity(1); // will be disabled anyway
    }
  }, [selectedSize, currentStock]);

  const incrementQty = () => {
    if (quantity < currentStock) setQuantity(prev => prev + 1);
  };
  const decrementQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    const selectedColorObj = hasVariants 
      ? { name: variants[selectedColorIdx].color_name, hex: variants[selectedColorIdx].color_hex }
      : (product.colors ? product.colors[selectedColorIdx] : null);

    onAddToCart(product, quantity, selectedSize, selectedColorObj);
    
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 2000);
  };

  // Resolve size-specific price
  const originalPriceVal = product.originalPrice || product.original_price;
  const resolvedPrice = activeVariant?.price_by_size?.[selectedSize] !== undefined
    ? Number(activeVariant.price_by_size[selectedSize])
    : Number(price);

  const resolvedOriginalPrice = activeVariant?.original_price_by_size?.[selectedSize] !== undefined && activeVariant.original_price_by_size[selectedSize] !== null
    ? (activeVariant.original_price_by_size[selectedSize] ? Number(activeVariant.original_price_by_size[selectedSize]) : null)
    : (originalPriceVal ? Number(originalPriceVal) : null);

  // Discount calculation
  const discount = resolvedOriginalPrice ? Math.round(((resolvedOriginalPrice - resolvedPrice) / resolvedOriginalPrice) * 100) : 0;

  // Image to display
  const displayImage = activeVariant ? activeVariant.image_url : (product.image || '/images/air_max_speed_turf.png');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
        />

        {/* Modal content container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-[#FAF9F6] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-zinc-100 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl rounded-none flex flex-col md:flex-row z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-zinc-800/80 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 z-20 cursor-pointer transition-all"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {/* Left Column: Image Gallery Showcase */}
          <div className="w-full md:w-1/2 relative bg-zinc-100 dark:bg-zinc-950 aspect-[4/5] md:aspect-auto">
            {discount > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-rose-500 text-[#FAF9F6] text-xs font-bold px-2.5 py-1 tracking-wider uppercase">
                Ahorra {discount}%
              </span>
            )}
            <img
              src={displayImage}
              alt={name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Right Column: Information & Options */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              
              {/* Category */}
              <div className="flex justify-between items-center text-xs font-semibold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
                <span>{category}</span>
              </div>

              {/* Title & Price */}
              <div className="space-y-2 text-left">
                <h2 className="text-xl sm:text-2xl font-light tracking-wide text-zinc-950 dark:text-white uppercase leading-snug">
                  {name}
                </h2>
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-2xl font-bold text-[#D4AF37]">
                    ${resolvedPrice.toFixed(2)}
                  </span>
                  {resolvedOriginalPrice && (
                    <span className="text-base text-zinc-500 line-through font-light">
                      ${resolvedOriginalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Product description */}
              <p className="text-sm font-light leading-relaxed text-zinc-600 dark:text-zinc-400 text-left">
                {description}
              </p>

              {/* Options selection */}
              <div className="space-y-4 text-left pt-4">
                
                {/* Colors Select */}
                {variants.length > 1 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
                      Variante: <span className="text-zinc-900 dark:text-white font-medium ml-1">{variants[selectedColorIdx]?.color_name || `Variante ${selectedColorIdx + 1}`}</span>
                    </span>
                    <div className="flex gap-2">
                      {variants.map((v, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleColorSelect(idx)}
                          className={`w-12 h-14 border bg-zinc-100 overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                            selectedColorIdx === idx
                              ? 'border-[#D4AF37] scale-105 ring-2 ring-[#D4AF37]/20'
                              : 'border-zinc-200 dark:border-zinc-800 hover:scale-102'
                          }`}
                          title={v.color_name || `Variante ${idx + 1}`}
                        >
                          <img src={v.image_url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes Select */}
                {availableSizes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
                      Talla: <span className="text-zinc-900 dark:text-white font-medium ml-1">{selectedSize}</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => {
                        const sizeStock = hasVariants && activeVariant?.stock_by_size ? (activeVariant.stock_by_size[size] ?? 0) : 999;
                        const isOutOfStock = sizeStock === 0;

                        return (
                          <button
                            key={size}
                            onClick={() => {
                              if (!isOutOfStock) setSelectedSize(size);
                            }}
                            disabled={isOutOfStock}
                            className={`min-w-10 h-10 border text-xs font-semibold uppercase tracking-wider flex items-center justify-center transition-all ${
                              selectedSize === size
                                ? 'bg-black border-black text-[#FAF9F6] dark:bg-white dark:border-white dark:text-zinc-950 font-bold'
                                : isOutOfStock
                                ? 'border-zinc-100 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 cursor-not-allowed line-through'
                                : 'border-zinc-200 dark:border-zinc-850 text-zinc-650 dark:text-zinc-400 hover:border-black dark:hover:border-white cursor-pointer'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock indicator badge */}
                {currentStock <= 3 && currentStock > 0 && (
                  <div className="inline-block mt-2 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-500 text-[10px] font-bold tracking-wider uppercase border border-amber-200 dark:border-amber-800/50">
                    ¡Se están agotando! Solo {currentStock} disponible{currentStock === 1 ? '' : 's'}
                  </div>
                )}
                {currentStock === 0 && (
                  <div className="inline-block mt-2 px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-500 text-[10px] font-bold tracking-wider uppercase border border-rose-200 dark:border-rose-800/50">
                    Agotado en esta talla
                  </div>
                )}
              </div>

              {/* Specs checklist details */}
              {details && details.length > 0 && (
                <div className="text-left pt-4 space-y-1.5">
                  <span className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase block mb-1">
                    Detalles del Producto
                  </span>
                  <ul className="list-disc list-inside text-xs font-light text-zinc-500 dark:text-zinc-400 space-y-1">
                    {details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quantity Selector & Add to Cart Action */}
            {!isAdmin && (
              <div className="mt-8 pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  
                  {/* Quantity adjustments */}
                  <div className="flex items-center border border-zinc-300 dark:border-zinc-700 bg-transparent">
                    <button
                      onClick={decrementQty}
                      className="p-3 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQty}
                      className="p-3 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={currentStock === 0}
                    className={`flex-1 text-xs font-semibold py-4 uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg transition-all ${
                      currentStock === 0 
                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed shadow-none'
                        : 'bg-[#0A0A0A] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#0A0A0A] hover:bg-zinc-800 dark:hover:bg-white cursor-pointer active:scale-[0.98]'
                    }`}
                  >
                    <ShoppingBag size={14} />
                    {currentStock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                  </button>

                  {/* Toggle favorite inside modal */}
                  <button
                    onClick={() => onToggleFavorite(product.id)}
                    className="p-3 border border-zinc-200 dark:border-zinc-850 text-zinc-650 dark:text-zinc-400 hover:text-rose-500 hover:border-rose-500 dark:hover:text-rose-400 dark:hover:border-rose-400 rounded-none cursor-pointer transition-all"
                    aria-label="Toggle favorite"
                  >
                    <Heart size={18} fill={isFavorite ? '#f43f5e' : 'none'} className={isFavorite ? 'text-rose-500' : ''} />
                  </button>
                </div>

                {/* Toast message inside modal */}
                <AnimatePresence>
                  {addedMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-250/30 dark:border-emerald-900/40 text-xs py-2 px-3 text-center font-medium"
                    >
                      ¡Agregado con éxito al carrito!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
