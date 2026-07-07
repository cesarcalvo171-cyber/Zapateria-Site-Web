import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle, ShieldCheck, Truck, ShoppingBag, Anchor, Plane } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

// Número de WhatsApp leído desde variables de entorno (.env.local)
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '';



export default function CheckoutModal({
  isOpen,
  onClose,
  total,
  discountPercent,
  shippingType = 'maritimo',
  shippingCost = 4,
  cartItems,
  onClearCart
}) {
  const [step, setStep] = useState(1); // 1: Datos, 2: Vista previa, 3: Éxito
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [orderNumber, setOrderNumber] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setClientName('');
      setClientPhone('');
      setErrors({});
      const randomOrderNum = 'WA-' + Math.floor(100000 + Math.random() * 900000);
      setOrderNumber(randomOrderNum);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (clientPhone.trim().length > 0 && clientPhone.trim().length < 7) {
      newErrors.clientPhone = 'El teléfono debe tener al menos 7 dígitos.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (validate()) setStep(2);
  };



  const generateWhatsAppMessage = () => {
    let msg = ` DETALLE DE LA ORDEN:\n\n`;
    msg += `    Cliente: ${clientName.trim() || 'Anónimo'}\n`;
    msg += `    Referencia: ${orderNumber || 'WA-000000'}\n\n`;

    cartItems.forEach((item) => {
      const variantName = item.selectedColor?.name || 'Variante 1';
      const sizeStr = item.selectedSize || 'Única';
      const quantityStr = `${item.quantity} ${item.quantity === 1 ? 'unidad' : 'unidades'}`;
      
      msg += `    Producto: ${item.name} (${variantName})\n\n`;
      msg += `    Talla: ${sizeStr}\n\n`;
      msg += `    Cantidad: ${quantityStr}\n\n`;
      
      let imageUrl = '';
      if (item.image) {
        if (item.image.startsWith('http')) {
          imageUrl = item.image;
        } else if (item.image.startsWith('/')) {
          const encodedPath = item.image.split('/').map(segment => encodeURIComponent(segment)).join('/');
          imageUrl = window.location.origin + encodedPath;
        }
      }

      if (imageUrl) {
        msg += `    Imagen de referencia: Ver Foto (${imageUrl})\n\n`;
      } else {
        msg += `    Imagen de referencia: Ver Foto\n\n`;
      }
    });

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discountAmount = (subtotal * discountPercent) / 100;

    msg += ` RESUMEN DE COMPRA:\n\n`;
    msg += `    Subtotal: $${subtotal.toFixed(2)}\n\n`;
    if (discountPercent > 0) {
      msg += `    Descuento (${discountPercent}%): -$${discountAmount.toFixed(2)}\n\n`;
    }
    msg += `    TOTAL A PAGAR: $${total.toFixed(2)}\n\n`;

    msg += ` PRÓXIMO PASO:\n`;
    msg += `Por favor, confírmanos si los datos de tu orden son correctos. En cuanto nos des el visto bueno, te enviaremos las instrucciones de pago detalladas de forma privada por este chat.\n\n`;
    msg += `Una vez coordinado el pago, procederemos con la preparación y el envío de tu fragancia.\n\n`;
    msg += `¡Quedamos a tu entera disposición! Si tienes alguna duda, escríbenos. ¡Que tengas un excelente día!`;

    return msg;
  };

  const handleSendWhatsApp = async () => {
    if (!WHATSAPP_NUMBER) {
      alert('⚠️ El número de WhatsApp no está configurado. Por favor, configura VITE_WHATSAPP_NUMBER en el archivo .env.local');
      return;
    }

    const randomOrderNum = orderNumber || ('WA-' + Math.floor(100000 + Math.random() * 900000));
    const subtotalCalc = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalCost = cartItems.reduce((acc, item) => acc + (item.cost_price || 0) * item.quantity, 0);
    // Ganancia es el total pagado (incluye envío y descuentos) menos el costo de perfumes (y menos costo de envío si asumimos que se paga íntegro al carrier)
    // Para simplificar: ganancia = total_amount - total_cost - shipping_cost
    const profit = total - totalCost - shippingCost;

    try {
      const saleId = crypto.randomUUID();

      // 1. Insert Sale
      const { error: saleError } = await supabase
        .from('sales')
        .insert({
          id: saleId,
          order_number: randomOrderNum,
          client_name: clientName.trim() || 'Anónimo',
          client_phone: clientPhone.trim() || null,
          shipping_type: shippingType,
          shipping_cost: shippingCost,
          total_amount: total,
          total_cost: totalCost,
          profit: profit,
          status: 'Pendiente'
        });

      if (saleError) throw saleError;

      // 2. Insert Sale Items
      const saleItems = cartItems.map(item => ({
        sale_id: saleId,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        sale_price: item.price,
        cost_price: item.cost_price || 0,
        selected_size: item.selectedSize || '',
        selected_color_name: item.selectedColor?.name || ''
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // 3. Decrease stock
      for (const item of cartItems) {
        const variant = item.product_variants?.find(v => v.color_name === item.selectedColor?.name);
        if (variant && variant.id && item.selectedSize) {
          await supabase.rpc('decrease_stock', {
            variant_id: variant.id,
            size_name: item.selectedSize,
            qty: item.quantity
          });
        }
      }
    } catch (err) {
      console.error('Error guardando la venta en Supabase:', err);
    }

    const message = generateWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    
    setOrderNumber(randomOrderNum);
    setStep(3);
    onClearCart();
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step === 3 ? null : onClose}
          className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-sm"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.3 }}
          className="relative bg-[#FAF9F6] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-zinc-100 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl rounded-none flex flex-col md:flex-row z-10"
        >
          {/* Close Button */}
          {step !== 3 && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-zinc-800/80 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 z-20 cursor-pointer transition-all"
            >
              <X size={18} />
            </button>
          )}

          {/* Form Side */}
          <div className="w-full md:w-3/5 p-6 sm:p-8 overflow-y-auto border-r border-zinc-200 dark:border-zinc-800">
            {/* Steps indicator */}
            {step !== 3 && (
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <span className={step === 1 ? 'text-black dark:text-white' : ''}>01. Tus datos</span>
                <ArrowRight size={10} />
                <span className={step === 2 ? 'text-black dark:text-white' : ''}>02. WhatsApp</span>
                <ArrowRight size={10} />
                <span className="opacity-40">03. Confirmación</span>
              </div>
            )}

            {/* STEP 1: Datos del cliente */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-5 text-left" noValidate>
                <div>
                  <h3 className="text-base font-semibold uppercase tracking-wider mb-1">¿Cómo te identificamos?</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
                    Estos datos opcionales se incluirán en el mensaje de WhatsApp para que la vendedora pueda identificarte fácilmente.
                  </p>
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Tu nombre <span className="text-zinc-300 dark:text-zinc-600 font-normal normal-case">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej: María García"
                    className="w-full text-xs bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 px-3 py-3 focus:outline-none focus:border-black dark:focus:border-white rounded-none text-zinc-950 dark:text-white transition-colors"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Tu WhatsApp <span className="text-zinc-300 dark:text-zinc-600 font-normal normal-case">(opcional)</span>
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => {
                      setClientPhone(e.target.value);
                      if (errors.clientPhone) setErrors({});
                    }}
                    placeholder="Ej: 04141234567"
                    className={`w-full text-xs bg-white dark:bg-zinc-950 border px-3 py-3 focus:outline-none rounded-none text-zinc-950 dark:text-white transition-colors ${
                      errors.clientPhone
                        ? 'border-rose-500'
                        : 'border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white'
                    }`}
                  />
                  {errors.clientPhone && (
                    <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.clientPhone}</p>
                  )}
                </div>



                {/* Note */}
                <div className="flex items-start gap-2.5 p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  <ShieldCheck size={22} className="flex-shrink-0 text-zinc-400 mt-0.5" />
                  <span>El pago y los detalles de envío se coordinan directamente con la vendedora por WhatsApp. No se realiza ningún cargo en este paso.</span>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="w-full bg-[#0A0A0A] dark:bg-[#FAF9F6] text-[#FAF9F6] dark:text-[#0A0A0A] hover:bg-zinc-800 dark:hover:bg-white text-xs font-bold py-3.5 uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
                  >
                    Revisar y Enviar por WhatsApp
                    <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Previsualización */}
            {step === 2 && (
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-semibold uppercase tracking-wider">Vista previa del mensaje</h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-zinc-400 hover:text-black dark:hover:text-white underline cursor-pointer"
                  >
                    ← Volver
                  </button>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
                  Este es el mensaje que se enviará a la vendedora. Incluye los links de las fotos de cada perfume para referencia visual.
                </p>

                <div className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 font-mono text-[10px] text-zinc-700 dark:text-zinc-300 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                  {generateWhatsAppMessage()}
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  <span className="text-base flex-shrink-0">💡</span>
                  <span>Los links de imagen solo funcionan si la tienda está publicada en internet. La vendedora puede abrirlos con un toque para ver la foto de cada perfume.</span>
                </div>

                <div className="pt-1">
                  <button
                    onClick={handleSendWhatsApp}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="14" height="14" fill="currentColor">
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                    </svg>
                    Confirmar y Enviar por WhatsApp
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Éxito */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-6 space-y-4"
              >
                <div className="text-emerald-500">
                  <CheckCircle size={56} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold uppercase tracking-wider">¡Pedido Enviado!</h3>
                  <p className="text-sm font-light text-zinc-500 dark:text-zinc-400">
                    Referencia: <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{orderNumber}</span>
                  </p>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm font-light">
                  Se abrió WhatsApp con los detalles de tu pedido. Recuerda <strong>presionar enviar</strong> en la aplicación para que la vendedora lo reciba.
                </p>

                <div className="text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-200 dark:border-zinc-800 w-full pt-3 text-center">
                  ¿No se abrió WhatsApp?{' '}
                  <button onClick={handleSendWhatsApp} className="text-emerald-600 dark:text-emerald-400 underline font-semibold cursor-pointer">
                    Intentar de nuevo
                  </button>
                </div>

                <div className="pt-3 w-full">
                  <button
                    onClick={onClose}
                    className="w-full bg-black dark:bg-white text-[#FAF9F6] dark:text-[#0A0A0A] hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold py-3.5 uppercase tracking-[0.25em] cursor-pointer transition-colors"
                  >
                    Volver a la Tienda
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Side */}
          <div className="w-full md:w-2/5 p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-950/20 flex flex-col justify-between text-left">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                Resumen de Compra
              </h3>

              {cartItems && cartItems.length > 0 ? (
                <div className="space-y-3 max-h-[28vh] overflow-y-auto mb-6 pr-1">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.selectedSize}-${item.selectedColor?.name}`} className="flex gap-3 text-xs">
                      <div className="w-10 aspect-[3/4] bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex-shrink-0 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold line-clamp-1 uppercase text-zinc-800 dark:text-zinc-200">{item.name}</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          Talla: {item.selectedSize} {item.product_variants && item.product_variants.length > 1 && item.selectedColor?.name ? `· ${item.selectedColor.name}` : ''}
                        </p>
                        <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-semibold mt-0.5">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-zinc-400 py-4 flex items-center gap-1.5 font-light">
                  <ShoppingBag size={14} /> El carrito está vacío.
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400 font-light">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Descuento ({discountPercent}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-0.5">
                <div className="flex justify-between font-bold text-[#D4AF37] text-sm">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {step !== 3 && (
                <div className="pt-3 flex items-center gap-1.5 text-[10px] font-light text-zinc-400 dark:text-zinc-500 leading-normal">
                  <Truck size={12} className="flex-shrink-0" />
                  <span>El pago y el envío se coordinan directamente con la vendedora por WhatsApp.</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
