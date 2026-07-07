import React, { useState } from 'react';
import { Heart, ArrowRight, Trash2, Pencil } from 'lucide-react';
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
  const { name, price, originalPrice, category, subcategory } = product;

  const variants = product.product_variants || [];
  const hasVariants = variants.length > 0;

  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const activeVariant = hasVariants ? variants[activeVariantIdx] : null;

  const displayImage = activeVariant?.image_url || product.image || null;

  const availableSizes = activeVariant?.sizes || product.sizes || [];
  const [selectedSize, setSelectedSize] = useState(null);
  const activeSize = selectedSize && availableSizes.includes(selectedSize)
    ? selectedSize
    : (availableSizes[0] || null);

  const resolvedPrice = activeVariant?.price_by_size?.[activeSize] !== undefined
    ? Number(activeVariant.price_by_size[activeSize])
    : Number(price || 0);

  const resolvedOriginalPrice = activeVariant?.original_price_by_size?.[activeSize]
    ? Number(activeVariant.original_price_by_size[activeSize])
    : (originalPrice ? Number(originalPrice) : null);

  const discount = resolvedOriginalPrice
    ? Math.round(((resolvedOriginalPrice - resolvedPrice) / resolvedOriginalPrice) * 100)
    : 0;

  const totalStock = hasVariants
    ? variants.reduce((acc, v) =>
        acc + Object.values(v.stock_by_size || {}).reduce((s, n) => s + Number(n), 0), 0)
    : 999;
  const isOut = hasVariants && totalStock === 0;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (isOut) return;
    const colorObj = hasVariants
      ? { name: activeVariant.color_name, hex: activeVariant.color_hex }
      : null;
    onAddToCart(product, 1, activeSize || 'Única', colorObj);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`group relative flex flex-col w-full rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer ${isOut ? 'opacity-70' : ''}`}
      style={{ background: 'linear-gradient(145deg, #3BB8F5 0%, #2196E0 100%)' }}
    >
      {/* ── Admin buttons ── */}
      {isAdmin && (
        <div className="absolute top-3 right-3 z-30 flex gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
            className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all cursor-pointer backdrop-blur-sm"
            title="Editar"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
            className="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-full transition-all cursor-pointer"
            title="Eliminar"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* ── Favorite button (user only) ── */}
      {!isAdmin && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id); }}
          className="absolute top-3 left-3 z-30 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all cursor-pointer backdrop-blur-sm"
        >
          <Heart size={14} fill={isFavorite ? '#fff' : 'none'} className="text-white" />
        </button>
      )}

      {/* ── Header: Category, Name, Price ── */}
      <div className="px-5 pt-5 pb-2 flex items-start justify-between gap-2 z-10">
        <div className="flex-1">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/70 mb-0.5">
            {category || 'Calzado'}{subcategory ? ` · ${subcategory}` : ''}
          </p>
          <h3
            onClick={() => onOpenDetail(product)}
            className="text-xl font-black uppercase leading-tight text-white drop-shadow-sm line-clamp-2"
          >
            {name}
          </h3>
        </div>
        {/* Price pill */}
        <div className="flex-shrink-0">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white font-black text-sm px-3 py-1.5 rounded-xl whitespace-nowrap">
            ${resolvedPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Subcategory label below name */}
      {product.description && (
        <p className="px-5 text-[10px] text-white/70 font-light line-clamp-1 z-10">
          {product.description}
        </p>
      )}

      {/* ── Sizes row ── */}
      {availableSizes.length > 0 && (
        <div className="px-5 pt-2 flex flex-wrap gap-1 z-10">
          {availableSizes.slice(0, 6).map(size => (
            <button
              key={size}
              onClick={(e) => { e.stopPropagation(); setSelectedSize(size); }}
              className={`text-[8px] font-bold px-2 py-0.5 rounded-md border cursor-pointer transition-all ${
                activeSize === size
                  ? 'bg-white text-[#2196E0] border-white font-extrabold'
                  : 'border-white/30 text-white/80 hover:border-white hover:bg-white/10'
              }`}
            >
              {size}
            </button>
          ))}
          {availableSizes.length > 6 && (
            <span className="text-[8px] text-white/50 self-center">+{availableSizes.length - 6}</span>
          )}
        </div>
      )}

      {/* ── Discount badge ── */}
      {discount > 0 && (
        <div className="absolute top-3 right-16 z-20">
          <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            -{discount}%
          </span>
        </div>
      )}

      {/* Out of stock overlay */}
      {isOut && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
          <span className="bg-white/90 text-zinc-900 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full rotate-[-5deg] shadow-lg">
            Agotado
          </span>
        </div>
      )}

      {/* ── Giant watermark text ── */}
      <div className="absolute inset-0 flex items-center justify-end pr-4 select-none pointer-events-none z-0 overflow-hidden">
        <span className="text-[7rem] font-black text-white/10 uppercase tracking-widest leading-none">
          {(name || '').split(' ')[0]}
        </span>
      </div>

      {/* ── Product image (rotated, center) ── */}
      <div
        className="relative flex-grow flex items-center justify-center py-4 px-6 min-h-[180px] z-10"
        onClick={() => onOpenDetail(product)}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={name}
            className="w-full max-h-[180px] object-contain transform rotate-[-12deg] group-hover:rotate-[-6deg] group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
          />
        ) : (
          <div className="w-24 h-24 flex items-center justify-center">
            <span className="text-6xl">👟</span>
          </div>
        )}
      </div>

      {/* ── Variant color dots ── */}
      {variants.length > 1 && (
        <div className="px-5 pb-2 flex gap-1.5 z-10">
          {variants.map((v, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setActiveVariantIdx(idx); }}
              className={`w-4 h-4 rounded-full border-2 transition-all cursor-pointer ${
                activeVariantIdx === idx ? 'border-white scale-125 shadow-md' : 'border-white/30'
              }`}
              style={{ backgroundColor: v.color_hex || '#fff' }}
              title={v.color_name}
            />
          ))}
        </div>
      )}

      {/* ── Bottom button ── */}
      <div className="px-4 pb-4 z-10">
        {isAdmin ? (
          <button
            onClick={() => onOpenDetail(product)}
            className="w-full py-3.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-white/20 hover:border-white/40 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Ver Producto</span>
            <ArrowRight size={13} />
          </button>
        ) : (
          <button
            onClick={handleQuickAdd}
            disabled={isOut}
            className="w-full py-3.5 bg-white/15 hover:bg-white hover:text-[#2196E0] backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-white/20 hover:border-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span>Ver Producto</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
