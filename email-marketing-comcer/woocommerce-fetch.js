#!/usr/bin/env node

/**
 * Script para obtener productos de WooCommerce
 * Uso: node woocommerce-fetch.js [product_id|all]
 */

import 'dotenv/config';
import https from 'https';

const WC_URL = process.env.WC_STORE_URL || 'https://comcer.cl';
const WC_KEY = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;

/**
 * Realiza petición a la API de WooCommerce
 */
function fetchWooCommerce(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${WC_URL}/wp-json/wc/v3${endpoint}`;

    const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');

    const options = {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`API Error ${res.statusCode}: ${json.message || 'Unknown error'}`));
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    }).on('error', (e) => {
      reject(new Error(`Request error: ${e.message}`));
    });
  });
}

/**
 * Obtiene un producto específico por ID
 */
async function getProduct(productId) {
  console.log(`📦 Obteniendo producto ID: ${productId}...`);
  const product = await fetchWooCommerce(`/products/${productId}`);
  return formatProduct(product);
}

/**
 * Obtiene todos los productos
 */
async function getAllProducts() {
  console.log('📦 Obteniendo todos los productos...');
  const products = await fetchWooCommerce('/products?per_page=100&status=publish');
  return products.map(formatProduct);
}

/**
 * Formatea un producto para uso en newsletters
 */
function formatProduct(product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    regularPrice: product.regular_price,
    salePrice: product.sale_price,
    description: product.short_description?.replace(/<[^>]*>/g, '') || '',
    fullDescription: product.description?.replace(/<[^>]*>/g, '') || '',
    categories: product.categories?.map(c => c.name) || [],
    tags: product.tags?.map(t => t.name) || [],
    images: product.images?.map(img => ({
      url: img.src,
      alt: img.alt || product.name,
      id: img.id
    })) || [],
    attributes: product.attributes?.map(attr => ({
      name: attr.name,
      options: attr.options
    })) || [],
    stockStatus: product.stock_status,
    permalink: product.permalink
  };
}

/**
 * Genera datos listos para Claude
 */
function generateClaudeData(product) {
  return {
    productName: product.name,
    productSlug: product.slug,
    price: product.price ? `$${product.price}` : 'Consultar',
    description: product.description,
    benefits: extractBenefits(product),
    specs: product.attributes.length > 0 ?
      product.attributes.map(a => ({ label: a.name, value: a.options.join(', ') })) :
      [{ label: 'Producto', value: product.name }],
    images: product.images,
    productUrl: product.permalink,
    categories: product.categories
  };
}

/**
 * Extrae beneficios de la descripción
 */
function extractBenefits(product) {
  const benefits = [];

  // Beneficios genéricos B2B
  const genericBenefits = [
    { title: 'Envío a Todo Chile', description: 'Cobertura nacional', icon: '🚚' },
    { title: 'Calidad Certificada', description: 'Productos IPEL', icon: '✓' },
    { title: 'Precios Mayoristas', description: 'Descuentos por volumen', icon: '💰' }
  ];

  // Si tiene descuento, agregarlo
  if (product.salePrice && product.regularPrice !== product.salePrice) {
    benefits.push({
      title: 'Oferta Especial',
      description: `Antes $${product.regularPrice}, ahora $${product.salePrice}`,
      icon: '🏷️'
    });
  }

  return [...benefits, ...genericBenefits.slice(0, 3 - benefits.length)];
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Uso: node woocommerce-fetch.js [comando]

Comandos:
  all           Lista todos los productos
  <id>          Obtiene un producto específico
  test          Prueba la conexión

Ejemplos:
  node woocommerce-fetch.js all
  node woocommerce-fetch.js 123
  node woocommerce-fetch.js test
`);
  process.exit(0);
}

const command = args[0];

(async () => {
  try {
    if (command === 'test') {
      console.log('🔄 Probando conexión con WooCommerce...');
      const products = await fetchWooCommerce('/products?per_page=1');
      console.log('✅ Conexión exitosa!');
      console.log(`   Productos encontrados: ${products.length}`);
      console.log(`   Primer producto: ${products[0]?.name || 'N/A'}`);
    } else if (command === 'all') {
      const products = await getAllProducts();
      console.log(`\n✅ ${products.length} productos encontrados:\n`);
      products.forEach(p => {
        console.log(`  [${p.id}] ${p.name} - $${p.price || 'N/A'}`);
      });
      console.log('\n💡 Usa: node woocommerce-fetch.js <id> para ver detalles');
    } else {
      const productId = parseInt(command);
      if (isNaN(productId)) {
        console.error('❌ ID de producto inválido');
        process.exit(1);
      }

      const product = await getProduct(productId);
      const claudeData = generateClaudeData(product);

      console.log('\n📦 PRODUCTO OBTENIDO:\n');
      console.log(JSON.stringify(claudeData, null, 2));

      // Guardar para Claude
      const fs = await import('fs');
      const filename = `product-${productId}-data.json`;
      fs.writeFileSync(filename, JSON.stringify(claudeData, null, 2));
      console.log(`\n💾 Datos guardados en: ${filename}`);
      console.log(`📋 Listo para: claude -p "Crear newsletter desde ${filename}"`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
