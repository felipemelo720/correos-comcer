# Sistema de Newsletter Automática Autónoma

## Arquitectura

Este sistema usa **Claude Code en modo autónomo** (`-p`) para generar newsletters sin intervención humana.

```
┌─────────────────┐
│   Cron Job      │ (ejecuta cada semana)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  auto-newsletter.sh                     │
│  (wrapper que lanza Claude autónomo)    │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  CLAUDE AGENTE AUTÓNOMO                 │
│                                         │
│  1. Lee contexto previo                 │
│  2. Conecta a WooCommerce API           │
│  3. Filtra productos disponibles        │
│  4. Selecciona mejor candidato          │
│  5. Genera newsletter HTML              │
│  6. Sube imágenes a Cloudinary          │
│  7. Ejecuta build producción            │
│  8. Actualiza contexto                  │
│  9. Reporta resultado                   │
└─────────────────────────────────────────┘
```

## Archivos del Sistema

- **`auto-newsletter.sh`** - Script principal que ejecuta Claude autónomo
- **`.newsletter-context.json`** - Memoria persistente (productos usados, historial)
- **`.env`** - Credenciales (WooCommerce, Cloudinary)
- **`woocommerce-fetch.js`** - Helper manual para pruebas

## Uso Manual

```bash
# Ejecutar una vez
./auto-newsletter.sh

# Ver qué haría Claude (dry-run manual)
node woocommerce-fetch.js all
```

## Configuración de Cron

### Opción 1: Cada lunes a las 9am
```bash
crontab -e
```

```cron
0 9 * * 1 cd /home/w10/correos-comcer/email-marketing-comcer && ./auto-newsletter.sh >> /var/log/newsletter-automation.log 2>&1
```

### Opción 2: Cada 15 días (1 y 15 del mes)
```cron
0 9 1,15 * * cd /home/w10/correos-comcer/email-marketing-comcer && ./auto-newsletter.sh >> /var/log/newsletter-automation.log 2>&1
```

### Verificar logs
```bash
tail -f /var/log/newsletter-automation.log
```

## Contexto Persistente

El archivo `.newsletter-context.json` mantiene el estado:

```json
{
  "usedProducts": [34667, 34471],
  "lastRun": "2025-01-20T09:00:00Z",
  "history": [
    {
      "productId": 34667,
      "date": "2025-01-15",
      "template": "newsletter-servilleta-2025-01-15.html",
      "productName": "SERVILLETA NAPKIN..."
    }
  ],
  "settings": {
    "minDaysBetweenReuse": 30
  }
}
```

### Reglas de Rotación

- **30 días mínimo** antes de reusar un producto
- Prioriza productos con:
  - Precio definido
  - Imágenes disponibles
  - Stock disponible
- Nunca repite la misma semana

## Monitoreo

### Verificar última ejecución
```bash
cat .newsletter-context.json | grep lastRun
```

### Ver historial
```bash
cat .newsletter-context.json | grep -A 10 history
```

### Productos disponibles
```bash
node woocommerce-fetch.js all
```

## Troubleshooting

### Error: "No quedan productos disponibles"
- Todos los productos fueron usados en los últimos 30 días
- Esperar a que pase el período de rotación
- O reducir `minDaysBetweenReuse` en el contexto

### Error de autenticación WooCommerce
- Verificar credenciales en `.env`
- Probar: `node woocommerce-fetch.js test`

### Build fallido
- Revisar que el template HTML generado sea válido
- Verificar que las imágenes estén accesibles
- Ejecutar manualmente: `pnpm build`

## Costos

Cada ejecución tiene un presupuesto máximo de **$0.75 USD** configurado con `--max-budget-usd`.

Con frecuencia semanal: ~$3/mes

## Comandos Útiles

```bash
# Ver productos más usados
cat .newsletter-context.json | jq '.history | group_by(.productId) | map({product: .[0].productId, count: length}) | sort_by(-.count)'

# Resetear contexto (cuidado)
echo '{"usedProducts":[],"lastRun":null,"history":[],"settings":{"frequency":"weekly","minDaysBetweenReuse":30}}' > .newsletter-context.json

# Forzar producto específico (manual)
claude -p "Genera newsletter para producto ID 34667 siguiendo las instrucciones del sistema..." --allowedTools "Read" "Write" "Bash(curl *)" "Bash(pnpm *)"
```
