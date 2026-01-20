# Sistema de E-commerce para Alimentos

## ⚡ Configuración Rápida

**El sistema está listo, solo falta un paso:**

👉 **Seguí las instrucciones en [google-sheets-setup.md](google-sheets-setup.md)** para configurar Google Sheets y recibir los pedidos.

---

## Cómo funciona el sistema:

1. El cliente agrega productos al carrito (guardado en localStorage)
2. Al finalizar el pedido, ingresa sus datos (nombre, email, teléfono, dirección)
3. El pedido se envía automáticamente a Google Sheets
4. **Recibís un email hermoso** con todos los detalles del pedido
5. **El cliente recibe confirmación** por email
6. Todos los pedidos quedan registrados en la planilla para consultar histórico

## 📊 Ventajas de usar Google Sheets

✅ Email automático con el pedido completo (sin clicks extras)
✅ Todos los pedidos guardados en una planilla
✅ Podés exportar a Excel cuando quieras
✅ Hacer filtros, estadísticas, gráficos
✅ 100% gratis, sin límites
✅ Email profesional con diseño personalizado para el cliente

---

## Estado Actual

✅ Frontend completo con carrito funcional
✅ 15 productos con descripciones detalladas
✅ Sistema de cantidades por gramos/ml/unidades
✅ Modal de login/registro
✅ Persistencia del carrito en localStorage
⏳ **Falta configurar Google Sheets** (ver google-sheets-setup.md)

## Próximos Pasos

1. ✅ Logo más pequeño en header - HECHO
2. ✅ Sistema de e-commerce completo - HECHO  
3. 📋 **Configurar Google Sheets siguiendo google-sheets-setup.md**
4. 🧪 Probar haciendo un pedido de prueba
5. 📧 Verificar que lleguen los emails correctamente

---

## Configuración del Backend (LEGACY - ya no se usa)

**NOTA:** La configuración con FormSubmit ya no se usa. Ahora usamos Google Sheets + Apps Script que es mucho mejor.

<details>
<summary>Ver configuración anterior (solo por referencia)</summary>

Si prefieren tener más control y generar archivos Excel, pueden implementar un backend PHP:

#### 1. Crear archivo `process-order.php`:

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Generar CSV con el pedido
    $orderNumber = $data['orderNumber'];
    $customer = $data['customer'];
    $items = $data['items'];
    
    $csv = "Pedido #$orderNumber\n\n";
    $csv .= "Cliente: {$customer['name']}\n";
    $csv .= "Email: {$customer['email']}\n";
    $csv .= "Teléfono: {$customer['phone']}\n";
    $csv .= "Dirección: {$customer['address']}\n\n";
    $csv .= "Productos:\n";
    $csv .= "Producto,Cantidad,Unidad\n";
    
    foreach ($items as $item) {
        $csv .= "{$item['name']},{$item['quantity']},{$item['unit']}\n";
    }
    
    // Guardar CSV
    $filename = "pedido_$orderNumber.csv";
    file_put_contents("pedidos/$filename", $csv);
    
    // Enviar email
    $to = "projectguiarte@gmail.com";
    $subject = "Nuevo pedido #$orderNumber";
    $message = $csv;
    $headers = "From: noreply@proyectoguiarte.com\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    mail($to, $subject, $message, $headers);
    
    // Email al cliente
    $customerMessage = "Hola {$customer['name']}!\n\n";
    $customerMessage .= "Recibimos tu pedido #$orderNumber correctamente.\n\n";
    $customerMessage .= "Te contactaremos en breve para coordinar el pago y la entrega.\n\n";
    $customerMessage .= "Gracias por confiar en Proyecto Guiarte!";
    
    mail($customer['email'], "Confirmación de pedido - Proyecto Guiarte", $customerMessage, $headers);
    
    echo json_encode(['success' => true]);
}
?>
```

#### 2. Modificar `alimentos-cart.js`:

Cambiar la URL de FormSubmit por tu backend:

```javascript
const response = await fetch('process-order.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
});
```

### Configuración de Email (si usan backend PHP)

Para que el servidor PHP pueda enviar emails, necesitan configurar:

1. **Hosting con soporte PHP** (ej: Hostinger, SiteGround, etc.)
2. **SMTP configurado** en el servidor
3. O usar una librería como **PHPMailer** con Gmail SMTP

### Alternativa: Google Sheets

También pueden recibir pedidos en Google Sheets usando Google Apps Script. Esto es gratis y no requiere hosting:

1. Crear un Google Sheet
2. Ir a Extensions > Apps Script
3. Pegar el script que les puedo proveer
4. Obtener la URL del script
5. Modificar `alimentos-cart.js` para usar esa URL

---

## Estado Actual

✅ Frontend completo con carrito funcional
✅ 15 productos con descripciones detalladas
✅ Sistema de cantidades por gramos/ml/unidades
✅ Modal de login/registro
✅ Persistencia del carrito en localStorage
✅ Envío de emails con FormSubmit (requiere activación)
⏳ Generación de Excel (requiere backend PHP o Apps Script)

## Próximos Pasos

1. Probar el sistema haciendo un pedido de prueba
2. Verificar el email de FormSubmit
3. Decidir si quieren mantener FormSubmit o implementar backend propio
4. Si necesitan Excel, implementar una de las opciones propuestas
