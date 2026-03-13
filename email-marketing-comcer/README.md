# Email Marketing Comcer - Maizzle

Sistema de email marketing para Comcer, distribuidor oficial de productos IPEL, construido con Maizzle Framework.

## 📧 ¿Qué es Maizzle?

Maizzle es un framework moderno para crear emails HTML responsivos usando tecnologías web familiares:

### Características Principales

- **Tailwind CSS**: Usa utility classes para estilizar emails rápidamente
- **Componentes**: Sistema de componentes reutilizables
- **Build Process**: Convierte tu código moderno en HTML compatible con clientes de email
- **Hot Reload**: Vista previa en tiempo real mientras desarrollas
- **Optimización**: Inline automático de CSS, minificación, y más

### ¿Cómo Funciona?

1. **Escribes**: Código HTML moderno con Tailwind CSS y componentes
2. **Maizzle procesa**: 
   - Compila los componentes
   - Inline los estilos CSS
   - Optimiza las imágenes
   - Agrega fixes para Outlook
3. **Resultado**: HTML optimizado compatible con todos los clientes de email

### ¿Por Qué Maizzle?

- **Desarrollo Rápido**: No más tablas anidadas complejas escritas a mano
- **Consistencia**: Componentes reutilizables garantizan diseño uniforme
- **Moderno**: Usa las mismas herramientas que el desarrollo web actual
- **Confiable**: Genera código que funciona en Gmail, Outlook, Apple Mail, etc.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 16+
- pnpm (recomendado) o npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/marianomelo/email-marketing-comcer.git
cd email-marketing-comcer

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Cloudinary
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm dev
```

Abre http://localhost:3003 para ver los templates.

### Build de Producción

```bash
# Generar HTML optimizado
pnpm build
```

Los archivos se generan en `build_production/`

## 📤 Integración con Brevo (Sendinblue)

Comcer (Comercial Atocha) utiliza **Brevo** como plataforma de email marketing.

### Proceso de Implementación

1. **Generar el HTML de producción**:
   ```bash
   pnpm build production
   ```

2. **Abrir el archivo generado**:
   ```bash
   # El archivo estará en:
   build_production/[nombre-template].html
   ```

3. **Copiar el código HTML completo**

4. **En Brevo**:
   - Crear nueva campaña
   - Seleccionar "Editor HTML"
   - Pegar el código del archivo generado
   - Verificar vista previa
   - Enviar pruebas antes de la campaña final

### Notas Importantes para Brevo

- El HTML ya está optimizado con estilos inline
- Las imágenes usan URLs de Cloudinary (no necesitas subirlas a Brevo)
- Los links de tracking de Brevo se agregan automáticamente
- Verifica que los merge tags de Brevo estén correctos si usas personalización

## 📧 Templates Disponibles

### commerce-simple.html
Template promocional para productos, actualmente configurado con:
- **Producto**: Servilleta Nobby Doble Hoja Blanca 40×39,5
- **Características**: Ficha técnica, precio, imágenes del producto
- **CTA**: Botón directo a la tienda online

## 🖼️ Gestión de Imágenes

### Subir Imágenes a Cloudinary

1. Coloca las imágenes en la carpeta `images/`
2. Ejecuta:
```bash
pnpm run cloudinary
```

El script automáticamente:
- ✅ Detecta todas las imágenes nuevas
- ✅ Las convierte a formato WebP
- ✅ Genera versiones responsivas
- ✅ Evita subir duplicados
- ✅ Crea un reporte con todas las URLs

### URLs Generadas

Las URLs de las imágenes se guardan en `cloudinary-urls.md` con:
- URL estándar
- URL WebP optimizada
- Versiones responsivas (300w, 600w, 1200w)

## 🤖 Crear Templates con Claude Code

### Proceso de Creación

1. **Iniciar Claude Code**:
   ```bash
   # En el directorio del proyecto
   claude
   ```

2. **Dar Instrucciones Claras**:
   ```
   "Crea un template de email para [producto] con:
   - Header con logo de Comcer
   - Sección hero con imagen del producto
   - Ficha técnica con especificaciones
   - Precio y CTA de compra
   - Galería de imágenes
   - Footer con información de contacto"
   ```

3. **Claude Code automáticamente**:
   - Leerá `CLAUDE.md` para entender el proyecto
   - **Creará un NUEVO archivo** (nunca modificará los existentes)
   - Usará las clases de responsividad móvil
   - Aplicará el tono B2B profesional
   - Subirá imágenes a Cloudinary si es necesario

### Mejores Prácticas para Instrucciones

- **Sé específico** con los elementos que necesitas
- **Proporciona textos** exactos si los tienes
- **Incluye URLs** de imágenes o archivos locales
- **Menciona el público objetivo** (ej: "para restaurantes premium")

### Ejemplo de Instrucción Completa
```
"Crea un template de newsletter B2B para el producto [nombre] de IPEL.
Usa estas imágenes: /ruta/a/imagenes/
El precio es $XX.XXX por caja.
Incluye especificaciones técnicas: [lista]
Enfócate en ahorro operativo y eficiencia."
```

## ✅ Validación de Templates

### 1. Vista Previa Local
```bash
pnpm dev
# Abre http://localhost:3003
```

### 2. Verificar Responsividad
- Usa las herramientas de desarrollador del navegador
- Activa vista móvil (iPhone/Android)
- Verifica que las columnas se apilen correctamente

### 3. Build de Producción
```bash
pnpm build
# Revisa el HTML en build_production/
```

### 4. Checklist de Validación
- [ ] Logo de Comcer visible
- [ ] Imágenes optimizadas en WebP
- [ ] Texto legible en móvil
- [ ] CTAs funcionando correctamente
- [ ] Información de contacto completa
- [ ] Enlaces a productos correctos
- [ ] Precio e información técnica precisos

### 5. Pruebas de Email
- Envía pruebas a diferentes clientes de email
- Verifica en Gmail, Outlook, Apple Mail
- Usa herramientas como [Litmus](https://litmus.com) o [Email on Acid](https://www.emailonacid.com)

## 🛠️ Personalización

### Modificar el Template

1. Edita `emails/commerce-simple.html`
2. Los cambios se reflejan automáticamente en el navegador
3. Usa componentes de Maizzle como `<x-button>`, `<x-spacer>`, etc.

### Agregar Nuevos Productos

**IMPORTANTE**: Nunca modifiques los templates existentes. Siempre crea uno nuevo.

1. **Duplica** `commerce-simple.html` con un nombre descriptivo:
   ```bash
   # Ejemplo: para servilletas cocktail
   cp emails/commerce-simple.html emails/servilletas-cocktail.html
   ```

2. **Edita el nuevo archivo** con:
   - Información del producto específico
   - Precios actualizados
   - Nuevas imágenes (sube con `pnpm run cloudinary`)
   - Enlaces de compra correctos

3. **Mantén el original intacto** como plantilla base

### Estilos

- Usa clases de Tailwind CSS
- Los estilos se inline automáticamente en producción
- Configuración en `tailwind.config.js`

## 📁 Estructura del Proyecto

```
├── emails/              # Templates de email
├── images/              # Imágenes originales
├── components/          # Componentes reutilizables
├── layouts/             # Layout base HTML
├── build_production/    # HTML final optimizado
├── cloudinary-upload.js # Script de subida de imágenes
└── config.js           # Configuración de Maizzle
```

### Archivos Clave

- **emails/**: Aquí van todos los templates. Cada archivo `.html` es un email
- **layouts/main.html**: Layout base con `<html>`, `<head>`, estilos globales
- **components/**: Elementos reutilizables como botones, espaciadores, divisores
- **config.js**: Configuración de desarrollo (servidor, paths, etc.)
- **config.production.js**: Optimizaciones para producción (inline CSS, minify)

## 🔧 Configuración

### Variables de Entorno (.env)

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Maizzle Config

- `config.js`: Configuración de desarrollo
- `config.production.js`: Configuración de producción

## 📚 Recursos

- [Documentación de Maizzle](https://maizzle.com/docs)
- [Cloudinary](https://cloudinary.com/documentation)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu branch (`git checkout -b feature/NuevoProducto`)
3. Commit tus cambios (`git commit -m 'Agregar producto X'`)
4. Push al branch (`git push origin feature/NuevoProducto`)
5. Abre un Pull Request

## 📄 Licencia

Proyecto privado de Comcer. Todos los derechos reservados.