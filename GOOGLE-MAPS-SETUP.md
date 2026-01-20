# Configuración de Google Maps API

## Paso 1: Crear API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services > Library**
4. Busca y habilita las siguientes APIs:
   - **Places API**
   - **Maps JavaScript API**
   - **Geocoding API** (opcional, por si acaso)

## Paso 2: Crear una API Key

1. Ve a **APIs & Services > Credentials**
2. Click en **Create Credentials > API Key**
3. Se creará tu API key
4. **IMPORTANTE**: Click en "Edit API key" para restringirla:
   - En **Application restrictions**, selecciona **HTTP referrers (web sites)**
   - Agrega estos referrers:
     - `https://proyectoguiarte.com/*`
     - `https://*.proyectoguiarte.com/*`
     - `http://localhost/*` (solo para desarrollo)
   - En **API restrictions**, selecciona **Restrict key**
   - Marca solo:
     - Places API
     - Maps JavaScript API

## Paso 3: Actualizar el código

1. Abre el archivo `productos-alimentos.html`
2. Busca esta línea (aproximadamente línea 37):
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDCNVgy-MT0an_M2Z3MQ46XUCqyYSdZ9P8&libraries=places&language=es&region=AR" async defer></script>
   ```
3. Tu API key (`AIzaSyDCNVgy-MT0an_M2Z3MQ46XUCqyYSdZ9P8`) ya está configurada ✅

## Paso 4: Verificar que funciona

1. Abre tu página de alimentos
2. Agrega productos al carrito
3. Haz click en "Finalizar Pedido"
4. En el formulario, comienza a escribir una dirección en el campo "Dirección de entrega"
5. Deberías ver sugerencias de Google Maps aparecer
6. Selecciona una dirección y verás que se autocompleta

## Cómo funciona

- El campo de dirección ahora tiene autocompletado inteligente
- Cuando escribís una dirección, Google Maps sugiere direcciones reales
- Al seleccionar una dirección:
  - Se completa automáticamente la dirección formateada
  - Si está disponible, también se completa el código postal
  - Asegura que la dirección sea válida y exista

## Ventajas

✅ Evita errores de tipeo en direcciones
✅ Asegura que las direcciones existan
✅ Autocompleta el código postal
✅ Mejora la experiencia del usuario
✅ Facilita la logística de entrega

## Costos

Google Maps Platform ofrece:
- **$200 USD de crédito gratis por mes**
- Places Autocomplete cuesta $2.83 por 1000 sesiones
- Con el crédito gratis podés hacer aproximadamente **70,000 autocompletados por mes sin costo**
- Para un e-commerce pequeño/mediano, es completamente gratis

## Notas de Seguridad

- **NUNCA** compartas tu API key públicamente en GitHub o redes sociales
- Siempre restringe tu API key a tu dominio específico
- Monitorea el uso en Google Cloud Console
- Configura alertas de presupuesto si querés asegurarte de no exceder los créditos gratis
