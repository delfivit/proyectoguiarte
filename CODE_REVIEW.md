# 📋 Code Review - Proyecto Guiarte

**Fecha**: 3 de enero de 2026  
**Revisión**: Completa de HTML, CSS, JavaScript

---

## ✅ **ESTADO GENERAL**: Muy bueno

El código está limpio, bien estructurado y funcional. Se identificaron algunas oportunidades de mejora menores.

---

## 🔍 **HALLAZGOS PRINCIPALES**

### 1. ❌ **CRÍTICO: Código duplicado en HTML**

**Problema**: El header y footer están duplicados 4 veces (una por página).  
**Impacto**: Cualquier cambio (nuevo link, logo, redes sociales) requiere editar 4 archivos.  
**Ubicación**: `index.html`, `experiencias.html`, `productos.html`, `eventos.html`

**Solución recomendada**: 
- Opción A: Usar JavaScript para cargar header/footer desde archivos separados
- Opción B: Migrar a un sistema de templates (11ty, Hugo, etc.)
- Opción C (más simple): Usar PHP includes si el hosting lo soporta

---

### 2. ⚠️ **Google Tag Manager solo en index.html**

**Problema**: GTM solo está en `index.html`, falta en otras 3 páginas.  
**Impacto**: No se trackean visitas a Experiencias, Productos, Eventos.

**Ubicación**:
- ✅ `index.html` (líneas 8-14, 27-29)
- ❌ `experiencias.html` - falta
- ❌ `productos.html` - falta
- ❌ `eventos.html` - falta

**Fix**: Agregar el mismo código GTM en las otras 3 páginas.

---

### 3. 🎨 **Imágenes faltantes de productos (9 archivos)**

**Problema**: Referencias a imágenes que no existen en el workspace.

**Archivos faltantes**:
- `img-yogamat.jpg`
- `img-bloque.jpg`
- `img-straps.jpg`
- `img-pelota.jpg`
- `img-almohadon.jpg`
- `img-mala.jpg`
- `img-journal.jpg`
- `img-minijournal.jpg`
- `img-cartas.jpg`

**Ubicación**: `productos.html` (líneas 42, 54, 66, 78, 90, 102, 119, 131, 143)

**Estado**: Usuario confirmó que las agregará manualmente (OK ✓)

---

### 4. 🖼️ **Imágenes faltantes de eventos (3 archivos)**

**Problema**: Referencias a imágenes de eventos que no existen.

**Archivos faltantes**:
- `img-evento-oraculos.jpg`
- `img-evento-manifestacion.jpg`
- `img-evento-coffee-rave.jpg`

**Ubicación**: `eventos.html` (líneas 38, 45, 52)

---

### 5. 🎯 **Imágenes de hero/secciones no definidas**

**Problema**: CSS hace referencia a imágenes que no están en el workspace.

**Archivos faltantes**:
- `img-hero.jpg` (usado en `.hero` del index)
- `img-experiencias.jpg` (usado como poster del video)

**Ubicación**: 
- `styles.css` línea 88 (`background: url('img-hero.jpg')`)
- Video en `index.html` línea 114 (`poster="img-experiencias.jpg"`)

---

### 6. 📱 **Inconsistencia en atributos de accesibilidad**

**Problema**: `index.html` tiene atributos ARIA completos, pero las otras páginas no.

**Comparación**:

| Elemento | index.html | Otras páginas |
|----------|-----------|---------------|
| `role="banner"` en header | ✅ | ❌ |
| `aria-label` en navegación | ✅ | ❌ |
| `aria-label` en hamburger | ✅ | ✅ |
| `aria-expanded` en hamburger | ✅ | ✅ |

**Fix**: Agregar atributos ARIA faltantes en experiencias/productos/eventos.

---

### 7. 🔗 **Link de Spotify placeholder**

**Problema**: El link de Spotify apunta a `https://open.spotify.com` (genérico).

**Ubicación**: 
- `index.html` línea 78
- Footer en todas las páginas

**Fix**: Actualizar con URL específica del perfil/podcast de Proyecto Guiarte.

---

### 8. 🧩 **Script.js cargado innecesariamente en index.html**

**Problema**: `index.html` NO tiene la etiqueta `<script src="script.js"></script>` al final, pero las otras páginas SÍ.

**Estado actual**:
- ❌ `index.html` - NO tiene script.js (pero el hero scroll funciona porque está inline en el archivo?)
- ✅ `experiencias.html` - tiene script.js
- ✅ `productos.html` - tiene script.js + modal
- ✅ `eventos.html` - tiene script.js

**Posible problema**: El menú hamburger en `index.html` podría no funcionar si no está el script.

**Fix**: Agregar `<script src="script.js"></script>` antes de `</body>` en `index.html`.

---

### 9. 💾 **Console logs en producción**

**Problema**: El código tiene múltiples `console.log()` para debugging que deberían removerse en producción.

**Ubicación**: `script.js` líneas 83, 85, 88, 186, 202, 207, 223, 229, 236, 241, 244

**Ejemplos**:
```javascript
console.log('[form] Enviando a GAS_ENDPOINT:', GAS_ENDPOINT);
console.log('[sendToEndpoint] Intentando POST a:', url);
console.log('[jsonpRequest] Creando script con src:', src);
```

**Recomendación**: 
- Crear una función `debug()` que solo imprima si `DEBUG_MODE = true`
- O envolver en `if (window.location.hostname === 'localhost')`
- O usar herramientas de build para stripear logs en producción

---

### 10. 🎨 **CSS: Selector `.section-black` usado pero no definido completamente**

**Problema**: `.section-black` se usa en HTML pero en CSS solo aparece en media queries.

**Ubicación**: 
- Usado en: `index.html` línea 91, `experiencias.html` línea 33
- Definido en: CSS no tiene `.section-black{...}` base, solo se infiere

**Fix**: Agregar definición explícita:
```css
.section-black {
  background: var(--black);
  padding: 60px 0;
}
```

---

## 📊 **ANÁLISIS POR ARCHIVO**

### `index.html` (154 líneas)
- ✅ Estructura HTML5 correcta
- ✅ Meta tags completos
- ✅ Accesibilidad (ARIA) bien implementada
- ✅ Google Tag Manager presente
- ❌ Falta `<script src="script.js"></script>`
- ❌ Falta imagen `img-hero.jpg`
- ⚠️ Link de Spotify genérico

### `experiencias.html` (85 líneas)
- ✅ Estructura correcta
- ✅ Script.js incluido
- ❌ Falta Google Tag Manager
- ❌ Atributos ARIA incompletos vs index
- ✅ Grid responsive bien implementado

### `productos.html` (179 líneas)
- ✅ Modal funcional
- ✅ Botones "Comprar" con data-product correcto
- ❌ 9 imágenes de productos faltantes (usuario las agregará)
- ❌ Falta Google Tag Manager
- ❌ Atributos ARIA incompletos

### `eventos.html` (74 líneas)
- ✅ Grid de eventos bien estructurado
- ❌ 3 imágenes de eventos faltantes
- ❌ Falta Google Tag Manager
- ❌ Atributos ARIA incompletos
- ✅ Script.js incluido

### `styles.css` (316 líneas)
- ✅ Arquitectura CSS bien organizada
- ✅ Variables CSS (custom properties) bien usadas
- ✅ Mobile-first y responsive correcto
- ✅ Animaciones suaves (transitions)
- ⚠️ `.section-black` no definido explícitamente
- ✅ Prefijos vendor bien usados (`-webkit-`)
- ✅ Hamburger menu bien implementado

### `script.js` (251 líneas)
- ✅ JavaScript moderno (ES6+)
- ✅ Event listeners bien estructurados
- ✅ Validación de email correcta
- ✅ JSONP fallback bien implementado
- ✅ localStorage como backup
- ⚠️ Console logs en producción
- ✅ Manejo de errores robusto
- ✅ Accesibilidad (ESC key, aria-expanded)

### `save_to_doc.gs` (106 líneas)
- ✅ Google Apps Script bien estructurado
- ✅ doPost() y doGet() correctos
- ✅ JSONP support implementado
- ✅ Manejo de errores correcto
- ✅ Función `authTest()` para permisos
- ✅ Token validation opcional (actualmente deshabilitado)

---

## 🚀 **PRIORIDADES DE MEJORA**

### 🔴 **ALTA PRIORIDAD**

1. **Agregar Google Tag Manager a las 3 páginas faltantes**
   - Impacta analytics y tracking de conversiones
   
2. **Agregar `script.js` a `index.html`**
   - El hamburger menu podría no funcionar en mobile

3. **Agregar imágenes faltantes** (12 archivos totales)
   - 9 de productos (usuario confirmó que las agregará)
   - 3 de eventos
   - 1 de hero (`img-hero.jpg`)

### 🟡 **MEDIA PRIORIDAD**

4. **Completar atributos ARIA en todas las páginas**
   - Mejora accesibilidad para lectores de pantalla

5. **Extraer header/footer a componentes reutilizables**
   - Reduce mantenimiento futuro

6. **Actualizar link de Spotify a URL específica**

### 🟢 **BAJA PRIORIDAD**

7. **Remover console.logs de producción**
   - Mejora performance y seguridad

8. **Agregar definición explícita de `.section-black`**
   - Mejora claridad del código

---

## 🎯 **RECOMENDACIONES TÉCNICAS**

### Performance
- ✅ Imágenes: usar formatos modernos (WebP con fallback JPG)
- ✅ Fonts: preload está bien implementado
- ⚠️ Considerar lazy loading para imágenes de productos
- ✅ Video: pause en mobile bien implementado

### SEO
- ✅ Meta description presente en index
- ❌ Falta meta description en otras páginas
- ✅ Semantic HTML bien usado (header, main, footer, article, figure)
- ✅ Headings hierarchy correcta (h1 > h2 > h3)

### Seguridad
- ✅ `rel="noopener"` en links externos
- ✅ CORS bien manejado con JSONP fallback
- ⚠️ Apps Script sin token validation (OK para caso de uso)

### Accesibilidad
- ✅ Contraste de colores adecuado (texto blanco sobre fondos oscuros)
- ✅ Focus states visibles
- ✅ Keyboard navigation (ESC close menu)
- ⚠️ Alt text podría ser más descriptivo en algunas imágenes

---

## 📝 **PRÓXIMOS PASOS SUGERIDOS**

1. ✅ **Inmediato**: Agregar GTM a las 3 páginas
2. ✅ **Inmediato**: Agregar `script.js` a index.html
3. 🎨 **Esta semana**: Agregar imágenes faltantes (eventos + hero)
4. 🔧 **Próxima iteración**: Extraer header/footer a componentes
5. 📊 **Opcional**: Setup de build process (Vite, webpack) para optimización

---

## 💡 **CÓDIGO LIMPIO Y BUENAS PRÁCTICAS**

### ✅ **LO QUE ESTÁ MUY BIEN**:

1. **Naming conventions**: clases CSS descriptivas y consistentes
2. **Comentarios**: secciones bien marcadas en CSS
3. **Organización**: archivos separados por responsabilidad
4. **Mobile-first**: diseño responsive bien pensado
5. **Error handling**: try/catch y fallbacks robustos
6. **User feedback**: mensajes claros en el modal
7. **Git**: commit history limpio y descriptivo

### 🎨 **ESTILO DE CÓDIGO**:

- ✅ Indentación consistente
- ✅ Naming en inglés (clases CSS) y español (content)
- ✅ Uso de arrow functions moderno
- ✅ Template literals bien usados
- ✅ Promises y async/await correctos

---

## 📦 **ESTRUCTURA DE ARCHIVOS**

```
ProyectoGuiarte/
├── index.html              ✅ OK (falta script.js)
├── experiencias.html       ⚠️ Falta GTM
├── productos.html          ⚠️ Falta GTM
├── eventos.html            ⚠️ Falta GTM
├── styles.css              ✅ OK
├── script.js               ✅ OK (quitar logs)
├── Zamora-Regular.ttf      ✅ OK
├── img-logo-pg.jpg         ✅ OK
├── logo-instagram.jpg      ✅ OK
├── logo-tiktok.jpg         ✅ OK
├── logo-spotify.jpg        ✅ OK
├── img-eventos.jpg         ✅ OK
├── img-productos.jpg       ✅ OK
├── img-quienessomos.jpg    ✅ OK
├── video-experiencias.mp4  ✅ OK
├── CNAME                   ✅ OK
├── google-apps-script/
│   ├── save_to_doc.gs      ✅ OK
│   ├── README_DEPLOY.md    ✅ OK
│   └── TEST_REQUEST.md     ✅ OK
└── SETUP_GOOGLE_SHEETS_SAVE.md ✅ OK

FALTANTES:
├── img-hero.jpg            ❌
├── img-yogamat.jpg         ❌ (usuario agregará)
├── img-bloque.jpg          ❌ (usuario agregará)
├── img-straps.jpg          ❌ (usuario agregará)
├── img-pelota.jpg          ❌ (usuario agregará)
├── img-almohadon.jpg       ❌ (usuario agregará)
├── img-mala.jpg            ❌ (usuario agregará)
├── img-journal.jpg         ❌ (usuario agregará)
├── img-minijournal.jpg     ❌ (usuario agregará)
├── img-cartas.jpg          ❌ (usuario agregará)
├── img-evento-oraculos.jpg ❌
├── img-evento-manifestacion.jpg ❌
└── img-evento-coffee-rave.jpg   ❌
```

---

## 🏆 **CONCLUSIÓN**

El proyecto está **muy bien estructurado** y listo para producción con algunos ajustes menores.

**Puntuación**: 8.5/10

**Fortalezas principales**:
- ✅ Código limpio y mantenible
- ✅ Responsive design bien ejecutado
- ✅ Accesibilidad bien pensada
- ✅ Integración con Google Sheets funcionando
- ✅ Error handling robusto

**Mejoras prioritarias**:
1. GTM en todas las páginas
2. Script.js en index.html
3. Imágenes faltantes
4. Eliminar código duplicado (header/footer)

---

**Revisado por**: GitHub Copilot  
**Fecha**: 3 de enero de 2026
