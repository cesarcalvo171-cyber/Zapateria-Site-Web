import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Plus, Minus } from 'lucide-react';
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
  console.log('ProductDetailModal Props:', { product, isOpen, isAdmin });
  if (!product || !isOpen) return null;

  const { name, price, category, description, details } = product;

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
    : 999; 

  // Reset quantity if it exceeds new stock when changing sizes
  useEffect(() => {
    if (quantity > currentStock && currentStock > 0) {
      setQuantity(currentStock);
    } else if (currentStock === 0) {
      setQuantity(1);
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
  const resolvedPrice = activeVariant?.price_by_size && selectedSize && activeVariant.price_by_size[selectedSize] !== undefined
    ? Number(activeVariant.price_by_size[selectedSize])
    : Number(price || 0);

  const resolvedOriginalPrice = activeVariant?.original_price_by_size && selectedSize && activeVariant.original_price_by_size[selectedSize] !== undefined && activeVariant.original_price_by_size[selectedSize] !== null
    ? Number(activeVariant.original_price_by_size[selectedSize])
    : (originalPriceVal ? Number(originalPriceVal) : null);

  // Discount calculation
  const discount = resolvedOriginalPrice ? Math.round(((resolvedOriginalPrice - resolvedPrice) / resolvedOriginalPrice) * 100) : 0;

  // Image to display
  const displayImage = activeVariant?.image_url || product.image || '';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white border border-zinc-200 text-zinc-900 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl rounded-3xl flex flex-col md:flex-row z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-700 z-20 cursor-pointer transition-all"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>

          {/* Left Column: Image */}
          <div className="w-full md:w-1/2 relative rounded-tl-3xl rounded-bl-3xl overflow-hidden flex items-center justify-center min-h-[280px]"
            style={{ background: 'linear-gradient(145deg, #3BB8F5 0%, #2196E0 100%)' }}
          >
            {discount > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                -{discount}%
              </span>
            )}
            {/* Watermark */}
            <span className="absolute text-[8rem] font-black text-white/10 uppercase select-none pointer-events-none leading-none">
              {(name || '').split(' ')[0] || ''}
            </span>
            {displayImage ? (
              <img
                src={displayImage}
                alt={name}
                className="relative z-10 w-4/5 max-h-[320px] object-contain drop-shadow-2xl transform rotate-[-8deg]"
              />
            ) : (
              <span className="text-8xl">👟</span>
            )}
          </div>

          {/* Right Column: Info */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-5">

              {/* Category */}
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#3CA9E5]">
                {category}{product && product.subcategory ? ` · ${product.subcategory}` : ''}
              </p>

              {/* Name & Price */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-zinc-900 leading-tight">
                  {name}
                </h2>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl font-extrabold text-[#2196E0]">
                    ${resolvedPrice.toFixed(2)}
                  </span>
                  {resolvedOriginalPrice && (
                    <span className="text-sm text-zinc-400 line-through">
                      ${resolvedOriginalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {description && (
                <p className="text-sm text-zinc-500 leading-relaxed font-light">
                  {description}
                </p>
              )}

              {/* Color variants */}
              {variants.length > 1 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                    Variante: <span className="text-zinc-800 ml-1">{variants[selectedColorIdx]?.color_name || `Variante ${selectedColorIdx + 1}`}</span>
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {variants.map((v, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleColorSelect(idx)}
                        className={`w-12 h-14 border-2 rounded-xl overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                          selectedColorIdx === idx
                            ? 'border-[#2196E0] scale-105 shadow-md'
                            : 'border-zinc-200 hover:border-zinc-400'
                        }`}
                        title={v.color_name}
                      >
                        <img src={v.image_url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {availableSizes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                    Talla: <span className="text-zinc-800 ml-1">{selectedSize}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(size => {
                      const sizeStock = hasVariants && activeVariant?.stock_by_size
                        ? (activeVariant.stock_by_size[size] ?? 0) : 999;
                      const outOfStock = sizeStock === 0;
                      return (
                        <button
                          key={size}
                          onClick={() => { if (!outOfStock) setSelectedSize(size); }}
                          disabled={outOfStock}
                          className={`min-w-[40px] h-10 px-2 border text-xs font-semibold uppercase rounded-lg flex items-center justify-center transition-all ${
                            selectedSize === size
                              ? 'bg-[#2196E0] border-[#2196E0] text-white font-bold shadow'
                              : outOfStock
                              ? 'border-zinc-100 text-zinc-300 bg-zinc-50 cursor-not-allowed line-through'
                              : 'border-zinc-200 text-zinc-600 hover:border-[#2196E0] hover:text-[#2196E0] cursor-pointer'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  {currentStock <= 3 && currentStock > 0 && (
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                      ¡Solo {currentStock} disponible{currentStock !== 1 ? 's' : ''}!
                    </p>
                  )}
                  {currentStock === 0 && (
                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">
                      Agotado en esta talla
                    </p>
                  )}
                </div>
              )}

              {/* Details list */}
              {details && details.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                  <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase block">
                    Características
                  </span>
                  <ul className="space-y-1">
                    {details.map((d, i) => (
                      <li key={i} className="text-xs text-zinc-500 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-[#3CA9E5] flex-shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Add to cart */}
            {!isAdmin && (
              <div className="mt-6 pt-5 border-t border-zinc-100 space-y-3">
                <div className="flex items-center gap-3">
                  {/* Qty selector */}
                  <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden">
                    <button onClick={decrementQty} className="px-3 py-2.5 text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors">
                      <Minus size={13} />
                    </button>
                    <span className="w-9 text-center text-sm font-bold select-none">{quantity}</span>
                    <button onClick={incrementQty} className="px-3 py-2.5 text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors">
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Add to cart button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={currentStock === 0}
                    className={`flex-1 text-xs font-black py-3.5 uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 transition-all ${
                      currentStock === 0
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                        : 'bg-[#2196E0] text-white hover:bg-[#1a7bc4] cursor-pointer active:scale-[0.98] shadow-lg'
                    }`}
                  >
                    <ShoppingBag size={14} />
                    {currentStock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                  </button>

                  {/* Favorite */}
                  <button
                    onClick={() => onToggleFavorite(product.id)}
                    className="p-3 border border-zinc-200 rounded-xl text-zinc-400 hover:text-rose-500 hover:border-rose-300 cursor-pointer transition-all"
                  >
                    <Heart size={16} fill={isFavorite ? '#f43f5e' : 'none'} className={isFavorite ? 'text-rose-500' : ''} />
                  </button>
                </div>

                <AnimatePresence>
                  {addedMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs py-2 px-3 text-center font-medium rounded-xl"
                    >
                      ✓ ¡Agregado al carrito!
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
