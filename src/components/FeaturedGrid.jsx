import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const BG_COLORS = ['bg-[#017AC6]', 'bg-[#4E5B8E]', 'bg-[#008A90]'];

export default function FeaturedGrid({ onOpenDetail, productsList = [] }) {
  // Solo mostrar productos marcados como destacados desde la base de datos
  const featuredProducts = productsList.filter(p => p.is_featured === true).slice(0, 3);

  // Si no hay productos destacados, no renderizar la sección
  if (featuredProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className={`grid grid-cols-1 gap-8 ${
        featuredProducts.length === 1 ? 'md:grid-cols-1 max-w-sm mx-auto' :
        featuredProducts.length === 2 ? 'md:grid-cols-2' :
        'md:grid-cols-3'
      }`}>
        {featuredProducts.map((product, idx) => {
          const image = product.product_variants?.[0]?.image_url || product.image;
          const price = product.price ?? 0;
          const bgColor = BG_COLORS[idx % BG_COLORS.length];

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className={`group relative ${bgColor} rounded-3xl overflow-hidden shadow-2xl p-8 flex flex-col h-[520px] text-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all`}
            >
              {/* Header info */}
              <div className="flex justify-between items-start z-10">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">
                    {product.category || 'Calzado'}
                  </span>
                  <h3 className="text-2xl font-black uppercase tracking-wide max-w-[200px] leading-tight">
                    {product.name}
                  </h3>
                </div>
                <span className="text-lg font-black bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
                  ${price.toFixed(2)}
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-xs text-white/80 font-light mt-4 leading-relaxed max-w-[240px] z-10 line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* Giant Background text */}
              <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0">
                <span className="text-[9vw] font-black text-white/5 uppercase tracking-widest leading-none">
                  STORE
                </span>
              </div>

              {/* Shoe Image */}
              <div className="relative flex-grow flex items-center justify-center h-[240px] z-10 mt-4">
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    className="w-full h-full max-h-[220px] object-contain transform rotate-[-15deg] group-hover:rotate-[-5deg] group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_15px_25px_rgba(0,0,0,0.4)]"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-4xl">👟</span>
                  </div>
                )}
              </div>

              {/* Action button */}
              <button
                onClick={() => onOpenDetail && onOpenDetail(product)}
                className="mt-auto w-full py-4 bg-white/10 hover:bg-white text-white hover:text-black text-xs font-bold uppercase tracking-[0.2em] rounded-2xl border border-white/20 hover:border-white transition-all cursor-pointer flex items-center justify-center gap-2 z-10 active:scale-95"
              >
                <span>Ver Producto</span>
                <ArrowRight size={14} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
