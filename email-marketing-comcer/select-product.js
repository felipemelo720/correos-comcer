const https = require('https');
const fs = require('fs');

// Cargar credenciales
require('dotenv').config();

const consumerKey = process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.WC_CONSUMER_SECRET;
const storeUrl = process.env.WC_STORE_URL || 'https://comcer.cl';

// Cargar contexto previo
let context = { usedProducts: [], history: [] };
try {
  context = JSON.parse(fs.readFileSync('.newsletter-context.json', 'utf8'));
} catch (e) {
  console.log('No se pudo cargar contexto previo, iniciando fresh');
}

// Función para hacer petición HTTP con Basic Auth
function fetchProducts() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const url = new URL('/wp-json/wc/v3/products', storeUrl);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('status', 'publish');

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Filtrar y priorizar productos
function selectBestProduct(products) {
  // Filtrar productos válidos
  const validProducts = products.filter(p => {
    const hasPrice = parseFloat(p.price) > 0;
    const hasImages = p.images && p.images.length > 0;
    const inStock = p.stock_status === 'instock';
    const notUsed = !context.usedProducts.includes(p.id);

    return hasPrice && hasImages && inStock && notUsed;
  });

  if (validProducts.length === 0) {
    // Si todos fueron usados, buscar el más antiguo
    const inStockProducts = products.filter(p =>
      parseFloat(p.price) > 0 &&
      p.images && p.images.length > 0 &&
      p.stock_status === 'instock'
    );

    if (inStockProducts.length === 0) {
      return null;
    }

    // Ordenar por fecha de creación (más antiguo primero)
    inStockProducts.sort((a, b) =>
      new Date(a.date_created) - new Date(b.date_created)
    );
    return inStockProducts[0];
  }

  // Priorizar por:
  // 1. Destacado (featured)
  // 2. Precio (productos más relevantes para B2B)
  // 3. Más reciente
  validProducts.sort((a, b) => {
    if (a.featured !== b.featured) return b.featured - a.featured;
    const priceA = parseFloat(a.price);
    const priceB = parseFloat(b.price);
    if (Math.abs(priceA - priceB) > 10000) return priceB - priceA;
    return new Date(b.date_created) - new Date(a.date_created);
  });

  return validProducts[0];
}

// Ejecutar
async function main() {
  try {
    console.log('Obteniendo productos de WooCommerce...');
    const products = await fetchProducts();
    console.log(`Total productos: ${products.length}`);

    const selected = selectBestProduct(products);

    if (!selected) {
      console.log('ERROR: No hay productos disponibles');
      process.exit(1);
    }

    console.log('\n=== PRODUCTO SELECCIONADO ===');
    console.log(`ID: ${selected.id}`);
    console.log(`Nombre: ${selected.name}`);
    console.log(`Slug: ${selected.slug}`);
    console.log(`Precio: $${selected.price}`);
    console.log(`Stock: ${selected.stock_status}`);
    console.log(`Categorías: ${selected.categories.map(c => c.name).join(', ')}`);
    console.log(`Imagen principal: ${selected.images[0]?.src}`);
    console.log(`URL: ${selected.permalink}`);

    // Guardar producto seleccionado para el siguiente paso
    fs.writeFileSync('selected-product.json', JSON.stringify(selected, null, 2));
    console.log('\nProducto guardado en selected-product.json');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
