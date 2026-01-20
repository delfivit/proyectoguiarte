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

### ⚠️ IMPORTANTE: Tu API key estará visible en el código

Como este es un sitio estático (HTML/JavaScript), la API key **debe estar** en el código frontend y será visible para cualquiera que vea el código fuente. Esto es **normal y esperado** para sitios estáticos.

### 🔒 Cómo proteger tu API key:

**1. Restricciones de dominio (CRÍTICO):**
- Ve a [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
- Edita tu API key
- En **Application restrictions**, selecciona **HTTP referrers (web sites)**
- Agrega **SOLO** estos referrers:
  - `https://proyectoguiarte.com/*`
  - `https://*.proyectoguiarte.com/*`
- **NO agregues** `*`, `localhost`, ni ningún otro dominio

Con estas restricciones, aunque alguien vea tu API key en GitHub, **NO podrá usarla** desde otros sitios web.

**2. Restricciones de API (CRÍTICO):**
- En **API restrictions**, selecciona **Restrict key**
- Marca **SOLO**:
  - ✅ Maps JavaScript API
  - ✅ Places API (New)
- **NO marques** otras APIs

Esto limita qué servicios de Google puede usar esta key.

**3. Configurar alertas de presupuesto:**
- Ve a [Google Cloud Billing](https://console.cloud.google.com/billing)
- Selecciona tu proyecto
- Ve a **Budgets & alerts**
- Crea un presupuesto de $10 USD por mes
- Configura alertas al 50%, 90% y 100%

Recibirás emails si hay uso inusual.

**4. Monitorear el uso:**
- Ve a [Google Cloud Console - APIs](https://console.cloud.google.com/apis/dashboard)
- Revisa regularmente las métricas de uso
- Deberías ver muy pocos requests diarios (solo de tu sitio)

### 🚨 Si Google te avisa de "API key expuesta":

Es normal recibir este aviso porque GitHub es público. **No te preocupes** si:
- ✅ Tenés restricciones de dominio configuradas
- ✅ Tenés restricciones de API configuradas
- ✅ Solo funciona en tu dominio

Google escanea repositorios públicos y envía alertas automáticas, pero con las restricciones correctas, tu key está segura.

### ✅ Verificar que las restricciones funcionan:

1. Abrí tu sitio (https://proyectoguiarte.com)
2. El autocompletado de direcciones debería funcionar ✅
3. Abrí la consola del navegador (F12)
4. Copia tu API key
5. Intentá usarla desde otro sitio (ej: jsfiddle.net)
6. Debería dar error "RefererNotAllowedMapError" ✅

Si da error, significa que las restricciones están funcionando correctamente.

## Alternativa: Ocultar la API key (solo si tenés backend)

Si en el futuro agregás un backend (Node.js, PHP, Python, etc.), podés:
1. Mover la API key al servidor
2. Crear un endpoint proxy (ej: `/api/places`)
3. Guardar la key en variables de entorno (.env)
4. El frontend llama a tu API, no directamente a Google

Pero para sitios estáticos como el tuyo, **no hay forma de ocultar la key**, y **no es necesario** con las restricciones correctas.

---

## Notas de Seguridad (Resumen)

- **NUNCA** compartas tu API key públicamente en GitHub o redes sociales ← ⚠️ Esto ya pasó, pero está OK con restricciones
- Siempre restringe tu API key a tu dominio específico ← ✅ CRÍTICO
- Monitorea el uso en Google Cloud Console ← ✅ Recomendado
- Configura alertas de presupuesto si querés asegurarte de no exceder los créditos gratis ← ✅ Recomendado
