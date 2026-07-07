export const products = [
  {
    id: '1',
    name: 'Air Max Speed Turf Blue',
    price: 85.00,
    originalPrice: 110.00,
    category: 'Hombre',
    subcategory: 'Deportivo',
    brand: 'Nike',
    description: 'Zapatillas de alto rendimiento con correa ajustable en el mediopié para un ajuste firme. Suela de tracción duradera ideal para la cancha o las calles.',
    sizes: ['40', '41', '42', '43'],
    colors: [],
    image: '/images/air_max_speed_turf.png',
    images: ['/images/air_max_speed_turf.png'],
    rating: 4.8,
    reviewsCount: 120,
    details: [
      'Marca: Nike',
      'Material Exterior: Cuero y Malla transpirable',
      'Suela: Goma de alta tracción',
      'Ajuste: Cordones y Correa de velcro',
      'Estilo: Deportivo / Retro'
    ]
  },
  {
    id: '2',
    name: 'Air Jordan Retro 7',
    price: 150.00,
    originalPrice: 180.00,
    category: 'Hombre',
    subcategory: 'Tenis',
    brand: 'Nike',
    description: 'Extrait de estilo urbano. El Air Jordan Retro 7 combina cuero premium con un diseño clásico de caña alta que ofrece máxima comodidad y soporte dinámico.',
    sizes: ['41', '42', '43', '44'],
    colors: [],
    image: '/images/air_jordan_retro.png',
    images: ['/images/air_jordan_retro.png'],
    rating: 4.9,
    reviewsCount: 85,
    details: [
      'Marca: Nike (Jordan)',
      'Material Exterior: Cuero premium y Durabuck',
      'Suela: Unidad Air-Sole encapsulada',
      'Ajuste: Cordones',
      'Estilo: Casual / Urbano'
    ]
  },
  {
    id: '3',
    name: 'Air Max 270 Dusty',
    price: 120.00,
    originalPrice: 150.00,
    category: 'Mujer',
    subcategory: 'Tenis',
    brand: 'Nike',
    description: 'La primera unidad Max Air de Nike diseñada para el día a día. Estilo moderno, tejido transpirable y amortiguación elástica de 270 grados.',
    sizes: ['37', '38', '39', '40'],
    colors: [],
    image: '/images/air_max_270.png',
    images: ['/images/air_max_270.png'],
    rating: 4.7,
    reviewsCount: 140,
    details: [
      'Marca: Nike',
      'Material Exterior: Tejido de malla transpirable',
      'Suela: Cámara de aire 270 Max Air',
      'Ajuste: Elástico con cordones',
      'Estilo: Deportivo / Casual'
    ]
  }
];

export const categories = ['Todos', 'Hombre', 'Mujer', 'Niños', 'Marcas', 'Novedades', 'Ofertas'];

export const subcategories = {
  'Hombre': ['Tenis', 'Casual', 'Formal', 'Deportivo', 'Botas', 'Sandalias', 'Mocasines', 'Ofertas'],
  'Mujer': ['Tenis', 'Casual', 'Tacones', 'Flats', 'Sandalias', 'Botines', 'Botas', 'Ofertas'],
  'Niños': ['Niño', 'Niña', 'Escolar', 'Deportivo', 'Sandalias', 'Bebés']
};

