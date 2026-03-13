# Claude Code - Guía de Trabajo

## Descripción del Proyecto
Este es un proyecto de email marketing para Comcer, distribuidor oficial de productos IPEL. Utiliza Maizzle como framework para generar emails HTML optimizados.

## Estructura del Proyecto

```
maizzle/
├── emails/               # Templates de email
│   ├── commerce-simple.html  # Template principal del producto Nobby
│   └── transactional.html    # Template ejemplo de Maizzle
├── images/              # Imágenes locales
├── components/          # Componentes reutilizables
├── layouts/             # Layout base
├── cloudinary-upload.js # Script para subir imágenes a Cloudinary
└── config.js           # Configuración de Maizzle
```

## Comandos Importantes

```bash
# Desarrollo local
pnpm dev                 # Servidor de desarrollo en http://localhost:3003

# Build de producción
pnpm build              # Genera HTML optimizado en build_production/

# Subir imágenes a Cloudinary
pnpm run cloudinary     # Sube y optimiza imágenes automáticamente
```

## Workflow de Imágenes

1. Las imágenes se colocan en la carpeta `images/`
2. Se ejecuta `pnpm run cloudinary` para subirlas
3. El script genera:
   - URLs WebP optimizadas
   - Versiones responsivas (300w, 600w, 1200w)
   - Cache para evitar re-subidas
   - Reporte en `cloudinary-urls.md`

## Template Principal

El template `commerce-simple.html` incluye:
- Header con logo de Comcer
- Hero section con imagen del producto
- Ficha técnica del producto
- Precio y botón de compra
- Galería de imágenes
- Beneficios del producto
- Footer con enlaces

## Consideraciones

- **Cloudinary**: Las credenciales están en `.env` (repo privado)
- **Estilos**: Usa Tailwind CSS con preset para email
- **Componentes**: Usa sintaxis `<x-component>` de Maizzle
- **Producción**: El build inline los estilos para compatibilidad

## Responsividad Móvil

Todos los templates deben incluir estas clases para móvil:

### Clases disponibles (definidas en layouts/main.html):
- `sm:block` - Display block en móvil
- `sm:w-full` - Ancho 100% en móvil
- `sm:mb-4`, `sm:mb-2` - Márgenes inferiores
- `sm:pr-0`, `sm:pl-0` - Eliminar padding lateral
- `sm:p-2`, `sm:p-4`, `sm:p-6` - Padding reducido
- `sm:text-3xl`, `sm:text-2xl`, `sm:text-base`, `sm:text-xs` - Tamaños de texto
- `sm:border-0`, `sm:border-b`, `sm:pb-4` - Bordes y espaciado

### Patrón para columnas responsivas:
```html
<!-- Dos columnas que se apilan en móvil -->
<table class="w-full">
  <tr>
    <td class="sm:w-full sm:block sm:mb-4 w-1/2 pr-4 sm:pr-0">
      <!-- Contenido columna 1 -->
    </td>
    <td class="sm:w-full sm:block w-1/2 pl-4 sm:pl-0">
      <!-- Contenido columna 2 -->
    </td>
  </tr>
</table>
```

### Enfoque B2B:
- Usar tono formal (usted/su en lugar de tú/tu)
- CTAs orientados a negocios: "Solicitar Cotización", "Ver Ficha Técnica"
- Incluir información técnica y especificaciones
- Destacar ROI y eficiencias operativas

## Información de Contacto Comcer

- 📧 Email: pedidos@comcer.cl
- 📞 Mesa Central: +56 2 2683 2575
- 💬 WhatsApp: +56 9 6676 7958
- 📍 Dirección: Av. Pedro Aguirre Cerda 4375, 9230002 Cerrillos, RM
- 🌐 Web: https://comcer.cl/contacto/

## Reglas Importantes

1. **NUNCA modificar templates existentes** - Siempre crear uno nuevo
2. **Nomenclatura clara** - Usar nombres descriptivos como `producto-variante.html`
3. **Mantener commerce-simple.html** como plantilla base de referencia
4. **Documentar cambios** - Agregar comentarios sobre qué producto es

## Mejores Prácticas de Diseño

### Contraste y Visibilidad
- **SIEMPRE** verificar el contraste entre texto y fondo
- Evitar texto blanco sobre fondos claros
- Agregar explícitamente clases de color de texto cuando sea necesario (ej: `text-white`)

### Uniformidad de Elementos
- Los grids de beneficios/características deben tener altura uniforme
- Usar `min-height` para garantizar consistencia visual
- Aplicar mismo padding y márgenes en elementos similares

### Patrón para grids uniformes:
```html
<!-- Beneficios con altura uniforme -->
<div class="bg-blue-50 rounded-lg p-6 sm:p-4 m-2" style="min-height: 120px;">
  <h4 class="m-0 mb-2 text-lg sm:text-base font-semibold text-blue-900">Título</h4>
  <p class="m-0 text-sm sm:text-xs text-gray-700">Descripción</p>
</div>
```

## Componentes Reutilizables

### Componentes Disponibles

#### 1. `hero-section`
Sección hero con título, subtítulo y CTA principal.

```html
<x-hero-section 
  title="Título Principal"
  subtitle="Texto descriptivo opcional"
  ctaText="Llamada a la acción"
  ctaUrl="https://comcer.cl/contacto"
  bgColor="bg-blue-600"
  bgImage="https://url-imagen.jpg"
/>
```

#### 2. `benefit-card` y `benefit-grid`
Tarjetas de beneficios con altura uniforme.

```html
<!-- Tarjeta individual -->
<x-benefit-card 
  title="Beneficio"
  description="Descripción del beneficio"
  icon="🚀"
  bgColor="bg-blue-50"
  titleColor="text-blue-900"
/>

<!-- Grid de beneficios -->
<x-benefit-grid 
  :benefits="[
    { title: 'Beneficio 1', description: 'Descripción 1', icon: '📦' },
    { title: 'Beneficio 2', description: 'Descripción 2', icon: '🚚' }
  ]"
/>
```

#### 3. `product-specs`
Tabla de especificaciones técnicas.

```html
<x-product-specs 
  title="Especificaciones Técnicas"
  :specs="[
    { label: 'Tipo', value: 'Servilleta Mesa' },
    { label: 'Color', value: 'Blanco' },
    { label: 'Medidas', value: '39,5 x 40 cm' }
  ]"
/>
```

#### 4. `contact-info`
Información de contacto con 3 variantes.

```html
<!-- Variante default -->
<x-contact-info />

<!-- Variante tarjetas -->
<x-contact-info variant="cards" />

<!-- Variante personal -->
<x-contact-info 
  variant="personal"
  personalName="Juan Pérez"
  personalRole="Ejecutivo de Ventas"
/>
```

#### 5. `cta-section`
Sección de llamada a la acción secundaria.

```html
<x-cta-section 
  title="Optimice sus costos"
  subtitle="Solicite una cotización"
  ctaText="Solicitar Cotización"
  ctaUrl="https://comcer.cl/contacto"
  secondaryText="O llámenos al"
  :secondaryLink="{ text: '+56 2 2683 2575', url: 'tel:+56226832575' }"
/>
```

#### 6. `header-logo` y `footer-links`
Header y footer consistentes.

```html
<!-- Header -->
<x-header-logo />

<!-- Footer -->
<x-footer-links 
  showContact="true"
  showUnsubscribe="true"
/>
```

### Uso de Componentes

1. Los componentes mantienen consistencia visual
2. Todos incluyen props con valores por defecto
3. Son totalmente responsivos con clases `sm:`
4. Siguen las mejores prácticas de contraste y uniformidad

## Próximos Pasos Sugeridos

1. Crear más templates para otros productos usando los componentes
2. Implementar sistema de variables para personalización
3. Agregar tests de renderizado en clientes de email
4. Configurar GitHub Actions para deploy automático