import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, Plus, Trash2, LogIn, UserPlus, LogOut, Check, ChevronLeft, Image as ImageIcon, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SalesAdminTab from './SalesAdminTab';
import { subcategories as SUBCATEGORIES } from '../data/products';

const CATEGORIES = ['Hombre', 'Mujer', 'Niños', 'Marcas', 'Novedades', 'Ofertas', 'Otros'];
const AVAILABLE_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', 'Única'];

export default function AdminPanel({ 
  onClose, 
  productToEdit = null, 
  onClearEdit = null, 
  onEdit = null,
  heroSettings = {}, 
  onUpdateSettings = null 
}) {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'hero'

  // Auth state
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Products state
  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Product Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subcategory, setSubcategory] = useState('');
  const [detailsInput, setDetailsInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Variants Form state
  const [variants, setVariants] = useState([
    { color_name: 'Variante 1', color_hex: '#000000', sizes: [], stock_by_size: {}, price_by_size: {}, cost_price_by_size: {}, original_price_by_size: {}, file: null, previewUrl: '' }
  ]);

  // Hero settings state
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroCta, setHeroCta] = useState('');

  // Bulk import states
  const [importCsvFile, setImportCsvFile] = useState(null);
  const [importImageFiles, setImportImageFiles] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState('');

  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch products when logged in
  useEffect(() => {
    if (session) {
      fetchProducts();
    }
  }, [session]);

  // Pre-fill form fields when productToEdit changes
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setDescription(productToEdit.description || '');
      setPrice(productToEdit.price || '');
      setOriginalPrice(productToEdit.original_price || '');
      setCostPrice(productToEdit.cost_price || '');
      setCategory(productToEdit.category || CATEGORIES[0]);
      setSubcategory(productToEdit.subcategory || '');
      setDetailsInput(productToEdit.details ? productToEdit.details.join('\n') : '');
      setIsFeatured(productToEdit.is_featured || false);
      
      if (productToEdit.product_variants && productToEdit.product_variants.length > 0) {
        setVariants(productToEdit.product_variants.map((v, idx) => ({
          color_name: v.color_name || `Variante ${idx + 1}`,
          color_hex: v.color_hex || '#000000',
          sizes: v.sizes || [],
          stock_by_size: v.stock_by_size || {},
          price_by_size: v.price_by_size || {},
          cost_price_by_size: v.cost_price_by_size || {},
          original_price_by_size: v.original_price_by_size || {},
          file: null,
          previewUrl: v.image_url || ''
        })));
      } else {
        setVariants([{ color_name: 'Variante 1', color_hex: '#000000', sizes: [], stock_by_size: {}, price_by_size: {}, cost_price_by_size: {}, original_price_by_size: {}, file: null, previewUrl: '' }]);
      }
    } else {
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setOriginalPrice('');
      setCostPrice('');
      setCategory(CATEGORIES[0]);
      setSubcategory('');
      setDetailsInput('');
      setIsFeatured(false);
      setVariants([{ color_name: 'Variante 1', color_hex: '#000000', sizes: [], stock_by_size: {}, price_by_size: {}, cost_price_by_size: {}, original_price_by_size: {}, file: null, previewUrl: '' }]);
    }
  }, [productToEdit]);

  const parseCSV = (text) => {
    const lines = [];
    let row = [""];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i+1];

      if (c === '"') {
        if (inQuotes && next === '"') {
          row[row.length - 1] += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push("");
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') {
          i++;
        }
        lines.push(row);
        row = [""];
      } else {
        row[row.length - 1] += c;
      }
    }
    if (row.length > 1 || row[0] !== "") {
      lines.push(row);
    }
    return lines;
  };

  const handleDownloadTemplate = (e) => {
    e.preventDefault();
    const headers = ['nombre', 'descripcion', 'categoria', 'subcategoria', 'destacado', 'detalles', 'nombre_imagen_archivo', 'tallas', 'stock', 'precios', 'costos', 'originales'];
    const row = [
      '"Air Max Speed Turf"',
      '"Zapatillas de alto rendimiento con correa ajustable en el mediopié para un ajuste firme."',
      '"Hombre"',
      '"Deportivo"',
      'TRUE',
      '"Marca: Nike|Material: Cuero|Suela: Goma"',
      'air_max_speed_turf.png',
      '"40,41,42"',
      '"10,15,20"',
      '"85.00,85.00,85.00"',
      '"45.00,45.00,45.00"',
      '""'
    ];
    const csvContent = [headers.join(','), row.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_catalogo_calzado.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (e) => {
    e.preventDefault();
    if (!importCsvFile) {
      alert('Por favor selecciona un archivo CSV.');
      return;
    }
    
    setImportLoading(true);
    setImportProgress('Leyendo archivo CSV...');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target.result;
        const rows = parseCSV(text);
        
        if (rows.length < 2) {
          alert('El archivo CSV está vacío o no contiene filas de datos.');
          setImportLoading(false);
          return;
        }

        const headers = rows[0].map(h => h.trim().toLowerCase());
        const dataRows = rows.slice(1).filter(r => r.length > 0 && r[0].trim() !== '');

        // Map column indexes
        const idx = {
          nombre: headers.indexOf('nombre'),
          descripcion: headers.indexOf('descripcion'),
          categoria: headers.indexOf('categoria'),
          subcategoria: headers.indexOf('subcategoria'),
          destacado: headers.indexOf('destacado'),
          detalles: headers.indexOf('detalles'),
          nombre_imagen_archivo: headers.indexOf('nombre_imagen_archivo'),
          tallas: headers.indexOf('tallas'),
          stock: headers.indexOf('stock'),
          precios: headers.indexOf('precios'),
          costos: headers.indexOf('costos'),
          originales: headers.indexOf('originales')
        };

        if (idx.nombre === -1 || idx.tallas === -1 || idx.precios === -1) {
          alert('El CSV debe contener al menos las columnas "nombre", "tallas" y "precios".');
          setImportLoading(false);
          return;
        }

        setImportProgress('Subiendo imágenes al servidor...');
        const imageMap = {}; // Maps local file name to public URL

        if (importImageFiles && importImageFiles.length > 0) {
          for (let i = 0; i < importImageFiles.length; i++) {
            const file = importImageFiles[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 9)}_${Date.now()}.${fileExt}`;
            const filePath = `variants/${fileName}`;

            setImportProgress(`Subiendo imagen: ${file.name} (${i + 1}/${importImageFiles.length})...`);
            
            const { error: uploadError } = await supabase.storage
              .from('product-images')
              .upload(filePath, file);

            if (uploadError) {
              console.error('Error al subir imagen ' + file.name, uploadError.message);
              continue;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(filePath);

            imageMap[file.name.trim().toLowerCase()] = publicUrl;
          }
        }

        setImportProgress('Procesando productos...');
        // Group by product name
        const productsMap = {};

        dataRows.forEach(row => {
          const nameVal = row[idx.nombre]?.trim();
          if (!nameVal) return;

          if (!productsMap[nameVal]) {
            const detailsArray = row[idx.detalles] 
              ? row[idx.detalles].split('|').map(d => d.trim()).filter(d => d.length > 0)
              : [];
            
            const firstPriceArray = row[idx.precios] ? row[idx.precios].split(',').map(p => parseFloat(p.trim()) || 0) : [0];
            const firstCostArray = row[idx.costos] ? row[idx.costos].split(',').map(c => parseFloat(c.trim()) || 0) : [0];
            const firstOriginalArray = row[idx.originales] ? row[idx.originales].split(',').map(o => o.trim() ? parseFloat(o.trim()) : null) : [null];

            productsMap[nameVal] = {
              name: nameVal,
              description: row[idx.descripcion]?.trim() || '',
              category: row[idx.categoria]?.trim() || CATEGORIES[0],
              subcategory: idx.subcategoria !== -1 ? row[idx.subcategoria]?.trim() || '' : '',
              is_featured: row[idx.destacado]?.trim().toUpperCase() === 'TRUE',
              details: detailsArray,
              price: firstPriceArray[0] || 0,
              cost_price: firstCostArray[0] || 0,
              original_price: firstOriginalArray[0] || null,
              variants: []
            };
          }

          // Build variant sizes arrays/objects
          const sizesList = row[idx.tallas] ? row[idx.tallas].split(',').map(s => s.trim()) : ['Única'];
          const stocksList = row[idx.stock] ? row[idx.stock].split(',').map(s => parseInt(s.trim(), 10) || 0) : [1];
          const pricesList = row[idx.precios] ? row[idx.precios].split(',').map(p => parseFloat(p.trim()) || 0) : [0];
          const costsList = row[idx.costos] ? row[idx.costos].split(',').map(c => parseFloat(c.trim()) || 0) : [0];
          const originalPricesList = row[idx.originales] ? row[idx.originales].split(',').map(o => o.trim() ? parseFloat(o.trim()) : null) : [null];

          const stock_by_size = {};
          const price_by_size = {};
          const cost_price_by_size = {};
          const original_price_by_size = {};

          sizesList.forEach((sz, sIdx) => {
            stock_by_size[sz] = stocksList[sIdx] !== undefined ? stocksList[sIdx] : 1;
            price_by_size[sz] = pricesList[sIdx] !== undefined ? pricesList[sIdx] : 0;
            cost_price_by_size[sz] = costsList[sIdx] !== undefined ? costsList[sIdx] : 0;
            original_price_by_size[sz] = originalPricesList[sIdx] !== undefined ? originalPricesList[sIdx] : null;
          });

          // Match image filename to public URL
          const csvImageFilename = row[idx.nombre_imagen_archivo]?.trim().toLowerCase();
          const imageUrl = imageMap[csvImageFilename] || '/images/liquid_brun.png';

          const variantIdx = productsMap[nameVal].variants.length + 1;

          productsMap[nameVal].variants.push({
            color_name: `Variante ${variantIdx}`,
            color_hex: '#000000',
            image_url: imageUrl,
            sizes: sizesList,
            stock_by_size,
            price_by_size,
            cost_price_by_size,
            original_price_by_size
          });
        });

        // Insert into database
        let insertedCount = 0;
        const productsArray = Object.values(productsMap);

        for (let i = 0; i < productsArray.length; i++) {
          const product = productsArray[i];
          setImportProgress(`Guardando producto ${i + 1}/${productsArray.length}: ${product.name}...`);

          // 1. Insert product
          const { data: productData, error: productError } = await supabase
            .from('products')
            .insert({
              name: product.name,
              description: product.description,
              price: product.price,
              original_price: product.original_price,
              cost_price: product.cost_price,
              category: product.category,
              subcategory: product.subcategory,
              details: product.details,
              is_featured: product.is_featured
            })
            .select()
            .single();

          if (productError) {
            console.error('Error al insertar producto ' + product.name, productError.message);
            continue;
          }

          const productId = productData.id;

          // 2. Insert variants linked to product
          for (const variant of product.variants) {
            const { error: variantError } = await supabase
              .from('product_variants')
              .insert({
                product_id: productId,
                color_name: variant.color_name,
                color_hex: variant.color_hex,
                image_url: variant.image_url,
                sizes: variant.sizes,
                stock_by_size: variant.stock_by_size,
                price_by_size: variant.price_by_size,
                cost_price_by_size: variant.cost_price_by_size,
                original_price_by_size: variant.original_price_by_size
              });

            if (variantError) {
              console.error('Error al insertar variante del producto ' + product.name, variantError.message);
            }
          }
          insertedCount++;
        }

        alert(`¡Importación masiva completada! Se crearon ${insertedCount} productos con éxito.`);
        setImportCsvFile(null);
        setImportImageFiles([]);
        setImportLoading(false);
        setImportProgress('');
        fetchProducts(); // Refresh list
      };

      reader.readAsText(importCsvFile);
    } catch (err) {
      console.error(err);
      alert('Error general durante la importación: ' + err.message);
      setImportLoading(false);
    }
  };

  // Pre-fill hero settings state
  useEffect(() => {
    if (heroSettings) {
      setHeroTitle(heroSettings.hero_title || '');
      setHeroSubtitle(heroSettings.hero_subtitle || '');
      setHeroCta(heroSettings.hero_cta || '');
    }
  }, [heroSettings]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProductsList(data || []);
    } catch (err) {
      console.error('Error al cargar productos:', err.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSession(data.session);
    } catch (err) {
      console.error('Error de login detallado:', err);
      const errMsg = err.message || err.error_description || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      setAuthError('Error de acceso: ' + (errMsg === '{}' ? 'Credenciales incorrectas o problema de red' : errMsg));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    if (email.trim().toLowerCase() !== 'admin@gmail.com') {
      setAuthError('Solo se permite registrar el correo admin@gmail.com como administrador.');
      setAuthLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert('Administrador registrado. Ya puedes iniciar sesión con estas credenciales.');
      setIsRegistering(false);
    } catch (err) {
      setAuthError('Error en registro: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // Form handlers
  const handleAddVariant = () => {
    setVariants([...variants, { color_name: `Variante ${variants.length + 1}`, color_hex: '#000000', sizes: [], stock_by_size: {}, price_by_size: {}, cost_price_by_size: {}, original_price_by_size: {}, file: null, previewUrl: '' }]);
  };

  const handleRemoveVariant = (index) => {
    if (variants.length === 1) return;
    const newVariants = [...variants];
    if (newVariants[index].previewUrl && newVariants[index].file) {
      URL.revokeObjectURL(newVariants[index].previewUrl);
    }
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleVariantFileChange = (index, file) => {
    if (!file) return;
    const newVariants = [...variants];
    if (newVariants[index].previewUrl && newVariants[index].file) {
      URL.revokeObjectURL(newVariants[index].previewUrl);
    }
    newVariants[index].file = file;
    newVariants[index].previewUrl = URL.createObjectURL(file);
    setVariants(newVariants);
  };

  const handleSizeToggle = (variantIndex, size) => {
    const newVariants = [...variants];
    const sizeIndex = newVariants[variantIndex].sizes.indexOf(size);
    if (!newVariants[variantIndex].stock_by_size) newVariants[variantIndex].stock_by_size = {};
    if (!newVariants[variantIndex].price_by_size) newVariants[variantIndex].price_by_size = {};
    if (!newVariants[variantIndex].cost_price_by_size) newVariants[variantIndex].cost_price_by_size = {};
    if (!newVariants[variantIndex].original_price_by_size) newVariants[variantIndex].original_price_by_size = {};
    
    if (sizeIndex > -1) {
      newVariants[variantIndex].sizes.splice(sizeIndex, 1);
      delete newVariants[variantIndex].stock_by_size[size];
      delete newVariants[variantIndex].price_by_size[size];
      delete newVariants[variantIndex].cost_price_by_size[size];
      delete newVariants[variantIndex].original_price_by_size[size];
    } else {
      newVariants[variantIndex].sizes.push(size);
      newVariants[variantIndex].stock_by_size[size] = 1;
      newVariants[variantIndex].price_by_size[size] = price ? parseFloat(price) : 0; // Default to general price
      newVariants[variantIndex].cost_price_by_size[size] = costPrice ? parseFloat(costPrice) : 0; // Default to general cost
      newVariants[variantIndex].original_price_by_size[size] = originalPrice ? parseFloat(originalPrice) : null;
    }
    setVariants(newVariants);
  };

  const handlePriceChange = (variantIndex, size, val) => {
    const newVariants = [...variants];
    if (!newVariants[variantIndex].price_by_size) newVariants[variantIndex].price_by_size = {};
    newVariants[variantIndex].price_by_size[size] = val !== '' ? parseFloat(val) : '';
    setVariants(newVariants);
  };

  const handleCostChange = (variantIndex, size, val) => {
    const newVariants = [...variants];
    if (!newVariants[variantIndex].cost_price_by_size) newVariants[variantIndex].cost_price_by_size = {};
    newVariants[variantIndex].cost_price_by_size[size] = val !== '' ? parseFloat(val) : '';
    setVariants(newVariants);
  };

  const handleOriginalPriceChange = (variantIndex, size, val) => {
    const newVariants = [...variants];
    if (!newVariants[variantIndex].original_price_by_size) newVariants[variantIndex].original_price_by_size = {};
    newVariants[variantIndex].original_price_by_size[size] = val !== '' ? parseFloat(val) : null;
    setVariants(newVariants);
  };

  const handleStockChange = (variantIndex, size, qty) => {
    const newVariants = [...variants];
    if (!newVariants[variantIndex].stock_by_size) {
      newVariants[variantIndex].stock_by_size = {};
    }
    newVariants[variantIndex].stock_by_size[size] = parseInt(qty, 10) || 0;
    setVariants(newVariants);
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
      
      // If we deleted the product that was currently being edited, clear edit state
      if (productToEdit?.id === productId && onClearEdit) {
        onClearEdit();
      }
    } catch (err) {
      alert('Error al eliminar producto: ' + err.message);
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    // Validations
    if (!name.trim() || !price || parseFloat(price) <= 0) {
      alert('Por favor ingresa un nombre válido y un precio mayor a 0.');
      return;
    }

    const invalidVariant = variants.some(v => !v.file || v.sizes.length === 0);
    if (invalidVariant) {
      alert('Cada variante debe tener una Imagen seleccionada y al menos un Tamaño disponible.');
      return;
    }

    setSubmitLoading(true);

    try {
      // 1. Insert product general info
      const detailsArray = detailsInput.split('\n').map(d => d.trim()).filter(d => d.length > 0);
      const productPrice = parseFloat(price);
      const productOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;
      const productCostPrice = costPrice ? parseFloat(costPrice) : 0;

      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          name: name.trim(),
          description: description.trim(),
          price: productPrice,
          original_price: productOriginalPrice,
          cost_price: productCostPrice,
          category,
          subcategory,
          details: detailsArray,
          is_featured: isFeatured
        })
        .select()
        .single();

      if (productError) throw productError;

      const productId = productData.id;

      // 2. Upload images and insert variants
      for (const variant of variants) {
        const fileExt = variant.file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 9)}_${Date.now()}.${fileExt}`;
        const filePath = `variants/${fileName}`;

        // Upload to bucket
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, variant.file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        // Insert variant row linked to product
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert({
            product_id: productId,
            color_name: variant.color_name.trim(),
            color_hex: variant.color_hex,
            image_url: publicUrl,
            sizes: variant.sizes,
            stock_by_size: variant.stock_by_size || {},
            price_by_size: variant.price_by_size || {},
            original_price_by_size: variant.original_price_by_size || {},
            cost_price_by_size: variant.cost_price_by_size || {}
          });

        if (variantError) throw variantError;
      }

      // Success cleanup
      alert('¡Producto creado con éxito!');
      setName('');
      setDescription('');
      setPrice('');
      setOriginalPrice('');
      setCostPrice('');
      setCategory(CATEGORIES[0]);
      setSubcategory('');
      setDetailsInput('');
      setIsFeatured(false);
      
      // Clean previews
      variants.forEach(v => {
        if (v.previewUrl && v.file) URL.revokeObjectURL(v.previewUrl);
      });
      setVariants([{ color_name: 'Variante 1', color_hex: '#000000', sizes: [], stock_by_size: {}, price_by_size: {}, cost_price_by_size: {}, original_price_by_size: {}, file: null, previewUrl: '' }]);
      
      // Refresh products list
      fetchProducts();

    } catch (err) {
      console.error(err);
      alert('Error en creación: ' + err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!productToEdit) return;

    // Validations
    if (!name.trim() || !price || parseFloat(price) <= 0) {
      alert('Por favor ingresa un nombre válido y un precio mayor a 0.');
      return;
    }

    const invalidVariant = variants.some(v => (!v.file && !v.previewUrl) || v.sizes.length === 0);
    if (invalidVariant) {
      alert('Cada variante debe tener una Imagen seleccionada y al menos un Tamaño disponible.');
      return;
    }

    setSubmitLoading(true);

    try {
      const detailsArray = detailsInput.split('\n').map(d => d.trim()).filter(d => d.length > 0);
      const productPrice = parseFloat(price);
      const productOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;
      const productCostPrice = costPrice ? parseFloat(costPrice) : 0;

      // 1. Update product general info
      const { error: productError } = await supabase
        .from('products')
        .update({
          name: name.trim(),
          description: description.trim(),
          price: productPrice,
          original_price: productOriginalPrice,
          cost_price: productCostPrice,
          category,
          subcategory,
          details: detailsArray,
          is_featured: isFeatured
        })
        .eq('id', productToEdit.id);

      if (productError) throw productError;

      // 2. Upload images for new/modified variants and compile all variant objects
      const processedVariants = [];
      for (const variant of variants) {
        let imageUrl = variant.previewUrl; // default to existing URL

        if (variant.file) {
          // Upload new image
          const fileExt = variant.file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 9)}_${Date.now()}.${fileExt}`;
          const filePath = `variants/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, variant.file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          imageUrl = publicUrl;
        }

        processedVariants.push({
          product_id: productToEdit.id,
          color_name: variant.color_name.trim(),
          color_hex: variant.color_hex,
          image_url: imageUrl,
          sizes: variant.sizes,
          stock_by_size: variant.stock_by_size || {},
          price_by_size: variant.price_by_size || {},
          original_price_by_size: variant.original_price_by_size || {},
          cost_price_by_size: variant.cost_price_by_size || {}
        });
      }

      // 3. Delete existing variants of this product in database
      const { error: deleteVariantsError } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productToEdit.id);

      if (deleteVariantsError) throw deleteVariantsError;

      // 4. Insert new variant rows
      const { error: insertVariantsError } = await supabase
        .from('product_variants')
        .insert(processedVariants);

      if (insertVariantsError) throw insertVariantsError;

      alert('¡Producto actualizado con éxito!');
      
      // Clean preview URLs to avoid leaks
      variants.forEach(v => {
        if (v.previewUrl && v.file) URL.revokeObjectURL(v.previewUrl);
      });

      // Clear edit mode in parent
      if (onClearEdit) onClearEdit();

      // Refresh list
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el producto: ' + err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSaveHeroSettings = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const updates = [
        { key: 'hero_title', value: heroTitle.trim() },
        { key: 'hero_subtitle', value: heroSubtitle.trim() },
        { key: 'hero_cta', value: heroCta.trim() }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({ key: update.key, value: update.value });
        
        if (error) throw error;
      }

      alert('¡Configuración del Hero guardada con éxito!');
      
      if (onUpdateSettings) {
        onUpdateSettings({
          hero_title: heroTitle.trim(),
          hero_subtitle: heroSubtitle.trim(),
          hero_cta: heroCta.trim()
        });
      }
    } catch (err) {
      console.error(err);
      alert('Error al guardar ajustes del Hero: ' + err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9F6] flex flex-col overflow-y-auto text-zinc-900">
      
      {/* Top Header */}
      <div className="bg-[#3CA9E5] px-6 py-4 flex items-center justify-between sticky top-0 z-10 text-white shadow-sm border-b border-white/20">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 text-white hover:text-white rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
            aria-label="Cerrar panel de administración"
          >
            <X size={18} />
          </button>
          <h1 className="text-lg font-black uppercase tracking-wider">Zapatería Admin</h1>
        </div>

        {session && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-100 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            Cerrar Sesión
          </button>
        )}
      </div>

      {/* Tab bar navigation if logged in */}
      {session && (
        <div className="bg-zinc-100 flex justify-center gap-6 py-2.5 px-6 border-b border-zinc-200">
          <button
            onClick={() => setActiveTab('products')}
            className={`text-xs font-black uppercase tracking-wider pb-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'products'
                ? 'border-[#3CA9E5] text-[#3CA9E5]'
                : 'border-transparent text-zinc-450 hover:text-[#3CA9E5]'
            }`}
          >
            Gestión de Calzado
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`text-xs font-black uppercase tracking-wider pb-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'hero'
                ? 'border-[#3CA9E5] text-[#3CA9E5]'
                : 'border-transparent text-zinc-450 hover:text-[#3CA9E5]'
            }`}
          >
            Diseño del Hero
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`text-xs font-black uppercase tracking-wider pb-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'sales'
                ? 'border-[#3CA9E5] text-[#3CA9E5]'
                : 'border-transparent text-zinc-450 hover:text-[#3CA9E5]'
            }`}
          >
            Ventas y Ganancias
          </button>
        </div>
      )}

      {/* LOGIN OR ADMIN SECTION */}
      {!session ? (
        /* AUTHENTICATION SCREEN */
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl text-left"
          >
            <h2 className="text-xl font-bold uppercase tracking-widest text-center mb-2">
              {isRegistering ? 'Crear Administrador' : 'Acceso Admin'}
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-light text-center mb-6">
              {isRegistering ? 'Registra tu correo admin@gmail.com' : 'Ingresa tus credenciales para administrar la tienda'}
            </p>

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="ej: admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3 py-2.5 focus:outline-none focus:border-black dark:focus:border-white rounded-none text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3 py-2.5 focus:outline-none focus:border-black dark:focus:border-white rounded-none text-zinc-900 dark:text-white"
                />
              </div>

              {authError && (
                <p className="text-xs text-rose-500 font-medium">{authError}</p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#3CA9E5] hover:bg-[#258ec7] text-white text-xs font-bold py-3.5 uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-55 transition-all"
              >
                {isRegistering ? <UserPlus size={14} /> : <LogIn size={14} />}
                {authLoading ? 'Procesando...' : isRegistering ? 'Registrar Cuenta' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setAuthError('');
                }}
                className="text-xs text-zinc-400 hover:text-black dark:hover:text-white underline cursor-pointer"
              >
                {isRegistering ? '¿Ya tienes cuenta? Iniciar Sesión' : '¿Primer inicio? Registrar Cuenta de Admin'}
              </button>
            </div>
          </motion.div>
        </div>
      ) : activeTab === 'products' ? (
        /* PRODUCTS MANAGEMENT INTERFACE */
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* LEFT: Add/Edit Product Form (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-bold uppercase tracking-widest pb-3 mb-6">
              {productToEdit ? 'Editar Calzado Existente' : 'Agregar Nuevo Calzado'}
            </h2>

            {!productToEdit && (
              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-850 mb-6 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Importación Masiva de Catálogo (CSV + Fotos)</h3>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-550 font-light leading-relaxed">
                  Llene el catálogo en Excel y expórtelo como CSV. Seleccione el archivo CSV y luego arrastre todas las imágenes que correspondan al catálogo.
                  <a href="#" onClick={handleDownloadTemplate} className="text-amber-500 hover:underline font-semibold ml-1.5 cursor-pointer">
                    Descargar Plantilla CSV
                  </a>
                </p>
                
                <form onSubmit={handleImportCSV} className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">1. Archivo CSV (.csv)</label>
                      <input 
                        type="file" 
                        accept=".csv" 
                        required
                        onChange={(e) => setImportCsvFile(e.target.files[0])}
                        className="w-full text-[10px] text-zinc-500 border border-zinc-300 dark:border-zinc-800 px-2 py-1.5 bg-white dark:bg-zinc-900 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">2. Imágenes del Catálogo (múltiples)</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        onChange={(e) => setImportImageFiles(Array.from(e.target.files))}
                        className="w-full text-[10px] text-zinc-500 border border-zinc-300 dark:border-zinc-800 px-2 py-1.5 bg-white dark:bg-zinc-900 cursor-pointer"
                      />
                      {importImageFiles.length > 0 && (
                        <p className="text-[9px] text-emerald-500 mt-1 font-semibold">✓ {importImageFiles.length} imágenes seleccionadas</p>
                      )}
                    </div>
                  </div>

                  {importLoading ? (
                    <div className="bg-zinc-100 dark:bg-zinc-900 p-3 text-center border border-zinc-200 dark:border-zinc-800">
                      <div className="animate-pulse text-xs text-amber-500 font-semibold">{importProgress}</div>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full bg-[#FFC107] hover:bg-[#FFD54F] text-black text-[10px] font-bold py-2.5 uppercase tracking-[0.2em] shadow-sm transition-all cursor-pointer"
                    >
                      Iniciar Importación Masiva
                    </button>
                  )}
                </form>
              </div>
            )}

            <form onSubmit={productToEdit ? handleUpdateProduct : handleSubmitProduct} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Nombre del Calzado</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Air Max Speed Turf Blue"
                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-850 px-3 py-2.5 focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Categoría</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setSubcategory('');
                      }}
                      className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-850 px-3 py-2.5 focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Subcategoría</label>
                    <select
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      disabled={!SUBCATEGORIES[category]}
                      className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-850 px-3 py-2.5 focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white disabled:opacity-50"
                    >
                      {!SUBCATEGORIES[category] && <option value="">Ninguna</option>}
                      {SUBCATEGORIES[category] && (
                        <>
                          <option value="">Seleccionar Subcategoría</option>
                          {SUBCATEGORIES[category].map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Price, Original Price, & Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Precio de Venta ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="79.99"
                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-850 px-3 py-2.5 focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Costo al Proveedor ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="25.00"
                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-850 px-3 py-2.5 focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Precio Antiguo ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Opcional"
                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-850 px-3 py-2.5 focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Is Featured Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-zinc-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                />
                <label htmlFor="is_featured" className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-450 cursor-pointer select-none">
                  Destacar este calzado en el Hero (Carrusel de Portada)
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Descripción del Calzado</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Zapatillas de alto rendimiento con suela de goma antideslizante, upper de malla transpirable y amortiguación reactiva para máxima comodidad durante todo el día..."
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-850 px-3 py-2.5 focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white resize-none"
                />
              </div>

              {/* Details & Material */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Características Técnicas (Una por línea)</label>
                <textarea
                  rows="4"
                  value={detailsInput}
                  onChange={(e) => setDetailsInput(e.target.value)}
                  placeholder={`Ej: Marca: Nike&#10;Material Exterior: Cuero y Malla transpirable&#10;Suela: Goma de alta tracción&#10;Ajuste: Cordones&#10;Estilo: Deportivo / Casual`}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-850 px-3 py-2.5 focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white resize-none"
                />
                <p className="text-[9px] text-zinc-400 mt-1">Escribe cada característica en una línea separada. Ej: Marca, Material, Suela, Tipo de cierre, Estilo...</p>
              </div>

              {/* VARIANTS BUILDER */}
              <div className="space-y-4 border-t border-zinc-200 dark:border-zinc-850 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Variantes de Imagen</h3>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                    Agregar Variante
                  </button>
                </div>

                <div className="space-y-6">
                  {variants.map((variant, vIdx) => (
                    <div 
                      key={vIdx} 
                      className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-250 dark:border-zinc-850 space-y-4 relative"
                    >
                      {/* Delete Variant Button */}
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(vIdx)}
                          className="absolute top-2 right-2 text-zinc-400 hover:text-rose-500 p-1 cursor-pointer"
                          aria-label="Remove variant"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Auto Name display */}
                        <div className="flex items-center text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                          <span>{variant.color_name || `Variante ${vIdx + 1}`}</span>
                        </div>

                        {/* Image File Selector */}
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Foto de la Variante</label>
                          <div className="flex items-center gap-2">
                            <label className="flex-grow flex items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-1.5 px-3 cursor-pointer text-[10px] text-zinc-500 hover:border-black dark:hover:border-white">
                              <ImageIcon size={12} className="mr-1.5" />
                              {variant.file ? 'Cambiar foto' : variant.previewUrl ? 'Mantener foto actual' : 'Subir foto'}
                              <input
                                type="file"
                                accept="image/*"
                                required={!variant.file && !variant.previewUrl}
                                onChange={(e) => handleVariantFileChange(vIdx, e.target.files[0])}
                                className="hidden"
                              />
                            </label>
                            {variant.previewUrl && (
                              <div className="w-8 h-10 border bg-zinc-100 overflow-hidden flex-shrink-0">
                                <img src={variant.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Sizes selection */}
                      <div>
                        <span className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5">Tallas Disponibles (Size):</span>
                        <div className="flex flex-wrap gap-1.5">
                          {AVAILABLE_SIZES.map(size => {
                            const isChecked = variant.sizes.includes(size);
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => handleSizeToggle(vIdx, size)}
                                className={`text-[10px] font-semibold px-2.5 py-1 border transition-all cursor-pointer ${
                                  isChecked
                                    ? 'bg-black text-[#FAF9F6] border-black dark:bg-white dark:text-zinc-950 dark:border-white font-bold'
                                    : 'border-zinc-200 dark:border-zinc-850 text-zinc-450 hover:border-zinc-455'
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>

                        {/* Active sizes details inputs */}
                        {variant.sizes && variant.sizes.length > 0 && (
                          <div className="mt-3 space-y-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                            <span className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Precios e Inventario por Talla:</span>
                            <div className="space-y-2.5">
                              {variant.sizes.map(size => (
                                <div key={size} className="flex flex-wrap items-center gap-3 bg-white dark:bg-zinc-900/50 p-2.5 border border-zinc-200 dark:border-zinc-850">
                                  <span className="text-[10px] font-bold w-12 text-zinc-600 dark:text-zinc-350">{size}</span>
                                  
                                  {/* Stock */}
                                  <div className="flex flex-col min-w-16 flex-1">
                                    <label className="text-[8px] font-bold uppercase text-zinc-400 dark:text-zinc-500 mb-0.5">Stock</label>
                                    <input
                                      type="number"
                                      min="0"
                                      required
                                      value={variant.stock_by_size?.[size] ?? 1}
                                      onChange={(e) => handleStockChange(vIdx, size, e.target.value)}
                                      className="w-full text-xs border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-white px-2 py-1 outline-none focus:border-black dark:focus:border-white"
                                      placeholder="Cant."
                                    />
                                  </div>

                                  {/* Precio Venta */}
                                  <div className="flex flex-col min-w-20 flex-1">
                                    <label className="text-[8px] font-bold uppercase text-zinc-400 dark:text-zinc-500 mb-0.5">Precio ($)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      required
                                      value={variant.price_by_size?.[size] ?? ''}
                                      onChange={(e) => handlePriceChange(vIdx, size, e.target.value)}
                                      className="w-full text-xs border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-white px-2 py-1 outline-none focus:border-black dark:focus:border-white"
                                      placeholder="Venta"
                                    />
                                  </div>

                                  {/* Costo */}
                                  <div className="flex flex-col min-w-20 flex-1">
                                    <label className="text-[8px] font-bold uppercase text-zinc-400 dark:text-zinc-500 mb-0.5">Costo ($)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={variant.cost_price_by_size?.[size] ?? ''}
                                      onChange={(e) => handleCostChange(vIdx, size, e.target.value)}
                                      className="w-full text-xs border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-white px-2 py-1 outline-none focus:border-black dark:focus:border-white"
                                      placeholder="Costo"
                                    />
                                  </div>

                                  {/* Precio Oferta */}
                                  <div className="flex flex-col min-w-20 flex-1">
                                    <label className="text-[8px] font-bold uppercase text-zinc-400 dark:text-zinc-500 mb-0.5">Oferta ($)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={variant.original_price_by_size?.[size] ?? ''}
                                      onChange={(e) => handleOriginalPriceChange(vIdx, size, e.target.value)}
                                      className="w-full text-xs border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-white px-2 py-1 outline-none focus:border-black dark:focus:border-white"
                                      placeholder="Opcional"
                                    />
                                  </div>

                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Submit / Action buttons */}
              <div className="space-y-2 pt-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-[#3CA9E5] hover:bg-[#258ec7] text-white text-xs font-bold py-4 uppercase tracking-[0.25em] flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-55 transition-all"
                >
                  {submitLoading ? (
                    <>{productToEdit ? 'Actualizando producto...' : 'Subiendo producto y variantes...'}</>
                  ) : (
                    <>{productToEdit ? 'Guardar Cambios del Producto' : 'Publicar Producto en la Tienda'}</>
                  )}
                </button>

                {productToEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onClearEdit) onClearEdit();
                    }}
                    className="w-full border border-zinc-300 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white text-xs font-semibold py-3 uppercase tracking-[0.2em] transition-all cursor-pointer"
                  >
                    Cancelar Edición (Crear Nuevo)
                  </button>
                )}
              </div>

            </form>
          </div>

          {/* RIGHT: Existing Products List (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col max-h-[85vh] overflow-hidden">
            <h2 className="text-base font-bold uppercase tracking-widest pb-3 mb-4">Calzados Existentes ({productsList.length})</h2>

            {loadingProducts ? (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-400 py-12">
                Cargando listado de productos...
              </div>
            ) : productsList.length === 0 ? (
              <div className="flex-grow flex items-center justify-center text-xs text-zinc-400 py-12">
                No hay productos en la base de datos.
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto divide-y divide-zinc-200 dark:divide-zinc-850 pr-1">
                {productsList.map((product) => {
                  const mainVariant = product.product_variants?.[0];
                  const isEditingThis = productToEdit?.id === product.id;
                  
                  return (
                    <div key={product.id} className="py-3.5 flex gap-3 items-center justify-between">
                      <div className="flex gap-3 min-w-0">
                        {/* Thumbnail */}
                        <div className="w-10 h-12 bg-zinc-100 dark:bg-zinc-950 overflow-hidden border border-zinc-200 dark:border-zinc-850 flex-shrink-0">
                          {mainVariant?.image_url ? (
                            <img src={mainVariant.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                              <ImageIcon size={14} />
                            </div>
                          )}
                        </div>

                        {/* Titles */}
                        <div className="min-w-0 flex flex-col justify-center text-left">
                          <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide truncate flex items-center gap-1.5">
                            {product.name}
                            {product.is_featured && (
                              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                                Destacado
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            {product.category} {product.subcategory ? `> ${product.subcategory}` : ''} • <span className="font-bold text-zinc-650 dark:text-zinc-350">${product.price.toFixed(2)} USD (C${(product.price * 36.5).toFixed(0)})</span>
                          </p>
                          {/* Variants preview */}
                          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-wider">
                            {product.product_variants?.length || 0} {product.product_variants?.length === 1 ? 'Variante de Imagen' : 'Variantes de Imagen'}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => {
                            if (isEditingThis) {
                              if (onClearEdit) onClearEdit();
                            } else {
                              if (onEdit) onEdit(product);
                            }
                          }}
                          className={`p-2 cursor-pointer transition-colors ${
                            isEditingThis 
                              ? 'text-emerald-600 hover:text-emerald-700' 
                              : 'text-zinc-405 hover:text-emerald-600 dark:hover:text-emerald-450'
                          }`}
                          title="Editar producto"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-zinc-400 hover:text-rose-500 p-2 cursor-pointer transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : activeTab === 'hero' ? (
        /* HERO SETTINGS INTERFACE */
        <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 text-left">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Diseño del Hero (Banner de Portada)</h2>
              <p className="text-xs text-zinc-400 mt-1 font-light">Cambia los textos que tus clientes ven en la parte principal de la tienda en tiempo real.</p>
            </div>

            <form onSubmit={handleSaveHeroSettings} className="space-y-6 border-t border-zinc-200 dark:border-zinc-850 pt-6">
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Título Principal</label>
                <input
                  type="text"
                  required
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Ej: NUEVA COLECCIÓN MÍNIMA"
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-850 px-3 py-2.5 focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Subtítulo / Eslogan</label>
                <textarea
                  rows="4"
                  required
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Ej: Siluetas limpias, tonos neutros y cortes contemporáneos diseñados para durar..."
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-850 px-3 py-2.5 focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Texto del Botón de Llamada a la Acción (CTA)</label>
                <input
                  type="text"
                  required
                  value={heroCta}
                  onChange={(e) => setHeroCta(e.target.value)}
                  placeholder="Ej: Explorar Colección"
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-850 px-3 py-2.5 focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-[#3CA9E5] hover:bg-[#258ec7] text-white text-xs font-bold py-4 uppercase tracking-[0.25em] flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-55 transition-all"
                >
                  {submitLoading ? 'Guardando ajustes...' : 'Guardar Ajustes del Hero'}
                </button>
              </div>

            </form>
          </div>
        </div>
      ) : activeTab === 'sales' ? (
        <div className="flex-1 w-full bg-white dark:bg-zinc-950">
          <SalesAdminTab />
        </div>
      ) : null}
    </div>
  );
}
