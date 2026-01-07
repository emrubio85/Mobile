# Aplicacion Hibrida
**Manejo de Tareas**

# descripcion
Aplicación híbrida (Ionic + React) para optimizar la gestión del tiempo. Permite crear, editar y organizar tareas, añadir fechas de vencimiento y prioridades, recibir recordatorios (notificaciones locales), y visualizar las tareas en una agenda/calendario. Incluye métricas y un historial de tareas completadas para seguir tu progreso.

Funciones principales:
- Crear y editar tareas con título, notas, fecha de vencimiento y prioridad.
- Recordatorios locales programados (soporte nativo con Capacitor y fallback web).
- Calendario/Agenda que resalta días con tareas.
- Estadísticas: porcentaje completado, gráfico circular y progreso semanal.
- Persistencia local (`localStorage`) y opción nativa con `@capacitor/preferences`.

Cómo ejecutar (desarrollo):

```bash
npm install
npm run dev
# o
ionic serve
```

Para soporte nativo (notificaciones / preferences):

```bash
npm install @capacitor/preferences @capacitor/local-notifications
npx cap sync
```

Proyecto inicial generado con Ionic + Vite.
