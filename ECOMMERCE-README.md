# Sistema de E-commerce para Alimentos

## Configuración del Backend

El sistema de carrito ya está implementado y funciona con **FormSubmit**, un servicio gratuito que envía emails sin necesidad de backend.

### Cómo funciona actualmente:

1. El cliente agrega productos al carrito (guardado en localStorage)
2. Al finalizar el pedido, ingresa sus datos (nombre, email, teléfono, dirección)
3. Se envía un email automático a **proyectoguiarte@gmail.com** con:
   - Número de orden
   - Datos del cliente
   - Lista de productos con cantidades
4. El cliente recibe un email de confirmación automático

### Para activar el sistema:

**IMPORTANTE:** La primera vez que se envíe un pedido, FormSubmit enviará un email de verificación a `proyectoguiarte@gmail.com`. Deben hacer click en el link de confirmación para activar el servicio.

### Opcional: Backend propio con PHP

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
    $to = "proyectoguiarte@gmail.com";
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
