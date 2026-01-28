# 📝 Guía: Cómo Agregar Nuevas Meditaciones

## 🎵 Spotify - Automático ✅
**No necesitas hacer nada.** El embed del show completo se actualiza automáticamente cuando subes un nuevo episodio a Spotify.

---

## 📺 YouTube - Semi-automático

### Cómo agregar una nueva meditación de YouTube:

1. **Abre el archivo `meditaciones.html`**

2. **Busca el bloque del script que dice:**
   ```javascript
   const meditaciones = {
   ```

3. **Copia el ID del video de YouTube:**
   - De la URL: `https://youtu.be/RP6nv_x0xyM` → El ID es: `RP6nv_x0xyM`
   - O de: `https://www.youtube.com/watch?v=RP6nv_x0xyM` → El ID es: `RP6nv_x0xyM`

4. **Agrega el video en la categoría correspondiente:**

### 📅 Para Días de la Semana:
```javascript
diasSemana: [
  { id: 'LVfFCiMqB4c', title: 'Meditación Lunes - Intención de la Semana' },
  { id: '6Xo64TjJLsw', title: 'Meditación Martes - Gratitud' },
  // Agregar la nueva aquí:
  { id: 'NUEVO_VIDEO_ID', title: 'Meditación Domingo - Descanso' }
],
```

### 🌙 Para Eventos Astrológicos:
```javascript
eventosAstrologicos: [
  { id: 'NUEVO_VIDEO_ID', title: 'Luna Nueva en Acuario' },
  { id: 'OTRO_VIDEO_ID', title: 'Luna Llena en Leo' }
],
```

### ✨ Para Meditaciones Generales:
```javascript
generales: [
  { id: 'NUEVO_VIDEO_ID', title: 'Meditación para Dormir Profundo' },
  { id: 'OTRO_VIDEO_ID', title: 'Meditación de Sanación Emocional' }
],
```

---

## 📋 Ejemplo Completo:

Si tienes un video en: `https://youtu.be/ABC123xyz`

```javascript
const meditaciones = {
  diasSemana: [
    { id: 'LVfFCiMqB4c', title: 'Meditación Lunes' },
    { id: 'ABC123xyz', title: 'Meditación Martes - Nueva' }  // ← NUEVO
  ],
  eventosAstrologicos: [
    { id: 'DEF456uvw', title: 'Luna Llena Febrero' }  // ← NUEVO
  ],
  generales: []
};
```

---

## 🚀 Videos Actuales Agregados:

### Días de la Semana:
- ✅ Lunes: LVfFCiMqB4c
- ✅ Martes: 6Xo64TjJLsw
- ✅ Miércoles: 4UUfWPNJMw8
- ✅ Jueves: RP6nv_x0xyM
- ✅ Viernes: P4ba2UQsiLM
- ✅ Sábado: YpFw6F6C3js
- ⏳ Domingo: (Pendiente)

---

## 💡 Tips:

1. **Siempre usa comillas simples:** `'video_id'`
2. **Agrega coma después de cada línea** (excepto la última)
3. **El título puede ser lo que quieras:** Aparecerá debajo del video
4. **Guarda el archivo** y recarga la página para ver los cambios

---

## 🔍 Dónde encontrar el ID de YouTube:

### Opción 1: Desde la URL del navegador
```
https://www.youtube.com/watch?v=ABC123xyz
                                 ↑↑↑↑↑↑↑↑↑↑
                                 Este es el ID
```

### Opción 2: Desde el link corto
```
https://youtu.be/ABC123xyz
                 ↑↑↑↑↑↑↑↑↑↑
                 Este es el ID
```

### Opción 3: Compartir → Copiar link
YouTube te da algo como: `https://youtu.be/ABC123xyz?si=...`
Solo necesitas la parte: `ABC123xyz`

---

## ⚠️ Importante:

- **No borres las comillas** `{ }` o corchetes `[ ]`
- **No borres las comas** entre elementos
- **Mantén el formato** del JavaScript
- Si algo no funciona, verifica que no falte una coma o comilla

---

## 🎯 Resultado:

Cuando agregas un nuevo video, automáticamente:
- ✅ Aparece en la categoría correcta
- ✅ Tiene el diseño con hover effects
- ✅ Es responsive (se adapta a mobile)
- ✅ Tiene lazy loading (carga rápido)

---

**¿Necesitas ayuda?** Revisa que el formato del JavaScript esté correcto o contacta a soporte.
