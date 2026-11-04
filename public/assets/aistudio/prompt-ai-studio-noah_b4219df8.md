# ROL Y OBJETIVO

Actúa como un equipo senior de producto, diseño UX/UI y frontend React. Construye un **prototipo web navegable y semifuncional** llamado **NOAH**: una plataforma de gestión para micro, pequeños y medianos negocios con un **asistente de inteligencia artificial por voz y texto, también llamado "Noah"**, al que el dueño y su personal pueden preguntarle por su negocio sin tener que navegar por muchas pantallas.

El prototipo se presentará al cliente para validar la idea antes de presupuestar el desarrollo real. Debe verse como un producto comercial terminado, con datos de ejemplo realistas, y dejar claro qué está simulado y qué integraciones están pendientes.

**Problema que resuelve:** dueños que emprendieron sin conocimientos de administración y no saben cuánto ganan, cuánto gastan, si su negocio es rentable ni cuánto les cuesta preparar cada plato. Ponen precios "porque el de la esquina lo vende así", pierden dinero por merma y sobrestock, y no tienen tiempo ni habilidad tecnológica para revisar reportes. Esa falta de control es una de las principales causas de quiebra. Noah les permite "hablar con su negocio".

Todo el texto visible va en **español** (Ecuador, trato cercano de "tú", vocabulario ecuatoriano). **País por defecto: Ecuador. Moneda por defecto: dólares estadounidenses (USD, símbolo $)**, configurable en Ajustes a otros países (ej. Perú, S/). Formatos locales de Ecuador: `Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' })` para importes, hora en 24 h, fechas dd/mm/aaaa, zona horaria America/Guayaquil. Términos locales: "factura" o "nota de venta" (no "boleta"), "nómina/sueldos" (no "planilla"), "tienda" (no "bodega") para el negocio de barrio, IVA 15 % y RUC en los datos del negocio.

---

# STACK TÉCNICO

- React + TypeScript (estricto, sin `any`) + Vite.
- Tailwind CSS con los tokens de diseño definidos más abajo (nada de colores sueltos escritos a mano).
- `lucide-react` para iconos (un solo set, tamaños uniformes).
- `recharts` para gráficos.
- `framer-motion` para animaciones y microinteracciones.
- Navegación con estado o `react-router` en modo hash. La sección activa, la página de los listados y los filtros se guardan en la URL (query string) para poder volver al mismo lugar.
- **Sin backend:** todos los datos vienen de una capa `services/` con datos mock en memoria que **simula una API paginada** (`getPage({ page, pageSize, filters, sort })` devuelve `{ items, total }` con un retardo de 300–600 ms) para poder mostrar estados de carga reales.
- Estado global ligero con React Context (o Zustand): negocio activo, rol activo, módulos activados, pedidos, notificaciones. Al confirmar un pedido o gasto, el cambio se refleja en todas las vistas (caja, cocina, dashboard, flujo de caja).
- Persistir en `localStorage` la configuración elegida (tipo de negocio, rol, módulos) para que la demo recuerde la personalización.
- **IA:** el chat funciona en **"Modo demo"** con respuestas guionizadas por defecto (tiene que funcionar sin clave). Añade un interruptor **"Modo IA real (Gemini)"** que use `@google/genai` con `process.env.API_KEY` (modelo `gemini-2.5-flash`): se le envía un system prompt con el rol de Noah y un resumen JSON de los datos mock del negocio activo, y debe responder con un JSON `{ texto, datosUsados[], periodo, certeza, accion? }` para pintar las mismas tarjetas que el modo demo. Si falla o no hay clave, vuelve al modo demo con un aviso amable.
- **Voz:** usa la Web Speech API (`SpeechRecognition`, `lang: 'es-EC'`) para transcripción real cuando el navegador la soporte, y `speechSynthesis` para que Noah lea sus respuestas en voz alta (botón de altavoz). Siempre debe existir además un botón **"Simular audio"** que reproduzca una transcripción guionizada palabra por palabra, para que la demo funcione aunque no haya micrófono o permisos. Si el micrófono falla, ofrecer la alternativa de escribir.

## Organización del código (clean code)

- Estructura por funcionalidad: `src/modules/{dashboard, assistant, sales, expenses, menu, recipes, inventory, suppliers, alerts, tables, kitchen, delivery, reports, store, barbershop, appointments, settings, onboarding, mobile-preview}` y `src/shared/{ui, hooks, services, theme, utils, types}`.
- Nombres de archivos, componentes y variables en inglés; textos visibles en español.
- Componentes pequeños, de una sola responsabilidad (idealmente menos de 100–150 líneas por archivo). Lógica de negocio en funciones puras (`calculateDishCost`, `calculateGrossMargin`, `compareWeeks`, `hasAppointmentOverlap`, `detectOverstock`), separadas de la interfaz.
- Constantes con nombre para umbrales (por ejemplo `LOW_MARGIN_THRESHOLD = 0.30`, `EXPIRY_WARNING_DAYS = 3`). Sin números mágicos.
- Sin comentarios obvios, sin código comentado, sin `console.log`. Sin emojis en el código.

## Librería de componentes reutilizables (`shared/ui`)

Créala primero y úsala en todas las pantallas; no dupliques interfaz:
- **Átomos:** Button (primario, secundario, fantasma, peligro; estado de carga), IconButton, Input, Select, Badge/StatusTag (color + icono + texto), Avatar, Switch, Tooltip.
- **Moléculas:** FormField (etiqueta, ayuda, error en línea), MetricCard (valor, variación con flecha, sparkline), AlertItem, SearchBar, DatePicker, ModuleCard (catálogo), ChatBubble, VoiceButton con onda animada.
- **Organismos:** PaginatedTable (paginación, filtros, orden, rango "Mostrando 21 a 40 de 312", selector 10/20/50), SidePanel/Drawer, ConfirmDialog, Tabs, Accordion, EmptyState, SkeletonLoader, ErrorState con botón "Reintentar", Toast, PhoneFrame (marco de celular).

---

# IDENTIDAD VISUAL

## Logo (invéntalo en SVG inline)

Diseña un logo original para NOAH: un isotipo que combine la letra **"N"** con una **onda de voz o burbuja de diálogo** (idea: "habla con tu negocio"), con trazos redondeados y amables. Wordmark "NOAH" en tipografía geométrica bold con tracking amplio. Debe funcionar en color sobre blanco, en blanco sobre el color oscuro y en tamaño favicon. Crea también un **avatar de Noah** para el chat: un orbe/círculo con gradiente cálido que "respira" cuando está en reposo, ondula cuando escucha y gira suavemente cuando piensa.

## Paleta y tokens

Base minimalista en **blanco y negro**, con la paleta otoñal como acentos. Define estos tokens en el tema de Tailwind / variables CSS y no uses otros colores:

| Token | Hex | Uso |
|---|---|---|
| `white` | #FFFFFF | Fondo principal, tarjetas |
| `black` | #111111 | Texto principal, titulares |
| `cream` / Nectar Jackpot | #EBD48F | Fondos suaves, resaltados, chips seleccionados (usar también tintes muy claros, ej. #FBF6E6, para superficies) |
| `banana` / Ripe Banana | #D59F3F | Advertencias, acentos, gráficos secundarios (siempre con texto oscuro encima) |
| `cinnamon` / Cinnamon | #CF6811 | Color de marca y energía: orbe de Noah, botón de micrófono, gráfico principal, estados activos (texto blanco solo en tamaños grandes/bold) |
| `terracotta` / Muddy | #A43108 | Botón primario (texto blanco), errores/crítico, alertas urgentes |
| `espresso` / Old Study | #421A05 | Sidebar, encabezados oscuros, fondo del modo app, texto sobre crema |
| `olive` / Mud Brown | #5C5011 | Éxito, "confirmado", "listo", ganancias |
| `harvest` / Corn Harvest | #8A7424 | Información, texto secundario de acento, gráficos terciarios |
| grises | derivados de #111 (ej. #6B6B6B, #E7E5E0, #F5F4F1) | Bordes, textos de apoyo, separadores |

Significado constante del color (siempre acompañado de icono y texto, nunca solo color): **olive = éxito/listo**, **banana = pendiente/advertencia**, **terracotta = crítico/error**, **harvest = informativo**, **cinnamon = Noah/IA**. Contraste mínimo 4.5:1 en texto.

Gradiente de marca para Noah y momentos destacados: `cinnamon → banana`, con toques de `terracotta`.

## Estilo

- **Minimalista pero dinámico y divertido:** mucho espacio en blanco, tarjetas con radio grande (16–24 px), sombras suaves, tipografía "Plus Jakarta Sans" o "Outfit" (Google Fonts), números grandes y legibles.
- Microinteracciones con framer-motion: tarjetas que entran escalonadas, contadores numéricos animados, botón de micrófono con pulso, onda de audio en vivo, confeti sutil al confirmar un pedido o una cita, transición suave al cambiar de módulo.
- Ilustraciones simples (SVG inline) en los estados vacíos.
- Escala de espaciado en múltiplos de 4/8. Un solo botón primario por vista.
- Modo oscuro opcional (toggle) usando `espresso` como fondo.

---

# REGLAS DE INTERFAZ OBLIGATORIAS

1. **Poco scroll:** lo esencial y las acciones frecuentes caben en la primera pantalla. Usa grillas de varias columnas, pestañas, paneles laterales, acordeones y encabezados/barras de acción fijas (sticky). En escritorio, el scroll de página no pasa de unas dos pantallas.
2. **Listados siempre paginados** (ventas, gastos, insumos, movimientos, proveedores, pedidos, platos, citas): 10 por página por defecto, selector 10/20/50, anterior/siguiente, número de página, total y rango visible. Filtros y orden reinician en página 1. Las listas cortas dentro de una vista muestran las primeras y un "Ver todas".
3. **Estados cubiertos en cada vista con datos:** cargando (esqueletos con la forma del contenido, no spinner a pantalla completa), vacío (mensaje amable + ilustración + acción), error (mensaje claro + Reintentar; añade un interruptor oculto en Configuración > Demo para forzar errores y mostrarlo), éxito (toast breve), botón deshabilitado que explica qué falta.
4. **Formularios:** etiqueta visible, ayuda breve, error junto al campo con texto específico, validación al salir del campo y al enviar, teclado numérico en importes y cantidades, autofoco en el primer campo, confirmación antes de acciones destructivas.
5. **Accesibilidad:** navegable con teclado, foco visible, `aria-label` en botones de icono, objetivos táctiles de 40 px en web y 48 px en móvil, texto alternativo en imágenes.
6. **Responsive real:** escritorio (≥1280), tableta (≥768) y celular (≥360). En celular el sidebar se convierte en barra de pestañas inferior, los paneles laterales en hojas inferiores (bottom sheets) y las tablas en tarjetas compactas. El botón flotante de Noah siempre visible y al alcance del pulgar.
7. **Transparencia de la demo:** una cinta discreta "Prototipo · datos de ejemplo" en la parte superior, y etiquetas "Simulado" o "Integración pendiente" en delivery, impresión, WhatsApp y IA cuando corresponda. Nunca dar a entender que algo externo está conectado.

---

# ESTRUCTURA DE LA APLICACIÓN

## 1. Bienvenida y personalización (onboarding) — "Arma tu NOAH"

La plataforma se adapta al negocio y al rol de cada persona. Al entrar por primera vez (y desde Configuración > "Personalizar mi NOAH") se muestra un asistente de 4 pasos, uno por pantalla, con barra de progreso y la mascota/orbe de Noah guiando con frases cortas:

1. **¿Qué negocio tienes?** Tarjetas grandes ilustradas: Restaurante (recomendado, marcado "Plan completo"), Tienda de barrio / Minimarket ("Plan básico"), Barbería / Salón ("Extensión"), Otro negocio de servicios ("Próximamente": heladería, salón de belleza, etc.).
2. **Datos básicos:** nombre del negocio, RUC (opcional), país (Ecuador preseleccionado), moneda (USD preseleccionado), ciudad (Quito, Guayaquil, Cuenca…), número de empleados.
3. **¿Quién eres tú?** Rol: Dueño/Administrador, Encargado de caja, Mesero, Cocina, Operador de inventario.
4. **Catálogo de módulos:** grilla de ModuleCards con icono, nombre, descripción de una línea, interruptor y etiqueta de tipo: **"Base"** (incluido), **"Recomendado para ti"** (preseleccionado según el giro) o **"Módulo adicional · cotizable"**. Filtros por categoría: Finanzas, Operación, Inventario, Ventas, Clientes, IA. El usuario elige los que necesita; la navegación lateral y el dashboard se construyen solo con los módulos activos.

Módulos del catálogo:
- **Finanzas (base):** Ventas y caja, Gastos y compras, Flujo de caja, Rentabilidad estimada, Reportes.
- **Restaurante:** Carta/menú, Recetas y costeo de platos, Mesas y pedidos, Cocina/comandas, Delivery y para llevar, Impresión de comandas/etiquetas (pendiente).
- **Inventario:** Insumos y bodega, Proveedores, Alertas de vencimiento y merma.
- **Servicios:** Catálogo de servicios, Agenda de citas.
- **IA:** Asistente Noah (siempre activo), Alertas proactivas, Resumen diario por voz, Sugerencias de promociones.
- **Futuro (deshabilitados, con etiqueta "Próximamente"):** Lectura automática de facturas y notas de venta (y a futuro conexión con facturación electrónica del SRI), Reportes por WhatsApp, Publicación en redes sociales con aprobación del dueño.

Al terminar: confeti sutil y "¡Listo, Carlos! Tu NOAH está armado". También existe un botón **"Cargar demo de restaurante"** para saltar el onboarding.

**Selector rápido en el encabezado:** cambiar de negocio (Restaurante "La Sazón de Carlos", Tienda "Tienda Doña Rosa", Barbería "Barber Kings") y de rol. Al cambiar de rol, el menú y los datos visibles se ajustan (el mesero no ve finanzas; cocina solo ve comandas; inventario ve insumos, compras y proveedores; caja ve ventas y cobros). Mostrar un aviso "Vista como: Mesero" para que el cliente entienda los permisos.

## 2. Layout principal

- **Sidebar** en `espresso` con el logo, módulos activos agrupados (Inicio, Finanzas, Operación, Inventario, Reportes, Configuración) y un enlace destacado **"Ver como app móvil"**.
- **Encabezado:** buscador global, selector de negocio y rol, campana del **Centro de notificaciones** con contador, avatar.
- **Botón flotante de Noah** (orbe animado) en todas las pantallas: abre el chat como panel lateral en escritorio y a pantalla completa en celular. Atajo de teclado: `Ctrl + K` o mantener la barra espaciadora para hablar.
- **Recorrido guiado:** botón "Recorrido de la demo" que lleva paso a paso con tooltips por el orden de presentación: 1) dashboard del dueño, 2) consulta por voz de ventas y rentabilidad, 3) costeo de plato, 4) inventario y alerta de merma, 5) pedido de mesero por voz hasta cocina, 6) delivery, 7) modo tienda, 8) barbería, 9) catálogo de módulos para la propuesta.

## 3. Pantallas del restaurante (caso principal: "La Sazón de Carlos", Quito)

**P-02 Dashboard del dueño** (sin scroll en escritorio):
- Fila de 4–6 MetricCards: Ventas de hoy, Ventas de la semana (vs. semana anterior en %), Gastos del mes, Resultado estimado del mes, Margen promedio de la carta, Pedidos activos.
- Debajo, en dos columnas: gráfico de ventas de esta semana vs. la anterior (líneas o barras) y el panel **"Noah te avisa"** con alertas proactivas y botones de acción.
- Saludo personalizado ("Buenas noches, Carlos. Hoy vendiste $780,50, un 12 % más que el martes pasado") y una barra "Pregúntale a Noah…" con chips de preguntas sugeridas.
- Cada cifra muestra en tooltip **de dónde sale** (período, fuente, fecha de actualización).

**P-03 Asistente Noah** (pantalla completa, además del panel flotante) — ver sección detallada más abajo.

**P-04 Ventas y caja:** tabla paginada de ventas (fecha, canal: salón/para llevar/delivery, mesa, importe, método de pago), resumen de cobros por método, botón "Registrar venta" (formulario o voz), y pestaña "Cierre de caja" con arqueo del día.

**P-05 Gastos y compras:** tabla paginada (fecha, concepto, categoría, proveedor, importe, comprobante adjunto), registro manual o **por voz** (Noah prellena el formulario y pide confirmación), carga de foto del comprobante (simulada) y clasificación por categoría (insumos, servicios básicos, sueldos, arriendo, otros).

**Flujo de caja:** entradas vs. salidas por día/semana/mes (gráfico de barras apiladas) y saldo acumulado.

**P-06 Carta / menú:** platos en tarjetas o tabla con categoría, precio, disponibilidad (switch) y una **etiqueta de margen** (verde olive ≥ 50 %, banana 30–50 %, terracotta < 30 % o negativo).

**P-07 Ficha de receta y costeo** (flujo estrella, muy visual):
- Selecciona un plato (ej. "Seco de pollo", "Ceviche de camarón", "Encebollado", "Churrasco", "Jugo de naranjilla (jarra)").
- Tabla editable de insumos: insumo, cantidad, unidad, costo unitario, subtotal. Fórmula visible: **costo teórico = Σ (cantidad × costo unitario)**; **margen bruto = (precio − costo) / precio**.
- Panel derecho: precio de venta, costo, ganancia por plato, margen con indicador circular animado y un **simulador**: "Si el camarón sube a $11/kg…" (slider) y "Si subo el precio a $10,50…" que recalculan en vivo.
- Recomendación de Noah: "Tu ceviche de camarón deja solo 18 % de margen porque el camarón subió 15 % este mes. Considera subir el precio de $9,00 a $10,50 o acompañarlo con chifles en lugar de canguil extra." Con aviso: "Cifras referenciales según los datos registrados".

**P-08 Inventario / bodega:** pestañas Existencias | Movimientos | Vencimientos. Tabla paginada de insumos (nombre, unidad, stock, umbral mínimo, ubicación, fecha de ingreso, vencimiento, estado con StatusTag: Normal, Stock bajo, Sobrestock, Por vencer). Registrar movimiento: entrada, consumo, ajuste, merma. Mostrar el consumo teórico de insumos según las ventas de platos.

**P-09 Proveedores:** directorio paginado con contacto, insumos que provee, última compra y variación de precio; panel lateral con historial de compras.

**P-10 Alertas y recomendaciones (Centro de notificaciones):** lista con gravedad, regla que la disparó, fecha y acción sugerida. Ejemplos:
- "Tienes 5 pollos de más que vencen mañana. Haz una promo 2x1 en seco de pollo hoy para que no se conviertan en merma." → botones **"Crear promoción"** (abre un borrador de promoción editable: nombre, descuento, duración, platos; con texto "No se publica ni se aplica sin tu aprobación") y "Descartar".
- "Esta semana vas 8 % por debajo de la semana pasada a esta misma hora. Los miércoles bajan las ventas de almuerzo."
- "El margen del ceviche de camarón bajó a 18 %."
- "3 kg de limón por vencer en 2 días."
- "Llevas 3 días con más egresos que ingresos."
Nunca se aplica una promoción ni un cambio de precio sin confirmación.

**P-11 Mesas / pedidos:** plano de mesas en grilla (libre, ocupada, pidiendo, por cobrar) con colores + icono + texto. Al abrir una mesa: detalle del pedido, tiempo transcurrido, botón cobrar y cerrar (se asocia a la venta).

**P-12 Pedido del mesero por voz** (se muestra dentro del marco de celular, ver sección App móvil): flujo completo descrito en "Transcripción de voz".

**P-13 Cocina / comandas:** tablero Kanban **Pendiente → En preparación → Listo/Entregado**, tarjetas con mesa, platos, observaciones ("sin cebolla") y temporizador que cambia de color si se demora. Botón "Imprimir comanda / etiqueta" que muestra una vista previa de ticket térmico con la etiqueta **"Impresión simulada · equipo por definir"**. Cuando el mesero confirma un pedido, aparece aquí con animación y sonido suave.

**P-14 Delivery y para llevar:** pedidos por canal (Propio/WhatsApp y plataformas de delivery usadas en Ecuador, mostradas como "App delivery A", "App delivery B", "App delivery C", con texto genérico y sin logos de marcas reales) con estado (recibido, en cocina, en camino, entregado). Cada canal externo con etiqueta **"Integración pendiente"**. Botón "Nuevo pedido para llevar".

**P-15 Reportes:** ventas por período, margen por plato (barras horizontales ordenadas), platos más y menos rentables, comparativo semanal, gastos por categoría (dona). Filtro de período y botón "Exportar PDF" (simulado). Botón "Pedirle a Noah que me lo explique".

**P-16 Configuración:** datos del negocio, usuarios y roles (tabla de permisos por rol), notificaciones (qué alertas recibir y por dónde: app, WhatsApp-próximamente), conectores previstos (OpenAI/Gemini, voz, impresora, delivery, WhatsApp, redes sociales) cada uno con estado "Pendiente de evaluar", y sección "Demo" (restablecer datos, forzar estados de error/vacío, modo IA real).

## 4. Modo tienda ("Tienda Doña Rosa", Guayaquil, plan básico)

Al cambiar a este negocio, la interfaz se **simplifica visiblemente** (comparar con el restaurante): dashboard con solo 3 tarjetas grandes (Ingresos del mes, Egresos del mes, Resultado aproximado), un gráfico simple de ingresos vs. egresos, y dos botones enormes **"+ Ingreso"** y **"+ Egreso"** (por formulario o por voz). Registro de facturas y notas de venta de proveedores por monto (foto opcional; "Lectura automática de facturas: próximamente"). No exige inventario completo. Noah responde: "Este mes vendiste $4.800 y gastaste $3.650. Te quedan aprox. $1.150 antes de pagar el arriendo." Mostrar un banner "Plan básico · puedes activar Inventario como módulo adicional".

## 5. Barbería ("Barber Kings", extensión cotizable)

- Catálogo de servicios en lugar de platos: Corte clásico (30 min, $6), Fade (45 min, $8), Barba (20 min, $4), Corte + barba (60 min, $10).
- **Agenda** semanal/diaria por barbero, con bloques de colores por servicio.
- Reserva por voz: "Noah, agéndame un corte el martes a las 2 de la tarde para Luis" → Noah transcribe, interpreta y muestra una tarjeta de cita (cliente, servicio, fecha, hora, barbero, duración) para confirmar. **Control de solapamiento:** si el horario choca, Noah lo dice y propone los 3 horarios libres más cercanos como chips.
- Reutiliza ingresos/egresos y reportes del núcleo. Etiqueta "Módulo adicional · cotización aparte".

---

# EL ASISTENTE NOAH (LO MÁS IMPORTANTE)

## Interfaz del chat

- Encabezado con el orbe animado, nombre "Noah", estado ("Escuchando…", "Pensando…", "Listo") y selector **Modo demo / IA real**.
- Burbujas de usuario y de Noah; Noah responde con texto + **tarjetas ricas** dentro del chat: mini-gráficos, KPIs, tablas pequeñas, formularios prellenados y botones de acción ("Confirmar", "Editar", "Cancelar", "Ver detalle", "Crear promoción").
- Cada respuesta con cifras incluye un pie desplegable **"¿De dónde sale este dato?"**: período, módulos consultados (Ventas, Gastos, Recetas…), fecha de actualización y nivel de certeza ("Alta: datos completos" / "Media: faltan gastos de 2 días").
- **Botón de micrófono grande** (cinnamon, con pulso) para hablar: mientras escucha, onda de audio animada y la **transcripción en vivo** apareciendo palabra por palabra. Alternativa de escribir siempre disponible.
- Botón de altavoz en cada respuesta para escucharla (síntesis de voz).
- Chips de preguntas sugeridas que cambian según el rol y el negocio activo.
- Indicador de "escribiendo" con tres puntos y respuestas que aparecen con efecto de tipeo.
- Historial de conversaciones en una columna lateral (escritorio).
- Noah se presenta la primera vez: "¡Hola, Carlos! Soy Noah, tu asistente. Pregúntame cómo va tu negocio o pídeme que registre algo por ti."

## Reglas de comportamiento de Noah

- Responde con cifra, período, base de comparación y una explicación breve en lenguaje simple, sin jerga contable.
- **Nunca guarda, envía ni cambia nada sin confirmación**: gastos, ventas, pedidos, citas, promociones y precios se muestran como borrador con "Confirmar / Editar / Cancelar". Tras confirmar, muestra un toast y el cambio se refleja en la vista correspondiente.
- Si faltan datos, lo dice ("No tengo registrados los gastos de luz de este mes, así que el resultado podría ser menor").
- No confunde ingreso con ganancia: explica qué gastos incluyó.
- Respeta el rol: si el mesero pregunta "¿cuánto ganamos este mes?", responde "Esa información solo la ve el dueño o el administrador".
- Personalidad: cercana, positiva, breve, un toque de humor ligero; trata al usuario por su nombre.

## Conversaciones de ejemplo (modo demo, todas deben funcionar con chips y por voz)

Implementa un motor de intenciones por palabras clave que reconozca variaciones de estas preguntas y responda con datos coherentes con el mock:

1. **"Noah, ¿cuánto vendimos hoy?"** → "Hoy llevas **$780,50** en 86 pedidos. La mejor franja fue de 12:30 a 14:30, el almuerzo ($352,00). Vas **12 % arriba** del martes pasado." + mini gráfico por horas.
2. **"¿Cuánto ganamos este mes?"** → "Tu resultado estimado de octubre es **$2.950**: vendiste $15.400, el costo de insumos fue $6.300 y los gastos operativos $6.150 (arriendo, sueldos, luz, agua, gas)." + tarjeta desglosada + aviso "Referencial: no descuenta IVA ni impuesto a la renta".
3. **"¿Esta semana vamos mejor que la anterior?"** → variación absoluta y porcentual por día con gráfico comparativo.
4. **"¿Cuál es mi plato menos rentable?"** → ranking de margen con el ceviche de camarón al final y sugerencia de precio.
5. **"¿Cuánto me cuesta hacer un encebollado?"** → desglose de insumos, costo, precio, margen + botón "Abrir ficha de costeo".
6. **"¿Qué tengo por vencer?"** → lista de insumos y propuesta de promoción.
7. **"Registra una compra de ingredientes por 45 dólares en el mercado"** → formulario prellenado (concepto, categoría Insumos, proveedor Mercado Mayorista, $45,00, hoy) → Confirmar → aparece en Gastos y en flujo de caja.
8. **"Dos secos de pollo y tres ceviches de camarón para la mesa cuatro, uno sin cebolla"** → borrador de pedido estructurado → Confirmar → llega a Cocina y Caja.
9. **"¿Cuánto tengo en caja?"** → saldo del día por método de pago.
10. **"Dame un consejo para vender más el miércoles"** → sugerencia ("Los miércoles tus ventas bajan 20 %. Prueba un 'Miércoles de encebollado' 2x1 de 7 a 10 de la mañana; con tu margen actual seguirías ganando $1,20 por plato").
11. (Barbería) **"Agéndame un corte el martes a las 2 de la tarde"** → cita sujeta a disponibilidad con control de choques.
12. (Tienda) **"¿Cuánto gasté este mes?"** → egresos por categoría.

Además, un **resumen diario proactivo**: al abrir la app por la noche, Noah muestra una tarjeta "Tu día en 20 segundos" con ventas, gastos, el mejor plato y una alerta, con botón para escucharlo.

---

# TRANSCRIPCIÓN DE VOZ (DEMOSTRACIÓN DESTACADA)

Crea una sección **"Noah escucha"** (accesible desde el chat y desde la app del mesero) que muestre el poder de la transcripción con dos escenarios seleccionables:

**Escenario A — Mesero tomando pedido en la mesa 4:**
1. El mesero toca "Tomar pedido por voz" y deja el celular escuchando mientras conversa con los clientes.
2. Transcripción en vivo (simulada palabra por palabra o real con el micrófono), con identificación visual de hablantes ("Mesero" / "Cliente"):
   > Cliente: "Hola, buenas, para empezar queremos dos secos de pollo, por favor."
   > Mesero: "Perfecto, ¿con arroz y maduro?"
   > Cliente: "Sí. Y también tres ceviches de camarón, pero uno sin cebolla, con chifles."
   > Cliente: "Ah, y una jarra de jugo de naranjilla."
   > Mesero: "Listo, dos secos de pollo, tres ceviches de camarón, uno sin cebolla, y una jarra de naranjilla."
3. Mientras transcribe, los platos detectados se **resaltan** en el texto y van apareciendo con animación en una lista lateral "Pedido detectado".
4. Al terminar, Noah muestra el **borrador de pedido**: mesa 4, cantidades editables (+/−), observaciones, total calculado y una advertencia si algo no se entendió ("¿Dijiste 'naranjilla' en jarra o en vaso?").
5. Botón "Repetir pedido en voz alta" (síntesis de voz) para confirmarlo con la mesa.
6. **Confirmar y enviar** → animación del pedido "volando" a Cocina y Caja; en el tablero de cocina aparece la comanda nueva y en Mesas la mesa 4 pasa a "Ocupada".

**Escenario B — Barbero agendando cita:**
"Noah, agéndame un corte con barba para Luis el martes a las 2 de la tarde" → transcripción → tarjeta de cita interpretada → validación de disponibilidad (si choca, propone alternativas) → Confirmar → la cita aparece en la agenda con animación.

**Escenario C — Dueño registrando un gasto:** "Noah, pagué 85 dólares de luz" → gasto prellenado → Confirmar.

Mostrar en cada escenario una nota pequeña: "Demostración. En producción se evaluará el reconocimiento con audio real del local y siempre se pedirá confirmación."

---

# VISTA APP MÓVIL

Además de que toda la web sea responsive, crea una sección **"Ver como app móvil"** para que el cliente compare y decida entre "web responsive" o "app nativa":

- Pantalla dividida: a la izquierda una breve explicación con dos tarjetas comparativas ("Web adaptable: se usa desde el navegador en cualquier dispositivo, sin instalar" vs. "App móvil: se instala, acceso rápido al micrófono, notificaciones push") y un selector de perfil (Dueño, Mesero, Barbero); a la derecha un **mockup de celular realista** (PhoneFrame con notch, barra de estado con hora y batería, esquinas redondeadas, sombra) con una **mini app totalmente navegable** dentro.
- **App del dueño:** barra de pestañas inferior (Inicio, Noah, Finanzas, Alertas, Más). Inicio con tarjetas compactas deslizables (ventas de hoy, resultado del mes) y el orbe de Noah grande al centro con "Toca para hablar". Notificación push simulada que cae desde arriba: "Noah: tienes 5 pollos de más, ¿hacemos una promo?".
- **App del mesero:** lista de mesas, botón grande "Tomar pedido por voz", flujo completo del Escenario A adaptado a una mano (acciones abajo, al alcance del pulgar), y lista de "Mis pedidos" con estado de cocina en tiempo real.
- **App del barbero:** agenda del día y botón de voz para agendar.
- Botones para rotar el celular o cambiar de tamaño (iPhone / Android pequeño) y un toggle de modo oscuro de la app.
- Fondo de la mini app en blanco con acentos `cinnamon`, y pantalla de bienvenida (splash) con el logo sobre `espresso`.

---

# DATOS MOCK (realistas y coherentes entre sí)

- **Restaurante "La Sazón de Carlos"** (Quito): dueño Carlos Mendoza; 12 mesas; 4 meseros (Ana, Jorge, Lucía, Pedro); 2 cocineros; 25 platos ecuatorianos (encebollado, ceviche de camarón, seco de pollo, churrasco, hornado, fritada, llapingacho, bolón de verde, guatita, locro de papa, encocado de pescado, arroz con menestra y carne asada, almuerzo del día, colada morada con guagua de pan por temporada, jugo de naranjilla, cola, etc.) con precios entre $1,50 y $14, recetas con 4–8 insumos y márgenes variados (algunos bajos o negativos para que haya alertas); 40 insumos con proveedores, stock, umbrales y fechas de vencimiento (algunos por vencer y en sobrestock: pollo, limón, camarón, plátano verde, papa chola); 8 proveedores; 60 días de ventas (≈ 300 registros, con patrones: fines de semana altos, miércoles bajos); 80 gastos; 15 pedidos activos repartidos en estados; 10 pedidos delivery.
- **Tienda "Tienda Doña Rosa"** (Guayaquil): 3 meses de ingresos y egresos en USD, 20 facturas/notas de venta de proveedores (distribuidoras de bebidas, lácteos, pan).
- **Barbería "Barber Kings"** (Cuenca): 3 barberos, 4 servicios, 2 semanas de citas con algunos huecos y un horario ya ocupado el martes a las 14:00 para demostrar el control de choques.

Todas las cifras de Noah deben coincidir con las de los dashboards.

---

# CRITERIOS DE ACEPTACIÓN (verifica que se cumplan)

- Abre directamente en una experiencia reconocible de administración de restaurante (o en el onboarding con opción "Cargar demo").
- El dashboard resume ventas, gastos, rentabilidad estimada y comparación semanal, con alertas visibles.
- El dueño puede preguntar por voz (o simulación) y ver de dónde sale la cifra.
- Existe un flujo completo de receta → costeo → margen por plato con simulador.
- Se ven inventario, compras, alertas de sobrestock/vencimiento y la sugerencia de promoción a partir de una alerta, sin aplicarla automáticamente.
- El mesero captura un pedido por voz, lo revisa, lo corrige, lo confirma y aparece en Cocina y Caja.
- Impresión y delivery se representan claramente como "simulado / integración pendiente".
- Se distingue el modo tienda (simple) del restaurante (completo) y existe la barbería con agenda y control de solapamientos.
- El catálogo de módulos permite personalizar la plataforma por giro y rol, y marca los módulos adicionales cotizables.
- Toda acción de IA pide confirmación antes de cambiar datos.
- Existe la vista "App móvil" con mockup navegable y toda la web es responsive.
- Los listados están paginados, las pantallas tienen poco scroll y cubren estados de carga, vacío y error.
- Todo se ve cuidado, consistente con la paleta, minimalista, alegre y con animaciones fluidas.

Construye la aplicación completa, con todas las pantallas navegables y los flujos funcionando con datos mock. Prioriza en este orden si necesitas recortar: 1) asistente Noah con chat, voz y transcripción, 2) dashboard y alertas, 3) costeo de platos, 4) pedido de mesero hasta cocina, 5) vista app móvil, 6) personalización por módulos y roles, 7) inventario, 8) modo tienda, 9) barbería, 10) delivery y reportes.
