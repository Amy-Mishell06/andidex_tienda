# Andidex

Guía no oficial de criaturas hecha con **Ionic + Angular (componentes standalone)** y
**Capacitor**. Consume la API pública [PokeAPI](https://pokeapi.co).

Deber de Desarrollo de Aplicaciones Móviles (EPN). Integrantes: [Nombre 1] y [Nombre 2].

> App educativa y gratuita. Pokémon y los nombres de sus personajes son marcas de
> Nintendo, Game Freak y The Pokémon Company. Este proyecto no está afiliado a ellas.

## Qué hace

- **Listado por regiones.** Una pestaña por región (Kanto a Paldea); cada región se pide
  a la API en una sola llamada. Búsqueda por nombre o número dentro de la región.
- **Deslizar para actualizar.** Arrastrando la lista hacia abajo se vuelve a pedir la
  región a la API, sin usar la caché.
- **Detalle.** Imagen oficial, nombre, categoría y descripción en español, tipos, altura,
  peso, habilidades, estadísticas base en un radar SVG propio y reproducción del grito.
- **Navegación entre fichas.** Botones Anterior y Siguiente para recorrer las fichas sin
  volver al listado.
- **Acerca de.** Pantalla con la versión, el identificador, los integrantes, el enlace a
  la política de privacidad y el aviso de app no oficial.
- **Modo oscuro.** La app sigue el tema del teléfono, con una paleta propia para fondo
  oscuro.
- **Estados.** Esqueletos de carga, mensaje de error con reintento y caché en memoria.

## Estructura

```
src/app/
├── core/
│   ├── app-info.ts         # nombre, versión e integrantes (pantalla Acerca de)
│   ├── catalogos.ts        # regiones, tipos y etiquetas en español
│   ├── dex.models.ts       # interfaces
│   └── dex.service.ts      # llamadas HTTP a PokeAPI + caché
├── pages/
│   ├── acerca/             # versión, privacidad y aviso legal
│   ├── explorar/           # listado
│   └── ficha/              # detalle
├── ui/
│   └── radar-stats.component.ts
├── app.component.ts
└── app.routes.ts
```

No hay `app.module.ts`: todo se registra en `src/main.ts` con `bootstrapApplication`.

## Requisitos

- Node.js 20 o superior y npm
- Ionic CLI: `npm install -g @ionic/cli`
- Android Studio con el SDK de Android y JDK 21 (para compilar el APK). Gradle 8.14 no
  funciona con Java 25, que es el que trae Android Studio: apuntar `JAVA_HOME` a un JDK 21.

## Instalación y ejecución en el navegador

```bash
git clone https://github.com/Amy-Mishell06/andidex_tienda.git
cd andidex_tienda
npm install
ionic serve
```

Se abre en `http://localhost:8100`.

## Compilación para Android

```bash
ionic build --prod
npx cap add android        # solo la primera vez
npx cap sync android
```

### Ícono y pantalla de inicio

Las imágenes fuente están en `assets/`. Para generar todos los tamaños de Android:

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate --android
```

### Identificador y versión

- Identificador: `ec.epn.moviles.andidex`, definido en `capacitor.config.ts`
  (debe fijarse antes de `npx cap add android`).
- Versión: en `android/app/build.gradle`, dentro de `defaultConfig`:

```gradle
versionCode 1
versionName "1.0.0"
```

### Firma

1. Crear el almacén de claves (una sola vez; guardar el archivo y las contraseñas):

```bash
keytool -genkeypair -v -keystore andidex-release.jks -alias andidex \
  -keyalg RSA -keysize 2048 -validity 10000
```

2. Crear `android/keystore.properties` (no se sube al repositorio):

```properties
storeFile=../../andidex-release.jks
storePassword=TU_CLAVE
keyAlias=andidex
keyPassword=TU_CLAVE
```

3. En `android/app/build.gradle`, antes del bloque `android {`:

```gradle
def keystoreProps = new Properties()
def keystoreFile = rootProject.file("keystore.properties")
if (keystoreFile.exists()) {
    keystoreProps.load(new FileInputStream(keystoreFile))
}
```

   y dentro de `android {`:

```gradle
signingConfigs {
    release {
        if (keystoreFile.exists()) {
            storeFile file(keystoreProps['storeFile'])
            storePassword keystoreProps['storePassword']
            keyAlias keystoreProps['keyAlias']
            keyPassword keystoreProps['keyPassword']
        }
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        // ...lo que ya estaba
    }
}
```

4. Generar los archivos (en Windows usar `gradlew.bat`):

```bash
cd android
./gradlew assembleRelease   # APK: app/build/outputs/apk/release/app-release.apk
./gradlew bundleRelease     # AAB: app/build/outputs/bundle/release/app-release.aab
```

5. Verificar la firma:

El APK se firma solo con el esquema v2 (minSdk 24), así que `keytool -printcert` no lo
reconoce; se usa `apksigner`, que está en `build-tools` del SDK. El AAB sí se verifica con
`keytool`.

```bash
apksigner verify --print-certs app/build/outputs/apk/release/app-release.apk
keytool -printcert -jarfile app/build/outputs/bundle/release/app-release.aab
certutil -hashfile app\build\outputs\apk\release\app-release.apk SHA256
```

### Instalar en el teléfono

```bash
adb install app/build/outputs/apk/release/app-release.apk
```

## Capturas

### Aplicación

| Listado | Búsqueda | Otra región |
| :---: | :---: | :---: |
| <img height="440" alt="Listado" src="https://github.com/user-attachments/assets/e25a9e1e-2f3d-4ba8-a573-995c4c4a772b" /> | <img height="440" alt="Búsqueda" src="https://github.com/user-attachments/assets/70f558a1-57ea-400b-867a-34a946798b91" /> | <img height="440" alt="Johto" src="docs/capturas/app-03-region-johto.png" /> |

| Detalle | Estadísticas y grito | Ícono |
| :---: | :---: | :---: |
| <img height="440" alt="Detalle" src="https://github.com/user-attachments/assets/e78d61e8-f2cc-41f4-9a45-63e151f65250" /> | <img height="440" alt="Estadísticas" src="https://github.com/user-attachments/assets/8bfcadf1-d48c-4dc0-bb17-cf4f5f975b94" /> | <img height="120" alt="Ícono" src="docs/capturas/icono.png" /> |

### Compilación y firma

Compilación web de producción:

![Compilación web](docs/capturas/compilacion-01-build-web.png)

APK y AAB de release:

![Compilación Android](docs/capturas/compilacion-02-build-android.png)

Verificación de la firma:

![Firma](docs/capturas/compilacion-03-firma.png)

Identificador, versión y permisos:

![Identificador y versión](docs/capturas/compilacion-04-identificador-version.png)

## Publicación

| Campo | Detalle |
| --- | --- |
| Canal | [Uptodown](https://www.uptodown.com/consola-de-desarrolladores) (tienda alternativa con revisión editorial) |
| Archivo enviado | `app-release.apk`, versión 1.0.0 (versionCode 1), firmado |
| Fecha de envío | 20/11/2026 |
| Estado | **Rechazada** el 20/11/2026 a las 07:08 |
| Enlace público | No disponible por el rechazo |

### Por qué Uptodown

De las cinco tiendas investigadas, es la única que una cuenta individual puede usar sin
pago, sin testers obligatorios y sin empresa registrada, y acepta el mismo APK firmado que
se instala en el teléfono. Google Play exige una prueba cerrada de 14 días con 12 testers,
Amazon Appstore ya no funciona en teléfonos Android y Samsung Galaxy Store pide vendedor
corporativo con D-U-N-S.

### Proceso

1. Registro en Uptodown Developers Console y creación de la ficha (estado *Draft*).
2. Información general: nombre Andidex, Android, categoría Utilities, edad 12+; el paquete
   `ec.epn.moviles.andidex` se lee del APK.
3. Carga del APK firmado, 3 capturas y la descripción.
4. Envío a revisión (*Submit for review*): la app pasó a *Pending revision*.
5. Resultado: **rechazada**.

### Motivo del rechazo

El equipo editorial consideró que hay un uso ilegítimo de marcas registradas en el nombre,
el ícono o las funcionalidades de la app, y pidió modificarla para evitar un posible
conflicto legal.

El nombre y el ícono son propios, así que el problema está en las funcionalidades: la app
muestra nombres e imágenes oficiales de Pokémon (obtenidos de PokeAPI) y la descripción
mencionaba la marca, aunque fuera para aclarar que no es oficial.

### Acciones correctivas

1. Quitar de la descripción, palabras clave y capturas toda mención a Pokémon, Nintendo y
   The Pokémon Company.
2. Usar en la ficha capturas sin personajes reconocibles (Acerca de, carga, error).
3. Reenviar la versión 1.1.0 (versionCode 2), que incluye las mejoras de navegación,
   actualización, pantalla Acerca de y modo oscuro.
4. Escribir a soporte de Uptodown explicando que la app es educativa, gratuita y sin anuncios.
5. Si se mantiene el rechazo: publicar el APK en GitHub Releases, identificado como
   **distribución directa**, no como aprobación de una tienda.

Cambiar la fuente de datos por criaturas propias eliminaría el problema de marca, pero
dejaría de cumplir el requisito del deber de consumir la API de Pokémon. El rechazo es
por propiedad intelectual, no por una falla técnica: el APK está firmado, se instala y
funciona.

Informe completo con capturas del proceso: [Informe_Publicacion_Andidex_ADiaz_CPuente.pdf](docs/Informe_Publicacion_Andidex_ADiaz_CPuente.pdf)

## Privacidad

La app no recoge datos personales. Ver [PRIVACY.md](PRIVACY.md).

## Créditos

- Datos, imágenes y sonidos: [PokeAPI](https://pokeapi.co)
- Repositorio de referencia del curso: https://github.com/jzaldumbide/pokedex-2026b
