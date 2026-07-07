import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedGrid from './components/FeaturedGrid';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AdminPanel from './components/AdminPanel';
import { supabase } from './supabaseClient';
import { categories, subcategories } from './data/products';
import { SlidersHorizontal, Heart, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  // State management
  const darkMode = false;

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Supabase products data
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [session, setSession] = useState(null);

  // Hero and Editing states
  const [productToEdit, setProductToEdit] = useState(null);
  const [heroSettings, setHeroSettings] = useState({
    hero_title: 'ENCUENTRA TU CALZADO IDEAL',
    hero_subtitle: 'Estilo, comodidad y calidad en cada paso. Explora nuestra colección de calzado para toda la familia.',
    hero_cta: 'Explorar Colección'
  });

  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutShippingType, setCheckoutShippingType] = useState('maritimo');
  const [checkoutShippingCost, setCheckoutShippingCost] = useState(4);

  // Filters and Sorting
  const [selectedSize, setSelectedSize] = useState('Todas');
  const [selectedColor, setSelectedColor] = useState('Todos');
  const [sortBy, setSortBy] = useState('default');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_variants (*)
        `);
      
      if (error) throw error;
      setProductsList(data || []);
    } catch (err) {
      console.error('Error fetching products:', err.message);
      setProductsList([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch site settings from Supabase
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
      if (error) throw error;
      
      if (data && data.length > 0) {
        const settingsObj = {};
        data.forEach(item => {
          settingsObj[item.key] = item.value;
        });
        setHeroSettings(prev => ({...prev, ...settingsObj}));
      }
    } catch (err) {
      console.error('Error fetching settings:', err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, [isAdminOpen]); // Refetch products & settings when admin panel closes

  // Check auth session and listen to changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@gmail.com';
  const isAdmin = !!(session?.user?.email && session.user.email === adminEmail);

  // Listen to URL path/hash to open admin login
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (
        path === '/login' || 
        path === '/login/' || 
        hash === '#/login' || 
        hash === '#login' || 
        path.startsWith('/login')
      ) {
        setIsAdminOpen(true);
      }
    };

    handleUrlRoute();

    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);

    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Sync cart and favorites to local storage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Extract all unique sizes and colors for filtering
  const allSizes = ['Todas', ...new Set(productsList.flatMap(p => 
    p.product_variants ? p.product_variants.flatMap(v => v.sizes) : (p.sizes || [])
  ))];

  const allColors = ['Todos', ...new Set(productsList.flatMap(p => 
    p.product_variants ? p.product_variants.map(v => v.color_name) : (p.colors ? p.colors.map(c => c.name) : [])
  ))];

  // Cart operations
  const handleAddToCart = (product, quantity = 1, size = null, color = null) => {
    const variants = product.product_variants || [];
    
    // Determine color & size defaults based on active variant
    const itemColor = color || (variants.length > 0 ? { name: variants[0].color_name, hex: variants[0].color_hex } : null);
    const itemSize = size || (variants.length > 0 ? variants[0].sizes[0] : (product.sizes?.[0] || '40'));

    // Find the variant matching the selected color/name
    const activeVar = variants.find(v => v.color_name === itemColor?.name) || variants[0];
    
    // Determine the size-specific price, cost and original price
    const specificPrice = activeVar?.price_by_size?.[itemSize] !== undefined
      ? Number(activeVar.price_by_size[itemSize])
      : Number(product.price);
      
    const specificCostPrice = activeVar?.cost_price_by_size?.[itemSize] !== undefined
      ? Number(activeVar.cost_price_by_size[itemSize])
      : Number(product.cost_price || 0);

    const specificOriginalPrice = activeVar?.original_price_by_size?.[itemSize] !== undefined && activeVar.original_price_by_size[itemSize] !== null
      ? (activeVar.original_price_by_size[itemSize] ? Number(activeVar.original_price_by_size[itemSize]) : null)
      : (product.original_price ? Number(product.original_price) : null);

    setCart(prevCart => {
      const existingIdx = prevCart.findIndex(
        item => item.id === product.id && 
                item.selectedSize === itemSize && 
                item.selectedColor?.name === itemColor?.name
      );

      if (existingIdx > -1) {
        const newCart = [...prevCart];
        newCart[existingIdx].quantity += quantity;
        return newCart;
      } else {
        return [...prevCart, {
          ...product,
          price: specificPrice,
          cost_price: specificCostPrice,
          original_price: specificOriginalPrice,
          quantity,
          selectedSize: itemSize,
          selectedColor: itemColor,
          image: activeVar?.image_url || product.image || '/images/air_max_speed_turf.png'
        }];
      }
    });
  };

  const handleUpdateCartQty = (id, size, colorName, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(id, size, colorName);
      return;
    }
    setCart(prev => prev.map(item => 
      (item.id === id && item.selectedSize === size && item.selectedColor?.name === colorName)
        ? { ...item, quantity: newQty }
        : item
    ));
  };

  const handleRemoveCartItem = (id, size, colorName) => {
    setCart(prev => prev.filter(item => 
      !(item.id === id && item.selectedSize === size && item.selectedColor?.name === colorName)
    ));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Favorites operations
  const handleToggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const handleToggleShowOnlyFavorites = () => {
    setShowOnlyFavorites(!showOnlyFavorites);
    if (!showOnlyFavorites) {
      setSelectedCategory('Todos');
      setSelectedSubcategory('Todas');
    }
  };

  // Filtered and Sorted products
  const filteredProducts = productsList.filter(product => {
    const matchesSearch = searchQuery.trim() === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.subcategory && product.subcategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesCategory = true;
    if (selectedCategory === 'Todos') {
      matchesCategory = true;
    } else if (selectedCategory === 'Ofertas') {
      matchesCategory = (product.original_price > product.price) || (product.originalPrice > product.price);
    } else {
      matchesCategory = product.category === selectedCategory;
    }

    const matchesSubcategory = selectedSubcategory === 'Todas' || product.subcategory === selectedSubcategory;
    const matchesFavorites = !showOnlyFavorites || favorites.includes(product.id);

    // Matches size in any of the variants
    const matchesSize = selectedSize === 'Todas' || (
      product.product_variants 
        ? product.product_variants.some(v => v.sizes.includes(selectedSize))
        : (product.sizes && product.sizes.includes(selectedSize))
    );

    // Matches color in any of the variants
    const matchesColor = selectedColor === 'Todos' || (
      product.product_variants 
        ? product.product_variants.some(v => v.color_name === selectedColor)
        : (product.colors && product.colors.some(c => c.name === selectedColor))
    );

    return matchesSearch && matchesCategory && matchesSubcategory && matchesFavorites && matchesSize && matchesColor;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const handleResetFilters = () => {
    setSelectedSize('Todas');
    setSelectedColor('Todos');
    setSortBy('default');
    setSearchQuery('');
    setSelectedCategory('Todos');
    setSelectedSubcategory('Todas');
    setShowOnlyFavorites(false);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto? Se borrarán también todas sus variantes.')) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      if (error) throw error;
      setProductsList(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Error al eliminar producto:', err.message);
      alert('Error al eliminar producto: ' + err.message);
    }
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    setProductToEdit(null); // Clear editing product state
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path.startsWith('/login')) {
      window.history.pushState(null, '', '/');
    }
    if (hash === '#/login' || hash === '#login') {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const handleOpenCheckout = (total, discount, shippingType = 'maritimo', shippingCost = 4) => {
    setCheckoutTotal(total);
    setCheckoutDiscount(discount);
    setCheckoutShippingType(shippingType);
    setCheckoutShippingCost(shippingCost);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-zinc-900 flex flex-col font-sans">
      
      {/* Admin Control Bar */}
      {isAdmin && (
        <div className="bg-zinc-950 text-zinc-100 text-[11px] sm:text-xs px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between border-b border-zinc-900 tracking-wider z-50">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="font-bold uppercase text-white">Sesión de Administrador Activa</span>
            <span className="text-zinc-400 font-light">| {session.user.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-medium tracking-widest uppercase text-zinc-300 border border-zinc-700/50 rounded-full hover:text-white hover:border-zinc-400 hover:bg-white/5 transition-all cursor-pointer"
            >
              <Sparkles size={12} />
              Panel Admin
            </button>
            <button
              onClick={async () => {
                if (window.confirm('¿Estás seguro de que quieres cerrar la sesión de administrador?')) {
                  await supabase.auth.signOut();
                }
              }}
              className="px-4 py-1.5 text-[10px] font-medium tracking-widest uppercase text-rose-400/80 border border-rose-900/30 rounded-full hover:text-rose-300 hover:border-rose-700/50 hover:bg-rose-950/20 transition-all cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Header navbar */}
      <Header
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        favoritesCount={favorites.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFavorites={handleToggleShowOnlyFavorites}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat, sub = 'Todas') => {
          setSelectedCategory(cat);
          setSelectedSubcategory(sub);
          setShowOnlyFavorites(false);
        }}
        selectedSubcategory={selectedSubcategory}
        isAdmin={isAdmin}
      />

      {/* Hero Section */}
      <Hero
        heroSettings={heroSettings}
      />

      {/* Featured Grid Section (tarjetas destacadas) */}
      <FeaturedGrid 
        onOpenDetail={(prod) => setSelectedProduct(prod)}
        onAddToCart={(prod, qty, size, color) => {
          handleAddToCart(prod, qty, size, color);
          setIsCartOpen(true);
        }} 
        productsList={productsList} 
      />

      {/* Catalog Container Wrapper with Clean White Background */}
      <div className="w-full bg-[#FAF9F6] text-zinc-900 py-16 border-t border-zinc-200">
        <main id="catalog" className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Título de sección */}
          <div className="flex items-center gap-3 mb-8">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Explora</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-widest text-zinc-950 uppercase">NUESTRA COLECCIÓN</h2>
            </div>
          </div>

          {/* === SISTEMA DE FILTROS POR CATEGORÍA Y SUBCATEGORÍA === */}
          <div className="w-full mb-10 space-y-4">

            {/* Fila 1: Categorías principales */}
            <div className="flex flex-wrap gap-2">
              {['Todos', 'Hombre', 'Mujer', 'Niños', 'Novedades', 'Ofertas'].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setSelectedCategory(tab);
                    setSelectedSubcategory('Todas');
                    setShowOnlyFavorites(false);
                  }}
                  className={`py-2 px-5 text-xs font-bold border-2 transition-all duration-200 cursor-pointer uppercase tracking-wider rounded-full ${
                    selectedCategory === tab
                      ? 'bg-[#3CA9E5] text-white border-[#3CA9E5] shadow-md'
                      : 'bg-white text-zinc-500 border-zinc-200 hover:border-[#3CA9E5] hover:text-[#3CA9E5]'
                  }`}
                >
                  {tab}
                </button>
              ))}

              {/* Separador + Ordenar */}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Ordenar:</span>
                {[
                  { value: 'default', label: 'Recientes' },
                  { value: 'price-asc', label: '$ Menor' },
                  { value: 'price-desc', label: '$ Mayor' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`py-1.5 px-3 text-[10px] font-semibold border rounded-full cursor-pointer transition-all ${
                      sortBy === opt.value
                        ? 'bg-[#3CA9E5] text-white border-[#3CA9E5]'
                        : 'border-zinc-200 text-zinc-500 hover:border-[#3CA9E5] hover:text-[#3CA9E5] bg-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fila 2: Subcategorías (aparece solo si la categoría tiene subcategorías) */}
            {subcategories[selectedCategory] && (
              <div className="flex flex-wrap gap-2 pt-1 border-t border-zinc-200">
                <button
                  onClick={() => setSelectedSubcategory('Todas')}
                  className={`py-1.5 px-4 text-[10px] font-bold border transition-all cursor-pointer uppercase tracking-wider rounded-md ${
                    selectedSubcategory === 'Todas'
                      ? 'bg-[#3CA9E5] text-white border-[#3CA9E5]'
                      : 'bg-white text-zinc-500 border-zinc-200 hover:border-[#3CA9E5] hover:text-[#3CA9E5]'
                  }`}
                >
                  Todas
                </button>
                {subcategories[selectedCategory].map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`py-1.5 px-4 text-[10px] font-bold border transition-all cursor-pointer uppercase tracking-wider rounded-md ${
                      selectedSubcategory === sub
                        ? 'bg-[#3CA9E5] text-white border-[#3CA9E5]'
                        : 'bg-white text-zinc-500 border-zinc-200 hover:border-[#3CA9E5] hover:text-[#3CA9E5]'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}

            {/* Indicador activo */}
            {(selectedCategory !== 'Todos' || selectedSubcategory !== 'Todas') && (
              <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                <span>Mostrando:</span>
                <span className="font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                  {selectedCategory}{selectedSubcategory !== 'Todas' ? ` › ${selectedSubcategory}` : ''}
                </span>
                <button
                  onClick={() => { setSelectedCategory('Todos'); setSelectedSubcategory('Todas'); }}
                  className="text-[#3CA9E5] font-bold hover:underline cursor-pointer ml-1"
                >
                  × Limpiar
                </button>
              </div>
            )}
          </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full"
            />
            <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Cargando catálogo...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty state */
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full">
              <SlidersHorizontal size={36} className="text-zinc-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold uppercase tracking-wider">No se encontró calzado</h3>
              <p className="text-sm text-zinc-500 font-light max-w-sm">Prueba ajustando los filtros o la búsqueda para encontrar lo que necesitas.</p>
            </div>
            <button
              onClick={handleResetFilters}
              className="bg-black dark:bg-white text-white dark:text-zinc-950 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Mostrar todo
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={handleToggleFavorite}
                onOpenDetail={(prod) => setSelectedProduct(prod)}
                onAddToCart={(prod, qty, size, color) => {
                  handleAddToCart(prod, qty, size, color);
                  setIsCartOpen(true);
                }}
                isAdmin={isAdmin}
                onDelete={handleDeleteProduct}
                onEdit={(prod) => {
                  setProductToEdit(prod);
                  setIsAdminOpen(true);
                }}
              />
            ))}
          </div>
        )}
        </main>
      </div>

      {/* Footer Design */}
      {!isAdmin && (
        <footer id="footer" className="bg-[#3CA9E5] py-16 px-4 border-t border-white/10 text-white transition-colors duration-300">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            
            {/* Column 1: Brand Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-black tracking-[0.25em] uppercase text-white">ZAPATERÍA</h2>
              <p className="text-xs text-white/80 font-light leading-relaxed max-w-xs">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="text-[10px] text-white/60 font-mono">
                <span>© {new Date().getFullYear()} Zapatería. Todos los derechos reservados.</span>
              </div>
            </div>

            {/* Column 2: Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-white">Categorías</h4>
              <ul className="space-y-2 text-xs font-light text-white/80">
                <li><button onClick={() => { setSelectedCategory('Hombre'); setSelectedSubcategory('Todas'); }} className="hover:underline hover:text-white cursor-pointer transition-all uppercase">Hombre</button></li>
                <li><button onClick={() => { setSelectedCategory('Mujer'); setSelectedSubcategory('Todas'); }} className="hover:underline hover:text-white cursor-pointer transition-all uppercase">Mujer</button></li>
                <li><button onClick={() => { setSelectedCategory('Niños'); setSelectedSubcategory('Todas'); }} className="hover:underline hover:text-white cursor-pointer transition-all uppercase">Niños</button></li>
                <li><button onClick={() => { setSelectedCategory('Ofertas'); setSelectedSubcategory('Todas'); }} className="hover:underline hover:text-white cursor-pointer transition-all uppercase">Ofertas</button></li>
              </ul>
            </div>

            {/* Column 3: Help */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-white">Contacto & Ayuda</h4>
              <p className="text-xs text-white/80 font-light leading-relaxed max-w-xs">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
            
          </div>
        </footer>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        isFavorite={selectedProduct ? favorites.includes(selectedProduct.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
        isAdmin={isAdmin}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleOpenCheckout}
      />

      {/* Checkout Wizard Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        total={checkoutTotal}
        discountPercent={checkoutDiscount}
        shippingType={checkoutShippingType}
        shippingCost={checkoutShippingCost}
        cartItems={cart}
        onClearCart={handleClearCart}
      />

      {/* Full Admin Panel Drawer */}
      {isAdminOpen && (
        <AdminPanel 
          onClose={handleCloseAdmin}
          productToEdit={productToEdit}
          onClearEdit={() => setProductToEdit(null)}
          onEdit={(prod) => setProductToEdit(prod)}
          heroSettings={heroSettings}
          onUpdateSettings={(newSettings) => setHeroSettings(newSettings)}
        />
      )}

    </div>
  );
}
