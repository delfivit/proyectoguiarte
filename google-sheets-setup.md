# Configuración de Google Sheets para Pedidos

## Paso 1: Crear Google Sheet

1. Andá a [Google Sheets](https://sheets.google.com)
2. Creá una nueva hoja de cálculo
3. Ponele un nombre: "Pedidos Proyecto Guiarte"

## Paso 2: Configurar las Columnas

En la primera fila, agregá estos encabezados:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| **Número de Orden** | **Fecha** | **Nombre** | **Email** | **Teléfono** | **Dirección** | **CP** | **Día de Entrega** | **Horario** | **Productos** | **Total** |

## Paso 3: Crear el Apps Script

1. En tu Google Sheet, andá a **Extensiones > Apps Script**
2. Borrá todo el código que aparece
3. Pegá este código:

```javascript
// Email donde querés recibir las notificaciones
const EMAIL_DESTINO = 'projectguiarte@gmail.com';

function doPost(e) {
  try {
    // Parsear los datos recibidos
    const data = JSON.parse(e.postData.contents);
    
    // Obtener la hoja activa
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Agregar una nueva fila con los datos del pedido
    sheet.appendRow([
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
    
    // Enviar email con el pedido
    enviarEmailPedido(data);
    
    // Enviar email de confirmación al cliente
    enviarConfirmacionCliente(data);
    
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Pedido registrado correctamente'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
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
        
        <div style="background: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #AE57C0; margin-top: 0;">🛍️ Productos</h2>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; font-family: monospace;">
            ${formatearProductos(data.itemsDetailed)}
          </div>
          <div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, #C77DD4, #AE57C0); border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: white; font-size: 14px; font-weight: 600;">TOTAL DEL PEDIDO</p>
            <p style="margin: 5px 0 0 0; color: white; font-size: 28px; font-weight: 700;">${data.totalPriceFormatted}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
          <p style="color: #666; font-size: 14px;">
            Ver todos los pedidos en 
            <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}" style="color: #AE57C0; text-decoration: none;">
              Google Sheets
            </a>
          </p>
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

function formatearProductos(items) {
  if (!items || items.length === 0) return 'No hay productos';
  
  return items.map(item => 
    `• ${item.name}: <strong>${item.quantity} ${item.unit}</strong> - ${item.priceFormatted || 'N/A'}`
  ).join('<br>');
}

function enviarConfirmacionCliente(data) {
  const subject = '✅ Confirmación de Pedido - Proyecto Guiarte';
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #AE57C0, #8B3FA8); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">¡Gracias por tu pedido!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #333;">Hola <strong>${data.customerName}</strong>,</p>
        
        <p style="font-size: 16px; color: #333;">
          Recibimos tu pedido correctamente y lo estamos procesando.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #AE57C0; margin-top: 0;">📋 Resumen de tu Pedido</h3>
          <p><strong>Número de Orden:</strong> ${data.orderNumber}</p>
          <p><strong>Fecha:</strong> ${data.date}</p>
          
          <h4 style="color: #AE57C0; margin-bottom: 10px;">Productos:</h4>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 6px;">
            ${formatearProductos(data.itemsDetailed)}
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, #C77DD4, #AE57C0); border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: white; font-size: 14px; font-weight: 600;">TOTAL A PAGAR</p>
            <p style="margin: 5px 0 0 0; color: white; font-size: 28px; font-weight: 700;">${data.totalPriceFormatted}</p>
          </div>
          
          <p style="margin-top: 15px;"><strong>Dirección de entrega:</strong><br>${data.customerAddress}, CP ${data.customerPostalCode}</p>
          <p><strong>Entrega programada:</strong><br>${data.deliveryDay} de ${data.deliveryTime}</p>
        </div>
        
        <div style="background: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>Próximos pasos:</strong><br>
            Te contactaremos en breve para coordinar el pago y la entrega de tu pedido.
          </p>
        </div>
        
        <p style="font-size: 16px; color: #333;">
          Si tenés alguna consulta, no dudes en contactarnos.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
          <p style="color: #AE57C0; font-size: 18px; font-weight: bold; margin: 5px 0;">
            Proyecto Guiarte
          </p>
          <p style="color: #666; font-size: 14px; margin: 5px 0;">
            projectguiarte@gmail.com
          </p>
        </div>
      </div>
    </div>
  `;
  
  MailApp.sendEmail({
    to: data.customerEmail,
    subject: subject,
    htmlBody: htmlBody
  });
}

// Función de prueba - podés ejecutarla para probar el sistema
function testearPedido() {
  const dataPrueba = {
    orderNumber: 'PG-TEST-' + new Date().getTime(),
    date: new Date().toLocaleString('es-AR'),
    customerName: 'Cliente de Prueba',
    customerEmail: EMAIL_DESTINO, // Cambiar por tu email para probar
    customerPhone: '11-1234-5678',
    customerAddress: 'Dirección de prueba 123',
    customerPostalCode: '3100',
    deliveryDay: 'Lunes',
    deliveryTime: '9:00 - 13:00',
    items: 'Yogurt Griego (500 gramos), Lechuga Hidropónica (200 gramos)',
    itemsDetailed: [
      { name: 'Yogurt Griego', quantity: 500, unit: 'gramos', priceFormatted: '$1.400' },
      { name: 'Lechuga Hidropónica', quantity: 200, unit: 'gramos', priceFormatted: '$360' }
    ],
    totalPriceFormatted: '$1.760'
  };
  
  enviarEmailPedido(dataPrueba);
  enviarConfirmacionCliente(dataPrueba);
  
  Logger.log('Emails de prueba enviados!');
}
```

4. Guardá el proyecto (Ctrl+S o Cmd+S)

## Paso 4: Implementar como Web App

1. En Apps Script, hacé click en **Implementar > Nueva implementación**
2. Click en el ícono de engranaje ⚙️ al lado de "Seleccionar tipo"
3. Seleccioná **Aplicación web**
4. Configurá así:
   - **Descripción:** "API de Pedidos Proyecto Guiarte"
   - **Ejecutar como:** "Yo (tu email)"
   - **Quién tiene acceso:** "Cualquier usuario"
5. Click en **Implementar**
6. Te va a pedir autorización - hacé click en **Autorizar acceso**
7. Elegí tu cuenta de Google
8. Click en **Avanzado** y luego en **Ir a [nombre del proyecto] (no seguro)**
9. Click en **Permitir**
10. **COPIÁ LA URL** que te aparece (algo como: `https://script.google.com/macros/s/AKfycby.../exec`)

## Paso 5: Probar el Sistema

1. En Apps Script, andá a la función **testearPedido**
2. Seleccionala en el dropdown de arriba
3. Click en el botón ▶️ **Ejecutar**
4. Revisá tu email - deberías recibir un email de prueba
5. Revisá tu Google Sheet - debería aparecer una fila con el pedido de prueba

## Paso 6: Conectar con la Web

1. Abrí el archivo `alimentos-cart.js`
2. Buscá la línea que dice: `const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';`
3. Reemplazá `'YOUR_GOOGLE_SCRIPT_URL_HERE'` con la URL que copiaste en el Paso 4
4. Ejemplo: `const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec';`
5. Guardá el archivo

## ¡Listo!

Ahora cada vez que alguien haga un pedido:

✅ Se guardará automáticamente en tu Google Sheet
✅ Recibirás un email hermoso con todos los detalles
✅ El cliente recibirá un email de confirmación profesional

## Solución de Problemas

**Si no funciona:**

1. Verificá que la URL del script sea correcta
2. Asegurate de haber autorizado todos los permisos
3. Revisá que el email en `EMAIL_DESTINO` sea el correcto
4. Probá ejecutar `testearPedido()` desde Apps Script

**Para ver los logs:**
- En Apps Script: Ver > Registros de ejecución
