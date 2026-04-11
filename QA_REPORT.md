# QA Report — Vybe Mobile
> Fecha: 2026-04-11 | Build: Expo Go (dev) + APK preview

---

## ✅ Confirmado funcionando

| Feature | Notas |
|---------|-------|
| Login / Logout | Logout redirige a login correctamente |
| Registro | Formulario con validaciones en español |
| Verify email (OTP) | Flujo completo con reenvío |
| Mensajes en tiempo real | Llegan sin refrescar |
| Indicador "..." al escribir | Aparece y desaparece correctamente |
| Lista de chats actualiza en tiempo real | Confirmado hoy con `chat_updated` |
| Swipe / Discovery | Gestos y botones funcionan |
| Match toast + apertura de chat | Toast aparece y navega al chat |

---

## 🔲 Pendiente de probar

### 1. Badges de no leídos
- **Tab bar (Mensajes):** debe mostrar el número total de mensajes no leídos sobre el ícono del tab
- **Item en lista de chats:** debe mostrar el número de mensajes no leídos de ese chat específico
- **Se limpia al entrar al chat:** al abrir el chat el badge debe desaparecer
- **Cómo probar:** Cuenta A manda mensajes a Cuenta B → Cuenta B no abre el chat → verificar que aparece el número → abrir el chat → verificar que desaparece

### 2. Match en tiempo real (lista de chats)
- **Nuevo match aparece sin refrescar:** cuando alguien te da like de vuelta, el chat debe aparecer en la lista automáticamente
- **Cómo probar:** Cuenta A hace swipe LIKE a Cuenta B → Cuenta B hace swipe LIKE a Cuenta A → verificar que en ambas cuentas aparece el chat en la lista sin tocar nada
- **Nota:** requiere deploy del backend de hoy

### 3. Forgot password / Reset password
- **Flujo completo:** ingresar email → recibir OTP por correo → ingresar OTP + nueva contraseña → login con contraseña nueva
- **Cómo probar:** desde login → "¿Olvidaste tu contraseña?" → completar el flujo

### 4. Imágenes en chat — preview en lista
- **Preview muestra "📷 Imagen":** cuando el último mensaje es una imagen, la lista debe mostrar "📷 Imagen" y no la URL de Cloudinary
- **Cómo probar:** enviar una imagen en un chat → volver a la lista → verificar el preview

### 5. Profile edit
- **Guardar cambios:** editar nombre, bio, edad → guardar → verificar que persiste
- **Avatar:** cambiar foto de perfil → verificar que se actualiza en el header
- **Cuenta sin perfil:** cuenta creada sin completar perfil → entrar a editar → debe crear el perfil (POST) en lugar de actualizarlo (PATCH)

### 6. Push notifications (solo APK nativo)
- **Mensaje recibido:** app en background/cerrada → alguien manda un mensaje → debe llegar notificación push
- **Nuevo match:** app en background → alguien hace match contigo → debe llegar notificación push
- **Tap en notificación:** tap en notificación de mensaje → debe abrir el chat correspondiente
- **Tap en notificación de match:** tap en notificación de match → debe abrir la lista de chats
- **Nota:** no funciona en Expo Go, requiere APK

### 7. Reconexión de socket
- **Mensajes offline:** desconectar internet → reconectar → la lista de chats debe recargarse con mensajes que llegaron mientras estaba offline
- **Cómo probar:** poner el teléfono en modo avión unos segundos → quitar modo avión → verificar que la lista se actualiza

### 8. Paginación de mensajes
- **Cargar mensajes anteriores:** en un chat con muchos mensajes, hacer scroll hacia arriba → deben cargarse mensajes más antiguos
- **Cómo probar:** necesita un chat con más de 20 mensajes

### 9. Errores de red
- **Sin conexión:** abrir app sin internet → debe mostrar estado de error con botón "Reintentar"
- **Discovery sin conexión:** debe mostrar "Sin conexión" con "Reintentar"
- **Chats sin conexión:** debe mostrar "Error al cargar chats" con "Reintentar"

---

## ⚠️ Limitaciones conocidas

| Limitación | Motivo |
|------------|--------|
| Push notifications no funcionan en Expo Go | expo-notifications eliminado de Expo Go en SDK 53 |
| Badges y match en tiempo real requieren deploy del backend | Cambios de hoy aún no desplegados |
| Reset password no probado end-to-end | Pendiente de probar con email real |
