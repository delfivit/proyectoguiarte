PASOS PARA QUE FUNCIONE — Lee esto completamente primero

El problema: Apps Script no tiene permisos para escribir en tu Google Sheet, entonces todas las peticiones fallan.

SOLUCIÓN PASO A PASO (5 minutos)
================================

PASO 1: Autorizar el script (UNA SOLA VEZ)
-------------------------------------------
1. Abrí https://script.google.com/
2. Seleccioná el proyecto donde pegaste el código de save_to_doc.gs (busca por nombre en los proyectos recientes)
3. En el editor, en la barra superior de funciones (donde dice "Select function") seleccioná → authTest
4. Presioná el botón ▶ "Run" (play)
5. En la ventana "Execution log" debería aparecer un resultado. Luego verás un popup pidiendo autorización.
6. IMPORTANTE: 
   - Se abrirá un diálogo "proyectoguiarte is requesting access".
   - Seleccioná tu cuenta Google (la que posee el Sheet).
   - En la pantalla de permisos, clic en "Advanced" (abajo a la izquierda).
   - Clic en "Go to proyectoguiarte (unsafe)" (esto está bien, es tu propio script).
   - Clic en "Allow".
7. El script ahora tiene permisos para acceder a Sheets. ✓

PASO 2: Redeploy el Web App (DESPUÉS de autorizar)
---------------------------------------------------
1. En el editor de Apps Script, clic en "Deploy" (arriba a la derecha).
2. Seleccioná "Manage deployments" o "+ New deployment".
3. Si existe un deployment viejo:
   - Clic en el ⋮ (menú) → Delete
4. Clic en "+ New deployment"
5. En "Deployment type" seleccioná "Web app"
6. Llenar:
   - Description: "Save emails to Sheets"
   - Execute as: Me (tu cuenta)
   - Who has access: Anyone (even anonymous)
7. Clic en "Deploy"
8. Se abrirá un popup con la Nueva URL de Web App. **COPIA ESTA URL.**

PASO 3: Actualizar la URL en el sitio
--------------------------------------
1. Copia la nueva URL del Web App (termina en /exec).
2. Abrí el archivo `script.js` en tu editor local.
3. En la línea 5, busca: const GAS_ENDPOINT = '...'
4. Reemplazá TODO lo que está entre comillas por la URL nueva que copiaste.
   Ejemplo:
   const GAS_ENDPOINT = 'https://script.google.com/macros/s/NUEVA_ID_AQUI/exec';
5. Guardá el archivo.
6. Hacé commit y push:
   git add script.js
   git commit -m "Update GAS_ENDPOINT to newly authorized web app"
   git push

PASO 4: Probar
--------------
1. Abrí tu sitio web (actualiza la página si ya estaba abierta).
2. Clic en "Comprar" en cualquier producto.
3. Completá email y clic en "Avisame".
4. Debería mostrar "¡Listo! Te avisaremos cuando esté disponible."
5. Revisá tu Google Sheet — debería haber una fila nueva con [fecha, producto, email].

RESUELVE PROBLEMAS
===================
- "Error al autorizar": 
  → Revisá que estés logueado en https://script.google.com/ con la misma cuenta que posee el Sheet.

- "¡Listo! pero no aparece en el Sheet":
  → Revisá que el Sheet no esté compartido en read-only (vos deberías poder editarlo).
  → Revisá que SPREADSHEET_ID en save_to_doc.gs sea correcto (debería ser 195Hnj-jiJGk2GWILSVVYT_3GSJy8pTyRKBfrZkjHQwk).

- Sigue diciendo "Error de conexión":
  → Abrí DevTools (Cmd+Option+I) → Console.
  → Enviá el formulario y pegá aquí cualquier error que aparezca.
  → También revisá que la URL en GAS_ENDPOINT en `script.js` sea la nueva del Web App.

¿Hiciste los 4 pasos? Decime cuál es el punto donde se traba y qué ves exactamente.
