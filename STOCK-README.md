# 📦 Sistema de Stock - Guía Rápida

## ¿Qué hace este sistema?

El sistema de stock te permite:
- ✅ Ver en tiempo real qué productos tienen stock
- ✅ Ocultar automáticamente productos sin stock en la web
- ✅ Descontar automáticamente el stock cuando se confirma un pedido
- ✅ Actualizar manualmente el stock desde Google Sheets
- ✅ Prevenir sobreventa (no permite pedidos sin stock)

## Configuración Inicial (Solo una vez)

### 1. Crear la hoja de Stock en Google Sheets

1. Abrí tu Google Sheet "Pedidos Proyecto Guiarte"
2. Hacé click en el **+** abajo para agregar una nueva hoja
3. Llamala **"Stock"** (exactamente así, con mayúscula)
4. En la primera fila poné estos encabezados:
   - **Columna A**: ID Producto
   - **Columna B**: Nombre
   - **Columna C**: Stock Actual
   - **Columna D**: Unidad

### 2. Cargar el Stock Inicial

Copiá y pegá estos datos en tu hoja "Stock" (a partir de la fila 2):

```
yogurt-griego	Yogurt Griego	10000	gramos
huevos-campo	Huevos de Campo	100	unidades
queso-campo	Queso de Campo	5000	gramos
leche-tambo	Leche de Tambo	20000	ml
dulce-leche-campo	Dulce de Leche de Campo	8000	gramos
miel-campo	Miel de Campo	6000	gramos
lechuga-hidroponica	Lechuga Hidropónica	3000	gramos
espinaca-hidroponica	Espinaca Hidropónica	2500	gramos
tomate-hidroponico	Tomate Hidropónico	5000	gramos
zanahoria-hidroponica	Zanahoria Hidropónica	4000	gramos
papa-hidroponica	Papa Hidropónica	10000	gramos
brocoli-hidroponico	Brócoli Hidropónico	2000	gramos
cebolla-hidroponica	Cebolla Hidropónica	3500	gramos
morron-hidroponico	Morrón Hidropónico	2500	gramos
yerba-organica	Yerba Orgánica	5000	gramos
jabon-liquido-ropa	Jabón Líquido para Ropa	10000	ml
detergente-ecologico	Detergente Ecológico	8000	ml
```

### 3. Actualizar el Google Apps Script

1. En tu Google Sheet, andá a **Extensiones > Apps Script**
2. Borrá todo el código actual
3. Copiá el código del archivo `google-sheets-stock.md` (completo)
4. Guardá (Ctrl+S)
5. Click en **Implementar > Nueva implementación**
6. En "Tipo", elegí **Aplicación web**
7. Configurá:
   - **Descripción**: "API Stock y Pedidos v2"
   - **Ejecutar como**: Yo
   - **Quién tiene acceso**: Cualquier persona
8. Click en **Implementar**
9. **IMPORTANTE**: Copiá la URL que te da

### 4. Actualizar la URL en tu sitio web

1. Abrí el archivo `alimentos-cart.js`
2. Buscá la línea que dice:
   ```javascript
   const SCRIPT_URL = 'TU_URL_DEL_GOOGLE_APPS_SCRIPT_AQUI';
   ```
3. Reemplazá `TU_URL_DEL_GOOGLE_APPS_SCRIPT_AQUI` con tu URL (entre comillas)
4. Guardá el archivo

## Uso Diario

### Ver el Stock Actual
- Abrí tu Google Sheet > Hoja "Stock"
- La columna C muestra el stock actual de cada producto

### Actualizar Stock Manualmente
Cuando recibas nueva mercadería:
1. Abrí Google Sheet > Hoja "Stock"
2. Buscá el producto en la columna B
3. Actualizá el número en la columna C (Stock Actual)
4. El cambio se refleja automáticamente en la web

**Ejemplo:**
- Tenías 2000 gramos de lechuga
- Recibís 1000 gramos más
- Cambiá el valor de 2000 a 3000

### ¿Qué pasa cuando se hace un pedido?

1. El cliente agrega productos al carrito
2. Al finalizar la compra, el sistema:
   - ✅ Verifica que haya stock suficiente
   - ✅ Si hay stock: procesa el pedido y descuenta automáticamente
   - ❌ Si no hay stock: muestra error y no permite comprar
3. El stock se actualiza solo en Google Sheets
4. La web se actualiza automáticamente (oculta productos sin stock)

### Poner un Producto en "Sin Stock"
- Simplemente poné **0** en la columna C (Stock Actual)
- El producto se ocultará automáticamente en la web

### Reactivar un Producto
- Poné cualquier número mayor a 0 en la columna C
- El producto vuelve a aparecer en la web

## Ejemplos Prácticos

### Ejemplo 1: Se acabó la lechuga
```
Estado actual en Sheet:
lechuga-hidroponica  |  Lechuga Hidropónica  |  50  |  gramos

Cliente compra 200 gramos

Resultado:
❌ Error: "Stock insuficiente para Lechuga Hidropónica"
(No se procesa el pedido)
```

### Ejemplo 2: Compra exitosa
```
Estado inicial:
lechuga-hidroponica  |  Lechuga Hidropónica  |  3000  |  gramos

Cliente compra 200 gramos

Resultado después del pedido:
lechuga-hidroponica  |  Lechuga Hidropónica  |  2800  |  gramos
✅ Pedido procesado, stock actualizado automáticamente
```

### Ejemplo 3: Reposición de stock
```
Stock antes de reponer:
yerba-organica  |  Yerba Orgánica  |  500  |  gramos

Recibís 5kg (5000g) de yerba nueva:
1. Abrís Google Sheets
2. Cambiás 500 por 5500 (500 + 5000)
3. Guardás
✅ Ahora hay 5500 gramos disponibles
```

## Preguntas Frecuentes

**P: ¿El stock se descuenta cuando agregan al carrito o cuando finalizan la compra?**
R: Se descuenta solo cuando el cliente finaliza la compra. Si agregan al carrito pero no compran, el stock NO se descuenta.

**P: ¿Qué pasa si dos personas compran al mismo tiempo?**
R: El sistema procesa los pedidos en orden. El primero en finalizar se lleva el stock disponible.

**P: ¿Puedo ver el historial de cambios de stock?**
R: No automáticamente, pero podés ver los pedidos en la hoja principal para saber qué se vendió.

**P: ¿Cómo sé si el sistema está funcionando?**
R: Podés probar haciendo un pedido de prueba con un email tuyo y verificar que el stock baje en Google Sheets.

**P: ¿Qué hago si hay un error?**
R: Verificá que:
- La hoja se llame exactamente "Stock"
- Los ID de productos coincidan exactamente
- La URL del script esté bien copiada en alimentos-cart.js
- El script esté publicado con acceso "Cualquier persona"

## Tips y Recomendaciones

1. **Revisá el stock diariamente** antes de abrir la tienda
2. **Dejá un margen de seguridad**: Si tenés 1000g, quizás mostrá solo 800g
3. **Usá números redondos**: 1000, 2000, 5000 (más fácil de manejar)
4. **Hacé backup**: Descargá el Sheet como Excel semanalmente
5. **Comunicá**: Si un producto se agota, avisá por redes sociales

## Soporte

Si tenés problemas con el sistema de stock:
1. Revisá la consola del navegador (F12) para ver errores
2. Verificá el registro de ejecución en Apps Script (Ver > Registros)
3. Asegurate de que la URL del script sea correcta
4. Probá con un pedido de prueba para verificar funcionamiento
