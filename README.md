# Tu vida en números

Herramienta web gratuita: ponés tu fecha de nacimiento y descubrís cuántos días, horas, latidos y lunas llenas llevás vividos, tu vida en semanas y una imagen lista para compartir en historias.

**Probala:** https://tu-vida-en-numeros.vercel.app

- HTML, CSS y JavaScript puro, sin dependencias ni compilación.
- **Privacidad:** el cálculo ocurre en el navegador; la fecha nunca sale del dispositivo.
- Imagen vertical 1080×1920 para historias generada con `<canvas>`.

## Estructura

```
index.html                    Portada (redirige a la herramienta)
tu-vida-en-numeros/index.html La herramienta
assets/config.js              Datos de la marca (dominio, WhatsApp, redes)
assets/raiz.js                Componentes compartidos (compartir, bloque de contacto)
assets/raiz.css               Estilos compartidos
vercel.json                   Redirecciones y cabeceras
```

---

Desarrollado por **[Estudio Raíz](https://estudio-raiz.vercel.app)** · San Miguel de Tucumán, Argentina.
