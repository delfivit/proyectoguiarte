# Configuración de Google Sheets para Proyecto Guiarte

## 📊 Estructura del Google Sheet

Tu Google Sheet debe tener **3 hojas**:

1. **Newsletter** - Para suscripciones del footer
2. **Experiencias** - Para consultas de experiencias personalizadas
3. **Productos** (opcional) - Para interés en productos

---

## 🔧 Pasos para configurar

### 1. Crear el Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nombra las hojas exactamente así:
   - `Newsletter`
   - `Experiencias`
   - `Productos` (opcional)

### 2. Configurar las columnas

#### Hoja "Newsletter"
| Email | Tipo | Timestamp |
|-------|------|-----------|
| user@example.com | Newsletter Subscription | 2026-01-30T10:30:00Z |

#### Hoja "Experiencias"
| Email | Nombre | Teléfono | Mensaje | Tipo | Timestamp |
|-------|--------|----------|---------|------|-----------|
| user@example.com | Juan Pérez | +54911... | Consulta sobre... | Consulta Experiencia Personalizada | 2026-01-30T10:30:00Z |

#### Hoja "Productos" (opcional)
| Email | Producto | Timestamp |
|-------|----------|-----------|
| user@example.com | Mala Tibetana | 2026-01-30T10:30:00Z |

---

## 💻 Código de Google Apps Script

1. En tu Google Sheet, ve a **Extensiones > Apps Script**
2. Borra el código por defecto
3. Pega este código:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    return handleRequest(data);
  } catch (err) {
    Logger.log('Error en doPost: ' + err.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const data = e.parameter;
    // Remove callback parameter
    if (data.callback) {
      const callback = data.callback;
      delete data.callback;
      const result = handleRequest(data);
      return ContentService.createTextOutput(
        callback + '(' + result.getContent() + ')'
      ).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return handleRequest(data);
  } catch (err) {
    Logger.log('Error en doGet: ' + err.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleRequest(data) {
  Logger.log('Datos recibidos: ' + JSON.stringify(data));
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = data.sheet || 'Newsletter';
  let sheet = ss.getSheetByName(sheetName);
  
  // Si no existe la hoja, crearla
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    // Agregar encabezados según el tipo de hoja
    if (sheetName === 'Newsletter') {
      sheet.appendRow(['Email', 'Tipo', 'Timestamp']);
    } else if (sheetName === 'Experiencias') {
      sheet.appendRow(['Email', 'Nombre', 'Teléfono', 'Mensaje', 'Tipo', 'Timestamp']);
    } else if (sheetName === 'Productos') {
      sheet.appendRow(['Email', 'Producto', 'Timestamp']);
    }
  }
  
  // Insertar datos según el tipo de hoja
  try {
    if (sheetName === 'Newsletter') {
      sheet.appendRow([
        data.email || '',
        data.tipo || 'Newsletter Subscription',
        data.ts || new Date().toISOString()
      ]);
      Logger.log('Newsletter guardado: ' + data.email);
    } else if (sheetName === 'Experiencias') {
      sheet.appendRow([
        data.email || '',
        data.nombre || '',
        data.telefono || '',
        data.mensaje || '',
        data.tipo || 'Consulta Experiencia',
        data.ts || new Date().toISOString()
      ]);
      Logger.log('Experiencia guardada: ' + data.email);
    } else if (sheetName === 'Productos') {
      sheet.appendRow([
        data.email || '',
        data.product || data.producto || '',
        data.ts || new Date().toISOString()
      ]);
      Logger.log('Producto guardado: ' + data.email);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      sheet: sheetName,
      message: 'Datos guardados correctamente'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log('Error al guardar: ' + err.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Error al guardar: ' + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Guarda el proyecto con un nombre (ej: "Proyecto Guiarte - Forms Handler")

---

## 🚀 Implementar el Web App

1. Haz clic en **Implementar > Nueva implementación**
2. Selecciona **Aplicación web**
3. Configuración:
   - **Descripción**: "Form handler para Newsletter y Experiencias"
   - **Ejecutar como**: Tu email (el dueño del sheet)
   - **Quién tiene acceso**: **Cualquier persona** (importante!)
4. Haz clic en **Implementar**
5. Autoriza los permisos necesarios
6. **Copia la URL de la aplicación web** que te da (algo como `https://script.google.com/macros/s/AKfycbz...`)

---

## 🔗 Actualizar el código JavaScript

Ya está actualizado en `script.js` con la URL actual:

```javascript
const GAS_ENDPOINT = 'https://script.google.com/macros/s/TU_URL_AQUI/exec';
```

Si necesitas cambiar la URL del endpoint, edita la línea 5 de `script.js`.

---

## ✅ Probar la integración

### Newsletter (Footer):
1. Ve a tu sitio web
2. Scroll hasta el footer
3. Ingresa un email en "JOIN THE MOVEMENT"
4. Verifica que aparezca en la hoja "Newsletter"

### Experiencias:
1. Ve a `/experiencias.html`
2. Llena el formulario de contacto
3. Verifica que aparezca en la hoja "Experiencias"

---

## 🔍 Troubleshooting

### ❌ Error "Error al enviar" o "Error al suscribir":

**1. Verifica la URL del endpoint:**
- Abre `script.js` línea 5
- Asegúrate de que la URL termine en `/exec` (no `/dev`)
- Debe ser: `https://script.google.com/macros/s/TU_ID_AQUI/exec`

**2. Verifica los permisos del Web App:**
- En Apps Script, ve a **Implementar > Administrar implementaciones**
- Haz clic en el ⚙️ (engranaje) de tu implementación
- **Ejecutar como**: Tu email
- **Quién tiene acceso**: **Cualquier persona** ← MUY IMPORTANTE
- Si no dice "Cualquier persona", edita y cambia esta opción
- Guarda y copia la nueva URL

**3. Prueba manualmente el endpoint:**
Abre esta URL en tu navegador (reemplaza TU_URL con tu endpoint):
```
TU_URL?sheet=Newsletter&email=test@test.com&tipo=Test&ts=2026-01-30
```
Deberías ver: `{"status":"ok","sheet":"Newsletter","message":"Datos guardados correctamente"}`

**4. Revisa los logs en Apps Script:**
- En Apps Script, ve a **Ejecuciones** (icono reloj ⏱️)
- Busca errores recientes
- Los logs te dirán exactamente qué falló

**5. Re-implementa el Web App:**
A veces Google Apps Script necesita una nueva implementación:
- Ve a **Implementar > Nueva implementación**
- Tipo: **Aplicación web**
- **Nueva descripción**: "v2" o la fecha actual
- **Ejecutar como**: Tu email
- **Quién tiene acceso**: **Cualquier persona**
- Implementar
- **IMPORTANTE**: Copia la NUEVA URL y actualízala en `script.js` línea 5

**6. Verifica las hojas en Google Sheets:**
- Abre tu Google Sheet
- Verifica que existan las hojas: `Newsletter` y `Experiencias`
- Los nombres deben ser EXACTOS (con mayúscula inicial)

**7. Prueba en modo incógnito:**
- A veces el caché del navegador causa problemas
- Prueba en ventana incógnito o borra el caché

### El formulario no envía datos:
- Verifica que la URL en `GAS_ENDPOINT` sea correcta
- Asegúrate de que el Web App esté implementado con acceso "Cualquier persona"
- Revisa la consola del navegador (F12) para ver errores

### Los datos no aparecen en el Sheet:
- Verifica que los nombres de las hojas coincidan exactamente
- Revisa los permisos del Apps Script
- Chequea que el script esté guardado y actualizado

### Error CORS:
- Asegúrate de usar el endpoint `/exec` al final de la URL
- El código ya tiene fallback JSONP por si hay problemas CORS

---

## 📝 Notas

- El endpoint actual configurado es: `AKfycbzP7JaFNr8NwlJqtiSknMIES7gKOtlW_QRbPveSEcyePdwhE8Cb6sJ_uB2YYvbGPqTr`
- Los datos se envían con el campo `sheet` para indicar a qué hoja ir
- Newsletter envía: `{ sheet: 'Newsletter', email, tipo, ts }`
- Experiencias envía: `{ sheet: 'Experiencias', email, nombre, telefono, mensaje, tipo, ts }`

---

¡Listo! Ahora tienes 2 formularios funcionando en el mismo Google Sheet pero en hojas separadas 🎉
