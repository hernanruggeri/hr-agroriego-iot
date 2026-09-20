# HR AgroRiego

Prototipo local del **Sistema IoT para el monitoreo experimental del suelo y el riego en el Barrio de Chacras**.

## Alcance actual

- Cuatro sectores con datos locales simulados claramente identificados.
- Temperatura y humedad ambiente simuladas.
- Registro local de riegos manuales.
- Estado provisional de un ESP32 central y sensores asociados.
- Extractor meteorológico independiente y tolerante a datos faltantes.
- Navegación responsive: Resumen, Historial, Riego y Dispositivos y configuración.

No activa bombas ni electroválvulas. No contiene credenciales, ubicación precisa ni identidad de la estación meteorológica.

## Ejecución local

```bash
npm install
npm run dev
```

La fuente meteorológica se configura localmente mediante `WEATHER_SOURCE_URL`. Si no hay un dato validado, el tablero muestra **Sin dato** y nunca presenta un valor simulado como real.

## Datos

- `public/data/dashboard.json`: telemetría demostrativa y registros locales.
- `public/data/weather.json`: salida normalizada de la consulta externa.
- `scripts/weather/fetch_weather.py`: extractor independiente.

Zona horaria: `America/Argentina/Buenos_Aires`.
