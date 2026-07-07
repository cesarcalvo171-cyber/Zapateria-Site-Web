import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeaturedGrid({ onOpenDetail, productsList = [] }) {
  // Find the products or fallback to static info matching the cards
  const card1 = productsList.find(p => p.id === '1') || {
    name: 'Air Zoo Structure 18',
    price: 100.00,
    description: 'Zapatillas diseñadas para correr, con amortiguación y soporte excepcionales para corredores activos.',
    image: '/images/air_max_speed_turf.png'
  };

  const card2 = productsList.find(p => p.id === '2') || {
    name: 'Air Jordan Retro 7',
    price: 150.00,
    description: 'El clásico modelo retro de Jordan que combina estilo urbano y soporte acolchado de caña alta.',
    image: '/images/air_jordan_retro.png'
  };

  const card3 = productsList.find(p => p.id === '3') || {
    name: 'Air Max 270 Dusty',
    price: 200.00,
    description: 'Unidad Max Air de 270 grados en el talón para una pisada elástica y un look futurista.',
    image: '/images/air_max_270.png'
  };

  const cards = [
    {
      ...card1,
      name: 'Air Zoo Structure 18',
      bgColor: 'bg-[#017AC6]',
      priceDisplay: '$100.00 USD',
      btnText: 'COMPRAR NOW'
    },
    {
      ...card2,
      name: 'Air Jordan Retro 7',
      bgColor: 'bg-[#4E5B8E]',
      priceDisplay: '$150.00 USD',
      btnText: 'COMPRAR NOW'
    },
    {
      ...card3,
      name: 'Air Max 270 Dusty',
      bgColor: 'bg-[#008A90]',
      priceDisplay: '$200.00 USD',
      btnText: 'COMPRAR NOW'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
            className={`group relative ${card.bgColor} rounded-3xl overflow-hidden shadow-2xl p-8 flex flex-col h-[520px] text-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all`}
          >
            {/* Header info */}
            <div className="flex justify-between items-start z-10">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">Nike Calzado</span>
                <h3 className="text-2xl font-black uppercase tracking-wide max-w-[200px] leading-tight">
                  {card.name}
                </h3>
              </div>
              <span className="text-lg font-black bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                {card.priceDisplay}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-white/80 font-light mt-4 leading-relaxed max-w-[240px] z-10">
              {card.description}
            </p>

            {/* Giant Background text */}
            <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0">
              <span className="text-[9vw] font-black text-white/5 uppercase tracking-widest leading-none">
                NIKE
              </span>
            </div>

            {/* Slanted Pop-out Shoe Image */}
            <div className="relative flex-grow flex items-center justify-center h-[240px] z-10 mt-4">
              <img
                src={card.image}
                alt={card.name}
                className="w-full h-full max-h-[220px] object-contain transform rotate-[-15deg] group-hover:rotate-[-5deg] group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_15px_25px_rgba(0,0,0,0.4)]"
              />
            </div>

            {/* Action button at bottom */}
            <button
              onClick={() => onOpenDetail && onOpenDetail(card)}
              className="mt-auto w-full py-4 bg-white/10 hover:bg-white text-white hover:text-black text-xs font-bold uppercase tracking-[0.2em] rounded-2xl border border-white/20 hover:border-white transition-all cursor-pointer flex items-center justify-center gap-2 z-10 active:scale-95"
            >
              <span>{card.btnText}</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
