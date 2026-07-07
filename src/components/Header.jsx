import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, Menu, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { subcategories as subcategoriesData } from '../data/products';

export default function Header({
  cartCount,
  favoritesCount,
  onOpenCart,
  onOpenFavorites,
  searchQuery,
  setSearchQuery,
  categories,
  selectedCategory,
  onSelectCategory,
  selectedSubcategory,
  isAdmin
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [expandedMobileCat, setExpandedMobileCat] = useState(null);

  const toggleMobileCat = (cat) => {
    if (expandedMobileCat === cat) {
      setExpandedMobileCat(null);
    } else {
      setExpandedMobileCat(cat);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">

      {/* Main Navbar */}
      <div className="w-full bg-[#3CA9E5] border-b border-white/20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between text-white">
          
          {/* Logo & Mobile Trigger */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-zinc-300 hover:text-white transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <a href="#" onClick={() => onSelectCategory('Todos', 'Todas')} className="flex flex-col items-start justify-center text-white select-none hover:opacity-80 transition-opacity">
              <div className="text-left leading-none flex gap-2 items-baseline">
                <span className="block text-xl font-sans tracking-wide font-bold capitalize">Zapatería</span>
              </div>
            </a>
          </div>

          {/* Desktop Categories Menu with Dropdowns */}
          <nav className="hidden lg:flex space-x-6 text-xs font-bold tracking-wider text-white/80 uppercase">
            <button 
              onClick={() => onSelectCategory('Todos', 'Todas')} 
              className={`hover:text-white cursor-pointer transition-colors ${selectedCategory === 'Todos' ? 'text-white underline underline-offset-4' : ''}`}
            >
              Inicio
            </button>

            {/* Dropdown Hombre */}
            <div className="relative group py-2">
              <button 
                onClick={() => onSelectCategory('Hombre', 'Todas')} 
                className={`hover:text-white cursor-pointer transition-colors flex items-center gap-1 ${selectedCategory === 'Hombre' ? 'text-white underline underline-offset-4' : ''}`}
              >
                Hombre <ChevronDown size={10} className="group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute left-0 top-full mt-0 w-48 bg-[#3CA9E5] border border-white/20 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-2">
                {subcategoriesData['Hombre']?.map(sub => (
                  <button
                    key={sub}
                    onClick={() => onSelectCategory('Hombre', sub)}
                    className={`w-full text-left px-4 py-2 text-[10px] text-white/85 hover:text-white hover:bg-white/10 transition-colors uppercase flex justify-between items-center ${selectedCategory === 'Hombre' && selectedSubcategory === sub ? 'text-white font-black underline' : ''}`}
                  >
                    {sub}
                    {selectedCategory === 'Hombre' && selectedSubcategory === sub && <Check size={10} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdown Mujer */}
            <div className="relative group py-2">
              <button 
                onClick={() => onSelectCategory('Mujer', 'Todas')} 
                className={`hover:text-white cursor-pointer transition-colors flex items-center gap-1 ${selectedCategory === 'Mujer' ? 'text-white underline underline-offset-4' : ''}`}
              >
                Mujer <ChevronDown size={10} className="group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute left-0 top-full mt-0 w-48 bg-[#3CA9E5] border border-white/20 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-2">
                {subcategoriesData['Mujer']?.map(sub => (
                  <button
                    key={sub}
                    onClick={() => onSelectCategory('Mujer', sub)}
                    className={`w-full text-left px-4 py-2 text-[10px] text-white/85 hover:text-white hover:bg-white/10 transition-colors uppercase flex justify-between items-center ${selectedCategory === 'Mujer' && selectedSubcategory === sub ? 'text-white font-black underline' : ''}`}
                  >
                    {sub}
                    {selectedCategory === 'Mujer' && selectedSubcategory === sub && <Check size={10} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdown Niños */}
            <div className="relative group py-2">
              <button 
                onClick={() => onSelectCategory('Niños', 'Todas')} 
                className={`hover:text-white cursor-pointer transition-colors flex items-center gap-1 ${selectedCategory === 'Niños' ? 'text-white underline underline-offset-4' : ''}`}
              >
                Niños <ChevronDown size={10} className="group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute left-0 top-full mt-0 w-48 bg-[#3CA9E5] border border-white/20 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-2">
                {subcategoriesData['Niños']?.map(sub => (
                  <button
                    key={sub}
                    onClick={() => onSelectCategory('Niños', sub)}
                    className={`w-full text-left px-4 py-2 text-[10px] text-white/85 hover:text-white hover:bg-white/10 transition-colors uppercase flex justify-between items-center ${selectedCategory === 'Niños' && selectedSubcategory === sub ? 'text-white font-black underline' : ''}`}
                  >
                    {sub}
                    {selectedCategory === 'Niños' && selectedSubcategory === sub && <Check size={10} />}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => onSelectCategory('Marcas', 'Todas')} 
              className={`hover:text-white cursor-pointer transition-colors ${selectedCategory === 'Marcas' ? 'text-white underline underline-offset-4' : ''}`}
            >
              Marcas
            </button>
            <button 
              onClick={() => onSelectCategory('Novedades', 'Todas')} 
              className={`hover:text-white cursor-pointer transition-colors ${selectedCategory === 'Novedades' ? 'text-white underline underline-offset-4' : ''}`}
            >
              Novedades
            </button>
            <button 
              onClick={() => onSelectCategory('Ofertas', 'Todas')} 
              className={`hover:text-white cursor-pointer transition-colors ${selectedCategory === 'Ofertas' ? 'text-white underline underline-offset-4' : ''}`}
            >
              Ofertas
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('footer');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }} 
              className="hover:text-white cursor-pointer transition-colors"
            >
              Contacto
            </button>
          </nav>

          {/* Actions & Search */}
          <div className="flex items-center gap-3 sm:gap-5 text-white">
            {/* Search toggler / input */}
            <div className="relative flex items-center">
              {showSearch ? (
                <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar calzado..."
                    className="bg-transparent text-xs w-28 sm:w-44 focus:outline-none text-white placeholder-white/60"
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearch(false);
                    }}
                    className="text-white/80 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="text-white/85 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all cursor-pointer"
                  aria-label="Buscar"
                >
                  <Search size={18} />
                </button>
              )}
            </div>

            {/* Favorites Icon */}
            {!isAdmin && (
              <button
                onClick={onOpenFavorites}
                className="relative text-white/85 hover:text-white p-2 rounded-xl border border-white/20 hover:border-white transition-all cursor-pointer bg-white/5"
                aria-label="Favoritos"
              >
                <Heart size={16} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold scale-100 animate-pulse">
                    {favoritesCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart Icon */}
            {!isAdmin && (
              <button
                onClick={onOpenCart}
                className="relative text-white/85 hover:text-white p-2 rounded-xl border border-white/20 hover:border-white transition-all cursor-pointer bg-white/5"
                aria-label="Carrito"
              >
                <ShoppingBag size={16} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-[#3CA9E5] text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black transition-colors shadow">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer with Accordions */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 bg-[#3CA9E5] px-4 py-4 space-y-2 transition-all duration-300 overflow-y-auto max-h-[80vh] text-white">
            <p className="text-[10px] font-black tracking-wider text-white/60 uppercase mb-2">Categorías</p>
            
            <button
              onClick={() => {
                onSelectCategory('Todos', 'Todas');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold tracking-wide uppercase flex justify-between items-center ${
                selectedCategory === 'Todos' ? 'bg-white/10 text-white font-black underline' : 'text-white/80'
              }`}
            >
              Inicio
            </button>

            {['Hombre', 'Mujer', 'Niños'].map((cat) => {
              const isExpanded = expandedMobileCat === cat;
              return (
                <div key={cat} className="space-y-1">
                  <button
                    onClick={() => toggleMobileCat(cat)}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold tracking-wide uppercase flex justify-between items-center ${
                      selectedCategory === cat ? 'text-white' : 'text-white/85'
                    }`}
                  >
                    {cat}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {isExpanded && (
                    <div className="pl-4 pr-2 py-1 space-y-1 bg-white/10 rounded-lg">
                      <button
                        onClick={() => {
                          onSelectCategory(cat, 'Todas');
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left py-1.5 px-3 text-[10px] uppercase font-semibold flex items-center justify-between ${
                          selectedCategory === cat && selectedSubcategory === 'Todas' ? 'text-white font-black' : 'text-white/70'
                        }`}
                      >
                        Ver Todo {cat}
                      </button>
                      {subcategoriesData[cat]?.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => {
                            onSelectCategory(cat, sub);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full text-left py-1.5 px-3 text-[10px] uppercase flex items-center justify-between ${
                            selectedCategory === cat && selectedSubcategory === sub ? 'text-white font-bold' : 'text-white/70'
                          }`}
                        >
                          {sub}
                          {selectedCategory === cat && selectedSubcategory === sub && <Check size={10} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {['Marcas', 'Novedades', 'Ofertas'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat, 'Todas');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold tracking-wide uppercase flex justify-between items-center ${
                  selectedCategory === cat ? 'bg-white/10 text-white font-black underline' : 'text-white/80'
                }`}
              >
                {cat}
              </button>
            ))}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                const element = document.getElementById('footer');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold tracking-wide uppercase text-white/80"
            >
              Contacto
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

