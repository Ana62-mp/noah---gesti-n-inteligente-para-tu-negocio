# Recomendaciones generales de desarrollo

Guía de clean code, buenas prácticas y criterios de interfaz para cualquier proyecto de software (web, móvil o servicios). Aplica a todo el código y a toda pantalla nueva. Se puede copiar tal cual a cualquier repositorio y ajustar los valores marcados como configurables.

Las reglas marcadas como **obligatoria** se revisan en cada pull request. Las marcadas como **recomendada** se siguen salvo que haya una razón clara para no hacerlo.

Las convenciones de commits y ramas están definidas en el documento `Commits_Ramas_Git.md` y son **obligatorias** en todos los proyectos (ver sección 7).

---

## 1. Clean code

### 1.1 Tamaño de archivos y funciones

- **Obligatoria.** Un archivo no supera las 100 líneas. Si el componente lo justifica de verdad, el máximo absoluto es 150. (Umbral configurable por proyecto, pero siempre explícito.)
- Si un componente o módulo crece, se divide en piezas más pequeñas o se mueve la lógica a un hook, servicio o función aparte.
- Un componente o función hace una sola cosa. Si hace falta explicarlo por partes con comentarios, se debe dividir.
- Una función recibe pocos parámetros (idealmente hasta tres). Si necesita más, recibe un objeto con nombre.

### 1.2 Nombres

- Nombres de carpetas, archivos, clases, funciones y variables en inglés. Los textos que ve el usuario van en el idioma del producto.
- Nombres descriptivos, sin abreviaturas ambiguas. Es mejor un nombre largo y claro que uno corto y confuso (`assignedUserId`, no `auId`).
- Componentes y clases en `PascalCase`, hooks con prefijo `use`, funciones y variables en `camelCase`, constantes en `UPPER_SNAKE_CASE`.
- Booleanos con prefijo que se lea como pregunta: `isLoading`, `hasPermission`, `canSave`.

### 1.3 Comentarios

- No se comenta qué hace el código; lo dicen los nombres.
- Se permite un comentario corto de una línea solo cuando explica un porqué no obvio: una restricción de una API, un workaround puntual o una decisión que sorprendería a quien lo lea después.
- No se dejan bloques de comentarios, código comentado ni TODO sin ticket asociado.
- No se usan emojis en código, commits ni documentación.

### 1.4 Principios generales

- **Una sola responsabilidad.** Separar pintar la pantalla, obtener datos y aplicar reglas de negocio.
- **No repetirse (DRY) con criterio.** Si el mismo fragmento aparece por tercera vez, se extrae. No se abstrae por adelantado.
- **YAGNI.** No se agregan capas, configuraciones ni opciones para casos hipotéticos que hoy no existen.
- **Funciones puras cuando se pueda.** Las reglas de negocio (cálculos, validaciones, transiciones de estado) viven en funciones puras fáciles de probar.
- **Retornos tempranos.** Preferir `if (!x) return` a anidar condicionales profundos.
- **Sin números ni textos mágicos.** Valores como límites, tiempos, reintentos o distancias van en constantes con nombre o vienen de la configuración.
- **Tipado estricto.** En lenguajes tipados, sin `any` ni equivalentes; los tipos de datos se definen una vez y se comparten.

### 1.5 Manejo de errores y logs

- La validación de entradas ocurre en el límite de entrada del usuario o del sistema, no repetida en cada capa interna.
- No se agrega manejo de errores para escenarios que no pueden ocurrir.
- Los errores de red se capturan en un solo lugar (el cliente HTTP) y se traducen a mensajes claros para el usuario.
- Los errores de dominio usan una jerarquía propia y tipada, no cadenas sueltas.
- Solo se registran logs útiles: errores de peticiones y eventos relevantes para depurar en producción. Sin `console.log` de depuración en la rama principal.
- Los logs nunca exponen tokens, contraseñas ni datos personales de usuarios o clientes. Un dato sensible que la aplicación no necesita no se descarga ni se almacena.

### 1.6 Pruebas

- **Recomendada.** Probar con pruebas unitarias las reglas de negocio puras.
- Probar con pruebas de componente los formularios y flujos críticos.
- Si hay sincronización, caché o colas, probar orden, reintentos e idempotencia.
- Cada bug corregido deja una prueba que lo reproduce.
- Antes de cada entrega, una prueba manual de los flujos principales, incluidos los casos límite (sin conexión, datos vacíos, errores del servidor).

---

## 2. Arquitectura y organización

### 2.1 Estructura por funcionalidad

- El código se organiza por módulo de negocio, no por tipo de archivo. Cada módulo trae sus pantallas, componentes, hooks y llamadas a la API.
- Hay una carpeta `shared` con lo que no depende del dominio: componentes de interfaz, cliente HTTP, utilidades, tema.
- **Dirección de dependencias.** Un módulo solo importa de `shared` o de módulos de capas inferiores; nunca al revés ni entre módulos hermanos por rutas internas. Si dos módulos necesitan lo mismo, se sube a `shared`.

### 2.2 Código compartido entre aplicaciones

- Si el proyecto tiene varias aplicaciones (web, móvil, backend), se organiza como monorepo con `apps/*` y `packages/shared`.
- En `packages/shared` viven los tipos, los esquemas de validación, los estados del dominio y las constantes. Ninguna aplicación define su propia versión.
- Los contratos de datos de la API se actualizan primero en el tipo compartido y después en quien los consume.

### 2.3 Estado y datos

- El estado del servidor (listas, detalles) se maneja con una librería de caché de consultas, no con `useEffect` + `useState` a mano.
- El estado de interfaz (pestaña activa, filtros abiertos) vive en el componente que lo usa, o en un store pequeño si lo comparten varias pantallas.
- No se mezclan estado de dominio y estado visual en el mismo lugar.
- Toda marca de tiempo oficial la pone el servidor. Un cliente que registre sin conexión puede usar la hora del dispositivo, siempre marcada como no validada hasta que el servidor la reconcilie.
- **Apps offline-first (cuando el producto lo requiera):** se lee y escribe en una base local y se sincroniza con una cola de cambios pendientes. La interfaz accede a los datos solo mediante servicios con interfaz (fuente local y fuente remota), nunca directamente a la base local ni a la red. Los registros creados sin conexión llevan un identificador de cliente (UUID) y las operaciones son idempotentes.
- El frontend no accede a la base de datos; todo cambio persistente pasa por la API.

### 2.4 Dependencias

- No se agrega una librería nueva sin una necesidad concreta. Antes de instalarla se revisa si ya existe una equivalente en el proyecto.
- Se fijan versiones y se revisan las vulnerabilidades reportadas antes de actualizar.

---

## 3. Componentes reutilizables

- Antes de crear un componente se revisa si ya existe uno equivalente en `shared/ui`. No se duplica interfaz ya resuelta.
- Cualquier pieza sin lógica de negocio que se use (o pueda usarse) en más de un lugar va en `shared/ui`, clasificada así:
  - **Átomos:** elementos indivisibles (botón, campo de texto, etiqueta de estado, icono).
  - **Moléculas:** combinaciones simples con una sola responsabilidad (campo con etiqueta y error, tarjeta de métrica).
  - **Organismos:** secciones completas (tabla con filtros y paginación, formulario completo).
- Los componentes de `shared/ui` no conocen el dominio: reciben datos y funciones por props. La lógica de negocio y el acceso a datos viven en los módulos.
- Si una pantalla repite markup o estilos de otra, se extrae a `shared/ui` en lugar de copiarse.
- Piezas que deben existir desde el inicio y usarse en toda la plataforma: tabla paginada, tarjeta de métrica, etiqueta de estado, estado vacío, estado de carga (skeleton), mensaje de error con reintento, diálogo de confirmación, selector de fecha.

---

## 4. Reglas de interfaz (frontend)

### 4.1 Listados siempre paginados — obligatoria

Toda pantalla que muestre una lista usa paginación.

- **Paginación del lado del servidor.** La API recibe página y tamaño de página y devuelve solo esa porción más el total. Nunca se descarga la lista completa para cortarla en el cliente.
- **Tamaño por defecto:** 10 a 20 filas en web, con selector (10, 20, 50). En móvil, carga por tramos de 15 a 20 ítems.
- **Web:** controles de paginación visibles bajo la tabla (anterior, siguiente, número de página, total de registros) y el rango mostrado ("Mostrando 21 a 40 de 312").
- **Móvil:** desplazamiento infinito con carga por tramos (`FlatList` con `onEndReached` o equivalente), indicador de carga al final y mensaje cuando no hay más resultados. Nunca un `ScrollView` con todos los elementos.
- **Filtros y orden se aplican en el servidor** y reinician la paginación en la página 1.
- **La página, los filtros y el orden quedan en la URL** (web), de modo que al volver desde un detalle se regresa a la misma página y se puede compartir el enlace.
- **Estados:** mientras carga se muestran filas esqueleto (no un spinner a pantalla completa); si no hay resultados, un estado vacío con una acción sugerida; si falla, un mensaje con botón Reintentar.
- Al cambiar de página la tabla vuelve a su inicio.
- Las listas largas dentro de una pantalla (por ejemplo, adjuntos o ítems de un detalle) también se acotan: se muestran las primeras y un botón Ver todas, o se paginan.

### 4.2 Poco scroll vertical y componentes bien distribuidos — obligatoria

El usuario debe ver lo esencial sin recorrer una página larga. Criterio práctico: la información principal y las acciones frecuentes caben en la primera pantalla; en escritorio, el scroll de página no debe pasar de unas dos pantallas.

**Cómo lograrlo en web**

- Usar **grillas de varias columnas** en lugar de una sola columna apilada: tarjetas de métricas en fila, formularios en dos o tres columnas, detalle con datos a la izquierda y contenido secundario a la derecha.
- Agrupar contenido relacionado en **pestañas** y en **paneles laterales** o **diálogos** para acciones secundarias.
- Usar **secciones colapsables** (acordeones) para información de consulta ocasional. Lo más importante inicia abierto.
- Encabezado, filtros y barra de acciones **fijos** (sticky) mientras la lista o el formulario se desplazan. El botón principal (Guardar, Enviar) siempre visible.
- Tablas con scroll interno de alto limitado solo cuando sea imprescindible; preferir paginación (regla 4.1).
- Dashboard: un máximo de cuatro a seis tarjetas de métricas arriba, y debajo el contenido principal en columnas.
- Escritorio y tableta aprovechan el ancho disponible; no dejar columnas vacías ni contenido estirado a todo el ancho sin necesidad.

**Cómo lograrlo en móvil**

- Un asistente **paso a paso** para procesos largos, con una sola tarea por pantalla, en lugar de un formulario larguísimo.
- Imágenes en una **grilla de miniaturas** (2 columnas), no una lista vertical de fotos grandes.
- Barra de pestañas inferior para las secciones principales; botón de acción principal fijo en la parte inferior.
- Agrupar datos en tarjetas compactas y mostrar el detalle largo en una hoja inferior (bottom sheet) bajo demanda.
- Pensar en uso con una mano y con el pulgar: las acciones principales quedan en la parte baja.

### 4.3 Interfaz bonita y funcional — obligatoria

**Consistencia visual**

- Un **sistema de diseño único** con tokens: colores, tipografías, espaciados, radios de borde y sombras definidos una vez (tema del proyecto) y usados en todas las aplicaciones. Ningún color ni tamaño suelto escrito a mano.
- Escala de espaciado fija (por ejemplo, múltiplos de 4 u 8) y alineación coherente. Márgenes y paddings iguales para elementos del mismo tipo.
- Jerarquía clara: un solo botón primario por vista, los secundarios con menor énfasis. Títulos, subtítulos y texto de apoyo con tamaños distintos y consistentes.
- Color con significado y siempre el mismo: verde para correcto o validado, ámbar para pendiente o en revisión, rojo para crítico o error, azul para informativo. El color nunca es la única señal: se acompaña con texto o icono.
- Iconografía de un solo conjunto, con tamaños uniformes.

**Estados siempre cubiertos** (cada pantalla con datos los implementa)

- Cargando: esqueletos que imitan la forma del contenido.
- Vacío: mensaje amable, ilustración sencilla y la acción para empezar.
- Error: qué pasó, en lenguaje claro, y cómo reintentar.
- Éxito: confirmación breve (aviso temporal), sin bloquear.
- Sin conexión (si el producto la soporta): la aplicación sigue funcionando, muestra un banner permanente de modo sin conexión, el contador de cambios pendientes y el estado de sincronización (sincronizado, pendiente, sincronizando, error). No se deshabilitan botones por falta de internet.
- Desactivado: un botón deshabilitado explica por qué y qué falta.

**Formularios**

- Etiqueta visible en cada campo, ayuda breve cuando haga falta, error en línea y junto al campo, con texto específico ("Falta la foto 3").
- Validación al salir del campo y al enviar; no bloquear al usuario mientras escribe.
- Teclado correcto según el campo (numérico para cantidades, por ejemplo) y autoenfoque en el primer campo útil.
- Confirmación antes de acciones destructivas o irreversibles (eliminar, anular, devolver).

**Accesibilidad**

- Contraste de texto suficiente (mínimo 4.5:1), también bajo luz intensa en móvil.
- Objetivos táctiles de al menos 48 dp en móvil y 40 px en web.
- Todo se puede operar con teclado en web; el foco se ve; los elementos tienen nombre accesible (`aria-label`, `accessibilityLabel`).
- Imágenes con texto alternativo.
- Respetar el tamaño de letra del sistema en móvil.

**Responsividad**

- La web funciona en escritorio (desde 1280 px) y tableta (desde 768 px). Las grillas se reducen de columnas y los paneles laterales pasan a ser diálogos.
- La app móvil se adapta a pantallas pequeñas y grandes, a vertical y a letra grande, sin cortar contenido.

**Rendimiento percibido**

- Carga diferida de rutas y de imágenes pesadas; miniaturas en listados y la imagen completa solo al abrir.
- Comprimir archivos antes de subirlos; mostrar progreso de subida.
- Evitar re-renderizados innecesarios en listas largas (claves estables, `memo` donde se mida un problema, no por costumbre).
- Respuesta inmediata a cada acción: estado de carga en el botón al enviar, y deshabilitarlo para evitar doble envío.

**Textos**

- Lenguaje claro y directo, con el vocabulario del negocio. Sin jerga técnica en mensajes al usuario.
- Mismo término para lo mismo en toda la plataforma.
- Fechas, horas y números con el formato local del usuario.

---

## 5. Seguridad básica

- Tokens en almacenamiento seguro; nunca en el código ni en el repositorio.
- Variables de entorno para claves y direcciones; nunca valores fijos en el código.
- Toda validación importante se repite en el servidor; la del frontend solo mejora la experiencia.
- Los permisos se verifican en el servidor además de ocultar opciones en la interfaz.
- Los archivos subidos usan URL firmadas y, cuando la integridad importa, se protegen con hash.
- Los datos privados pendientes de subir se guardan en el almacenamiento privado de la aplicación.
- Sin secretos, credenciales ni datos personales reales en commits, logs ni capturas.

---

## 6. Lista de revisión antes de abrir un pull request

- [ ] Ningún archivo supera 100 líneas (150 como máximo justificado).
- [ ] Sin comentarios que expliquen lo obvio, código comentado ni `console.log`.
- [ ] Reutilicé componentes de `shared/ui`; no dupliqué interfaz.
- [ ] Todo listado está paginado en el servidor, con filtros y página guardados en la URL (web) o carga por tramos (móvil).
- [ ] La pantalla principal se ve sin scrollear de más: grillas, pestañas, secciones colapsables.
- [ ] Están cubiertos los estados de carga, vacío, error y sin conexión (si aplica).
- [ ] Usé solo tokens del tema; colores y espaciados coherentes.
- [ ] Revisé accesibilidad (contraste, foco, etiquetas, tamaño táctil) y responsividad.
- [ ] Probé las reglas de negocio nuevas.
- [ ] Sin secretos ni datos sensibles en código, logs ni commits.
- [ ] La rama cumple el formato `<type>/<short-description>-<issue|task-id>`.
- [ ] Los commits cumplen Conventional Commits, están en inglés y no mezclan tipos.
- [ ] El PR enlaza el issue o la tarea correspondiente y no contiene "WIP", "tmp" ni "test".

---

## 7. Control de versiones: ramas y commits

El estándar completo está en `Commits_Ramas_Git.md`. Resumen de lo que aplica a todo proyecto:

- No hay commits directos a `main`; todo cambio pasa por rama y revisión.
- **Ramas:** `<type>/<short-description>-<issue|task-id>`, con los prefijos `feature/`, `fix/`, `hotfix/`, `chore/`, `refactor/`, `release/` y `docs/`. Ejemplo: `feature/auth-system-231`.
- **Commits:** Conventional Commits, `<type>(<scope>): <short description>`, en inglés, con los tipos `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `chore` y `ci`. Ejemplo: `fix(api): handle 500 errors on user route`.
- Un commit hace un solo tipo de cambio; nunca se mezclan, por ejemplo, `feat` y `fix`.
- El cuerpo del commit explica el porqué del cambio cuando no es evidente.
- Cambios pequeños y enfocados: un pull request resuelve una cosa y enlaza su issue o tarea.
- Se pueden automatizar las validaciones con commitlint y un hook de commit para rechazar mensajes y nombres de rama inválidos antes de llegar al PR.
