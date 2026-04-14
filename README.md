# Vybe Mobile

Aplicación móvil para conocer personas y chatear en tiempo real. Proyecto universitario — Proyecto #3: People Finder.

## Características

- Registro e inicio de sesión con verificación por correo (OTP)
- Recuperación de contraseña vía OTP
- Perfil de usuario con foto, bio e intereses
- Discovery con swipe derecha/izquierda para aceptar o rechazar
- Chat en tiempo real con WebSockets
- Envío de imágenes en el chat
- Push notifications (FCM) para nuevos mensajes
- Lista de chats con badges de mensajes no leídos

## Stack

- React Native + Expo SDK 54
- TypeScript
- expo-router (file-based navigation)
- Zustand (estado global)
- TanStack Query (fetching)
- Socket.IO (WebSockets)
- Firebase Cloud Messaging (push notifications)
- EAS Build (compilación en la nube)

## Backend

Repositorio: [cgds1/vybe-backend](https://github.com/cgds1/vybe-backend)  
Deploy: Railway — NestJS + Prisma + PostgreSQL + Redis

## Requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Expo Go (desarrollo) o APK nativo (para push notifications)

## Instalación

```bash
npm install
```

Crea un archivo `.env.development` en la raíz:

```env
EXPO_PUBLIC_API_URL=https://your-backend-url.railway.app
EXPO_PUBLIC_WS_URL=https://your-backend-url.railway.app
```

## Desarrollo

```bash
npx expo start --clear
```

## Build APK (preview)

```bash
eas build --profile preview --platform android
```

## Demo

Proyecto en Expo: [cgds1/vybe-mobile](https://expo.dev/accounts/cgds1/projects/vybe-mobile)

APK (Android): [Descargar build de producción](https://expo.dev/accounts/cgds1/projects/vybe-mobile/builds/bd0cc748-3212-4d73-be61-323f4b91f73a)

## Contribuidores

| Nombre | GitHub |
|--------|--------|
| Carlos Diaz | [@cgds1](https://github.com/cgds1) |
| Alberto Martinez | [@betomartinez13](https://github.com/betomartinez13) |
