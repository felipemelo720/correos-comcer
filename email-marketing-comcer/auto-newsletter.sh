#!/bin/bash

# ==============================================================================
# NEWSLETTER AUTOMÁTICA AUTÓNOMA CON CLAUDE
# ==============================================================================
# Este script ejecuta Claude en modo autónomo (-p) para generar newsletters.
# Claude controla TODO el flujo: obtiene datos, genera HTML, sube imágenes, build.
#
# Uso: ./auto-newsletter.sh
# Programar con cron: 0 9 * * 1 /path/to/auto-newsletter.sh >> /var/log/newsletter.log 2>&1
# ==============================================================================

set -e

cd "$(dirname "$0")"

echo "=========================================="
echo "🤖 NEWSLETTER AUTOMÁTICA AUTÓNOMA"
echo "   Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# Ejecutar Claude en modo autónomo
claude -p "
Eres un agente autónomo de generación de newsletters para Comcer.

## TU TAREA (hazlo todo autónomamente):

### 1. LEER CONTEXTO PREVIO
- Lee el archivo .newsletter-context.json
- Revisa qué productos ya se han usado (usedProducts)
- Revisa el historial para evitar repetir temas

### 2. OBTENER PRODUCTOS DISPONIBLES
- Lee credenciales de .env (WC_CONSUMER_KEY, WC_CONSUMER_SECRET, WC_STORE_URL)
- Haz petición curl a: https://comcer.cl/wp-json/wc/v3/products?per_page=100&status=publish
- Autenticación Basic Auth con consumer_key:consumer_secret
- Parsea el JSON de respuesta

### 3. FILTRAR Y SELECCIONAR PRODUCTO
- Filtra productos que NO estén en usedProducts del contexto
- Si todos fueron usados, elige el más antiguo (mayor minDaysBetweenReuse)
- Prioriza productos con:
  * Precio definido (mayor a 0)
  * Imágenes disponibles
  * Stock_status = 'instock'
- Selecciona el mejor candidato

### 4. GENERAR NEWSLETTER
- Usa el producto seleccionado
- Crea archivo en emails/newsletter-[slug-producto]-[fecha].html
- Usa componentes existentes: x-hero-section, x-benefit-grid, x-product-specs, x-contact-info
- Diseño B2B formal (usted/su)
- Incluye: hero con imagen principal, 3-4 beneficios, especificaciones, CTA cotización
- Colores: azul #1e40af como acento
- Responsivo con clases sm:
- NO modifiques templates existentes

### 5. SUBIR IMÁGENES (si es necesario)
- Si las imágenes de WooCommerce necesitan optimización
- Ejecuta: node cloudinary-upload.js [imagenes]
- Usa las URLs de Cloudinary generadas

### 6. BUILD DE PRODUCCIÓN
- Ejecuta: pnpm build
- Verifica que el build sea exitoso
- Revisa que el archivo esté en build_production/

### 7. ACTUALIZAR CONTEXTO
- Actualiza .newsletter-context.json:
  * Agrega product_id a usedProducts
  * Actualiza lastRun con timestamp actual
  * Agrega entrada al history con: productId, date, template, productName

### 8. REPORTAR RESULTADO
- Indica qué producto se seleccionó y por qué
- Muestra el archivo creado
- Confirma que el build fue exitoso
- Si hubo errores, repórtalos claramente

## REGLAS IMPORTANTES:
- Nunca repitas un producto que ya se usó recientemente (menos de 30 días)
- Si hay error en API, reporta y detente
- Si hay error en build, reporta y detente
- Siempre actualiza el contexto al finalizar (éxito o error)
- Usa tono profesional en el reporte final
" \
  --allowedTools "Read" "Write" "Edit" "Bash(curl *)" "Bash(node *)" "Bash(pnpm *)" "Bash(rm *)" "Bash(ls *)" "Bash(cat *)" "Glob" "Grep" \
  --max-turns 40 \
  --max-budget-usd 1.00 \
  --output-format json

EXIT_CODE=$?

echo ""
echo "=========================================="
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Ejecución completada"
else
    echo "❌ Ejecución fallida (código: $EXIT_CODE)"
fi
echo "   Fin: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="

exit $EXIT_CODE
