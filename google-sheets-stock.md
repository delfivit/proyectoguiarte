# Sistema de Stock con Google Sheets

## Configuración del Sistema de Stock

### Paso 1: Agregar Hoja de Stock

En tu Google Sheet "Pedidos Proyecto Guiarte":

1. Agregá una nueva hoja (tab) y llamala **"Stock"**
2. En la primera fila, poné estos encabezados:

| A | B | C | D |
|---|---|---|---|
| **ID Producto** | **Nombre** | **Stock Actual** | **Unidad** |

### Paso 2: Cargar el Stock Inicial

En la hoja "Stock", agregá estos datos (ejemplo):

| ID Producto | Nombre | Stock Actual | Unidad |
|-------------|--------|--------------|--------|
| yogurt-griego | Yogurt Griego | 10000 | gramos |
| huevos-campo | Huevos de Campo | 100 | unidades |
| queso-campo | Queso de Campo | 5000 | gramos |
| leche-tambo | Leche de Tambo | 20000 | ml |
| dulce-leche-campo | Dulce de Leche de Campo | 8000 | gramos |
| miel-campo | Miel de Campo | 6000 | gramos |
| lechuga-hidroponica | Lechuga Hidropónica | 3000 | gramos |
| espinaca-hidroponica | Espinaca Hidropónica | 2500 | gramos |
| tomate-hidroponico | Tomate Hidropónico | 5000 | gramos |
| zanahoria-hidroponica | Zanahoria Hidropónica | 4000 | gramos |
| papa-hidroponica | Papa Hidropónica | 10000 | gramos |
| brocoli-hidroponico | Brócoli Hidropónico | 2000 | gramos |
| cebolla-hidroponica | Cebolla Hidropónica | 3500 | gramos |
| morron-hidroponico | Morrón Hidropónico | 2500 | gramos |
| yerba-organica | Yerba Orgánica | 5000 | gramos |
| jabon-liquido-ropa | Jabón Líquido para Ropa | 10000 | ml |
| detergente-ecologico | Detergente Ecológico | 8000 | ml |

### Paso 3: Actualizar el Apps Script

Reemplazá tu código actual de Apps Script con este nuevo código que incluye gestión de stock:

```javascript
// Email donde querés recibir las notificaciones
const EMAIL_DESTINO = 'projectguiarte@gmail.com';

function doGet(e) {
  try {
    // Manejar peticiones GET (para consultas de stock con JSONP)
    if (e.parameter.action === 'getStock') {
      const result = obtenerStock();
      const callback = e.parameter.callback || 'callback';
      
      // Retornar JSONP
      return ContentService
        .createTextOutput(callback + '(' + result.getContent() + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': 'Acción no reconocida'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error en doGet: ' + error.toString());
    const callback = e.parameter.callback || 'callback';
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify({
        'status': 'error',
        'message': error.toString()
      }) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Si es una consulta de stock (también aceptar por POST)
    if (data.action === 'getStock') {
      return obtenerStock();
    }
    
    // Si es un pedido normal
    if (data.action === 'submitOrder') {
      return procesarPedido(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': 'Acción no reconocida'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Obtener stock actual de todos los productos
function obtenerStock() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const stockSheet = ss.getSheetByName('Stock');
  
  if (!stockSheet) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': 'Hoja de Stock no encontrada'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = stockSheet.getDataRange().getValues();
  const stock = {};
  
  // Empezar desde la fila 2 (saltear encabezados)
  for (let i = 1; i < data.length; i++) {
    const productId = data[i][0];
    const stockActual = data[i][2];
    stock[productId] = stockActual;
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'success',
    'stock': stock
  })).setMimeType(ContentService.MimeType.JSON);
}

// Procesar pedido y descontar stock
function procesarPedido(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Verificar y descontar stock
  const stockDisponible = verificarYDescontarStock(data.cartItems);
  
  if (!stockDisponible.success) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': stockDisponible.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Registrar el pedido
  const pedidosSheet = ss.getSheets()[0]; // Primera hoja (Pedidos)
  pedidosSheet.appendRow([
    data.orderNumber,
    data.date,
    data.customerName,
    data.customerEmail,
    data.customerPhone,
    data.customerAddress,
    data.customerPostalCode,
    data.deliveryDay,
    data.deliveryTime,
    data.items,
    data.totalPriceFormatted
  ]);
  
  // Enviar emails
  enviarEmailPedido(data);
  enviarConfirmacionCliente(data);
  
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'success',
    'message': 'Pedido registrado correctamente'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Verificar stock y descontar
function verificarYDescontarStock(cartItems) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const stockSheet = ss.getSheetByName('Stock');
  
  if (!stockSheet) {
    return { success: false, message: 'Hoja de Stock no encontrada' };
  }
  
  const data = stockSheet.getDataRange().getValues();
  
  // Primero verificar que haya stock suficiente
  for (let item of cartItems) {
    let rowIndex = -1;
    let stockActual = 0;
    
    // Buscar el producto en la hoja
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === item.id) {
        rowIndex = i + 1; // +1 porque las filas en Sheets empiezan en 1
        stockActual = data[i][2];
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { 
        success: false, 
        message: `Producto ${item.name} no encontrado en stock` 
      };
    }
    
    if (stockActual < item.quantity) {
      return { 
        success: false, 
        message: `Stock insuficiente para ${item.name}. Disponible: ${stockActual} ${item.unit}` 
      };
    }
  }
  
  // Si hay stock suficiente, descontar
  for (let item of cartItems) {
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === item.id) {
        const rowIndex = i + 1;
        const stockActual = data[i][2];
        const nuevoStock = stockActual - item.quantity;
        stockSheet.getRange(rowIndex, 3).setValue(nuevoStock);
        break;
      }
    }
  }
  
  return { success: true };
}

function enviarEmailPedido(data) {
  const subject = '🛒 Nuevo Pedido #' + data.orderNumber;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #AE57C0, #8B3FA8); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Nuevo Pedido Recibido</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #AE57C0; margin-top: 0;">📋 Detalles del Pedido</h2>
          <p><strong>Número de Orden:</strong> ${data.orderNumber}</p>
          <p><strong>Fecha:</strong> ${data.date}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #AE57C0; margin-top: 0;">👤 Datos del Cliente</h2>
          <p><strong>Nombre:</strong> ${data.customerName}</p>
          <p><strong>Email:</strong> ${data.customerEmail}</p>
          <p><strong>Teléfono:</strong> ${data.customerPhone}</p>
          <p><strong>Dirección:</strong> ${data.customerAddress}</p>
          <p><strong>Código Postal:</strong> ${data.customerPostalCode}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #AE57C0; margin-top: 0;">📦 Entrega</h2>
          <p><strong>Día:</strong> ${data.deliveryDay}</p>
          <p><strong>Horario:</strong> ${data.deliveryTime}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #AE57C0; margin-top: 0;">🛍️ Productos</h2>
          ${generarTablaProductos(data.cartItems)}
          <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #AE57C0;">
            <p style="font-size: 20px; font-weight: bold; color: #8B3FA8; text-align: right; margin: 0;">
              Total: ${data.totalPriceFormatted}
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  MailApp.sendEmail({
    to: EMAIL_DESTINO,
    subject: subject,
    htmlBody: htmlBody
  });
}

function enviarConfirmacionCliente(data) {
  const subject = '✅ Confirmación de Pedido - Proyecto Guiarte';
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #AE57C0, #8B3FA8); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">¡Gracias por tu pedido!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #333;">Hola ${data.customerName},</p>
        <p style="font-size: 16px; color: #333;">Recibimos tu pedido correctamente. Te lo entregaremos en:</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 5px 0; font-size: 18px;"><strong>📅 ${data.deliveryDay}</strong></p>
          <p style="margin: 5px 0; font-size: 18px;"><strong>🕐 ${data.deliveryTime}</strong></p>
          <p style="margin: 5px 0; font-size: 16px; color: #666;">📍 ${data.customerAddress}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #AE57C0; margin-top: 0;">🛍️ Tu Pedido (#${data.orderNumber})</h2>
          ${generarTablaProductos(data.cartItems)}
          <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #AE57C0;">
            <p style="font-size: 20px; font-weight: bold; color: #8B3FA8; text-align: right; margin: 0;">
              Total: ${data.totalPriceFormatted}
            </p>
          </div>
        </div>
        
        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
          Si tenés alguna consulta, contactanos a projectguiarte@gmail.com
        </p>
      </div>
    </div>
  `;
  
  MailApp.sendEmail({
    to: data.customerEmail,
    subject: subject,
    htmlBody: htmlBody
  });
}

function generarTablaProductos(items) {
  let html = '<table style="width: 100%; border-collapse: collapse;">';
  html += '<tr style="background: #f5f5f5; border-bottom: 2px solid #AE57C0;">';
  html += '<th style="padding: 10px; text-align: left;">Producto</th>';
  html += '<th style="padding: 10px; text-align: center;">Cantidad</th>';
  html += '<th style="padding: 10px; text-align: right;">Precio</th>';
  html += '</tr>';
  
  items.forEach(item => {
    html += '<tr style="border-bottom: 1px solid #ddd;">';
    html += `<td style="padding: 10px;">${item.name}</td>`;
    html += `<td style="padding: 10px; text-align: center;">${item.quantity} ${item.unit}</td>`;
    html += `<td style="padding: 10px; text-align: right; font-weight: bold; color: #8B3FA8;">${item.priceFormatted}</td>`;
    html += '</tr>';
  });
  
  html += '</table>';
  return html;
}

// Función de prueba
function testGetStock() {
  const result = obtenerStock();
  Logger.log(result.getContent());
}

function testSubmitOrder() {
  const testData = {
    action: 'submitOrder',
    orderNumber: 'TEST-001',
    date: new Date().toLocaleDateString('es-AR'),
    customerName: 'Test User',
    customerEmail: 'test@example.com',
    customerPhone: '11-1234-5678',
    customerAddress: 'Calle Test 123',
    customerPostalCode: '3100',
    deliveryDay: 'Lunes',
    deliveryTime: '9:00 - 13:00',
    items: 'Yogurt Griego (500 gramos), Lechuga Hidropónica (200 gramos)',
    totalPriceFormatted: '$1.760',
    cartItems: [
      { id: 'yogurt-griego', name: 'Yogurt Griego', quantity: 500, unit: 'gramos', priceFormatted: '$1.400' },
      { id: 'lechuga-hidroponica', name: 'Lechuga Hidropónica', quantity: 200, unit: 'gramos', priceFormatted: '$360' }
    ]
  };
  
  const result = procesarPedido(testData);
  Logger.log(result.getContent());
}
```

### Paso 4: Publicar el Script

1. Guardá el script (Ctrl+S o Cmd+S)
2. Click en **Implementar > Nueva implementación**
3. En "Tipo", elegí **Aplicación web**
4. Configurá:
   - **Descripción**: "API de Stock y Pedidos v2"
   - **Ejecutar como**: Yo
   - **Quién tiene acceso**: Cualquier persona
5. Click en **Implementar**
6. Copiá la **URL de la aplicación web** (la vas a necesitar)

### Paso 5: Actualizar la URL en el Código JavaScript

En el archivo `alimentos-cart.js`, reemplazá la URL del script con tu nueva URL.

## Cómo Funciona

### Consulta de Stock
- Al cargar la página, el sistema consulta el stock actual de todos los productos
- Los productos sin stock se ocultan automáticamente
- Se muestra un badge "Sin stock" para productos agotados

### Al Realizar un Pedido
1. El sistema verifica que haya stock suficiente
2. Si no hay stock, muestra un error y no permite el pedido
3. Si hay stock, registra el pedido y descuenta automáticamente del stock
4. Envía los emails de confirmación

### Reposición de Stock
Para reponer stock, simplemente editá la columna "Stock Actual" en la hoja "Stock" de Google Sheets.

## Ventajas del Sistema

- ✅ Stock en tiempo real
- ✅ Descuento automático al confirmar pedidos
- ✅ Productos sin stock se ocultan automáticamente
- ✅ Previene sobreventa
- ✅ Fácil de actualizar manualmente
- ✅ Historial de pedidos separado del stock

## Notas Importantes

- El stock se actualiza solo cuando se **confirma** el pedido (no al agregar al carrito)
- Si un cliente agrega al carrito pero no finaliza, el stock no se descuenta
- Podés manejar el stock en gramos, ml o unidades según el producto
- Se recomienda revisar y actualizar el stock diariamente
