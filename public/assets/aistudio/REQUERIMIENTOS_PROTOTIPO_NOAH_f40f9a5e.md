DOCUMENTO DE LEVANTAMIENTO DE REQUERIMIENTOS
Plataforma de gestión de negocios con asistente de IA por voz
NOAH  ·  Nombre de trabajo sujeto a confirmación
Enfoque inicial: restaurantes  |  Módulos extensibles: tiendas y negocios de servicios




CONTROL DEL DOCUMENTO	DETALLE
Tipo	Especificación funcional y guía para prototipo UX/UI
Versión	1.0 · Levantamiento inicial
Fecha de elaboración	31 de octubre de 2026
Proyecto	Nuevo producto comercial; independiente de otros sistemas
Fuente	Descripción inicial del promotor y transcripción de reunión de levantamiento
Estado	Para diseño, revisión y validación con el cliente


Propósito: convertir la visión del negocio en pantallas, recorridos, reglas y escenarios verificables durante la presentación del prototipo. La aprobación del prototipo precede al presupuesto definitivo y al desarrollo productivo.

Uso del documento
Base de trabajo para producto, diseño UX/UI, equipo técnico y validación comercial. No constituye por sí mismo un contrato, una estimación de costos ni una garantía de integración con terceros.
 
01  Resumen ejecutivo
Se propone un software comercial dirigido a micro, pequeñas y medianas empresas que requieren comprender sus ventas, egresos, costos y rentabilidad sin depender de operaciones complejas. El elemento diferenciador es un asistente de inteligencia artificial al que el propietario y el personal autorizado puedan hacer consultas y solicitudes por voz, con información proveniente de los módulos del negocio.
La primera vertical acordada para el prototipo es restaurantes. La solución deberá mostrar un sistema de gestión gastronómica reconocible —ventas, caja, inventario, costeo de platos, pedidos de meseros, cocina y delivery— complementado por una experiencia conversacional de consulta, captura y recomendación.
Problema que busca resolver
•	Propietarios que no pueden responder con claridad cuánto ganaron, cuánto gastaron o si el negocio es rentable.
•	Precios definidos sin conocer el costo real de preparación o prestación del servicio.
•	Pérdidas por compras, inventario inmovilizado, caducidad y merma no identificadas a tiempo.
•	Poca disponibilidad o conocimientos tecnológicos para revisar múltiples pantallas y reportes.
Objetivos del producto
ID	OBJETIVO DEL NEGOCIO
OBJ-01	Consultar ventas, gastos y rentabilidad estimada por voz y desde paneles visuales.
OBJ-02	Costear platos y conocer márgenes para apoyar decisiones de precio y promoción.
OBJ-03	Reducir desperdicios con alertas sobre existencias, fechas y rotación.
OBJ-04	Agilizar la toma de pedidos y su entrega a caja y cocina.
OBJ-05	Diseñar una base modular para planes de tiendas y futuras verticales.

Principio de alcance
Se diseña primero un prototipo navegable/semifuncional. “Incluido en prototipo” significa flujo y representación de experiencia; NO significa que las integraciones, el motor financiero o la IA estén conectados y operativos en producción.

02  Alcance acordado y extensiones
LÍNEA	ALCANCE EN ESTA ETAPA	ESTADO
Restaurante	Vertical principal: gestión, costeo, inventario, caja, pedidos, cocina, delivery y asistente por voz.	Principal · representar
Tienda / bodega	Variante simplificada reutilizando registro de ingresos/egresos y compras; inventario completo no obligatorio para el plan básico.	Alternativa · mostrar
Barbería	Vista conceptual de servicios y agenda de citas por voz, evitando reservas superpuestas.	Opcional · cotizar aparte
Salones / heladerías / otros	Posibles verticales según validación comercial.	Futuro · no cerrar alcance
Publicación en redes	Idea de automatización mediante propuesta y aprobación de contenido.	Exploración futura

La propuesta económica deberá separar los costos de la base gastronómica, la variante de tienda y los módulos adicionales, permitiendo decidir por cuál iniciar. Ningún precio ni plazo técnico definitivo fue acordado en la reunión.
Roles sugeridos para validar
ROL	USO PRINCIPAL
Propietario / administrador	Resumen financiero, configuración, consultas con IA, costos, promociones y autorizaciones.
Encargado / caja	Ventas, cobros, arqueo y consulta operativa según permisos.
Mesero	Creación y revisión de pedidos desde dispositivo móvil, incluyendo asistencia por voz.
Cocina	Recepción y cambio de estado de comandas.
Operador de inventario	Compras, insumos, stock, movimientos y proveedores.
Administrador de plataforma (propuesto)	Configuración de negocios y planes en un servicio comercial multiempresa; sujeto a aprobación.

03  Requerimientos funcionales — núcleo comercial
Convención: P = indispensable de representar en el prototipo principal; A = alternativa a ilustrar; V = validar antes del diseño o desarrollo. Las descripciones corresponden a comportamiento deseado, no a funcionalidad ya implementada.
3.1  Configuración, ventas y gastos
ID	REQUERIMIENTO	TIPO
RF-01	Registrar un negocio con sus datos básicos, moneda, giro y configuración inicial.	P
RF-02	Presentar un panel general con ventas del día, de la semana y del mes.	P
RF-03	Registrar ventas e ingresos con fecha, importe y concepto.	P
RF-04	Registrar compras, gastos operativos y egresos; permitir asociar comprobantes.	P
RF-05	Consultar flujo de caja simplificado y comparar entradas frente a salidas.	P
RF-06	Mostrar resultado o rentabilidad estimada del período, con detalle de supuestos.	P
RF-07	Comparar ventas de períodos equivalentes e identificar variaciones.	P
RF-08	Aplicar accesos por rol a información financiera y operaciones sensibles.	V

3.2  Carta, recetas y costeo gastronómico
ID	REQUERIMIENTO	TIPO
RF-09	Administrar platos/productos del menú con precios de venta y categorías.	P
RF-10	Definir recetas o fichas técnicas con insumos, cantidades y unidad de medida.	P
RF-11	Calcular el costo estimado por plato con base en insumos y precios registrados.	P
RF-12	Mostrar margen bruto referencial por plato y advertir sobre márgenes bajos o negativos.	P
RF-13	Permitir actualizar costos de insumos y reflejar el impacto en las recetas.	P
RF-14	Comparar precio de venta con costo para sugerir revisión de precios o promociones.	P
RF-15	Considerar el servicio inicial de costeo de platos como posible actividad de implementación.	V

04  Requerimientos funcionales — operación restaurante
4.1  Compras, proveedores, inventario y merma
ID	REQUERIMIENTO	TIPO
RF-16	Mantener catálogo de insumos, unidades, existencias, umbrales y ubicaciones.	P
RF-17	Registrar proveedores y asociarlos con compras y costos de insumos.	P
RF-18	Ingresar compras de insumos y actualizar existencias al confirmarlas.	P
RF-19	Registrar movimientos de stock: entrada, consumo, ajuste y pérdida/merma.	P
RF-20	Relacionar la venta de platos con consumo teórico de insumos según receta.	P
RF-21	Registrar fecha de ingreso y vencimiento o vida útil configurable cuando aplique.	P
RF-22	Alertar sobre stock excedente, baja rotación, próximos vencimientos o riesgo de merma.	P
RF-23	Proponer acciones sobre excedentes, como promociones, sin ejecutarlas automáticamente.	P

4.2  Mesas, pedidos y cocina
ID	REQUERIMIENTO	TIPO
RF-24	Administrar mesas o comandas y sus estados operativos.	P
RF-25	Crear pedidos desde móvil por mesero, con productos, cantidades y observaciones.	P
RF-26	Interpretar verbalmente un pedido conversacional y mostrarlo como borrador revisable.	P
RF-27	Permitir confirmar o corregir el pedido antes de enviarlo.	P
RF-28	Enviar pedido confirmado a caja y al panel de preparación de cocina.	P
RF-29	Mostrar estados de cocina: pendiente, en preparación y listo/entregado.	P
RF-30	Representar impresión de comandas o etiquetas para cocina; validar equipos y protocolos.	V
RF-31	Cerrar el pedido y asociarlo a la venta/cobro correspondiente.	P

4.3  Delivery
ID	REQUERIMIENTO	TIPO
RF-32	Mostrar gestión de pedidos para llevar y por delivery en la operación del restaurante.	P
RF-33	Prever conexión con plataformas externas de delivery, sin seleccionar proveedores todavía.	V
RF-34	Evitar que la demostración confunda canales mostrados con integraciones externas operativas.	V

05  Requerimientos funcionales — asistente de IA
5.1  Conversación, captura y recomendaciones
ID	REQUERIMIENTO	TIPO
RF-35	Disponer de interfaz conversacional por voz y respuesta en texto o audio.	P
RF-36	Responder preguntas del negocio usando información registrada y permisos del usuario.	P
RF-37	Informar cuánto se vendió hoy, cuánto se gastó y cómo va la semana frente a la anterior.	P
RF-38	Explicar resultados con período, cifras base y nivel de certeza cuando corresponda.	P
RF-39	Sugerir acciones frente a inventario en riesgo, bajo margen o caída de ventas.	P
RF-40	Permitir registro asistido de ingresos, egresos y compras por voz.	P
RF-41	Solicitar confirmación antes de guardar movimientos, pedidos o cambios.	P
RF-42	Mostrar alertas proactivas en un centro de notificaciones y/o asistente.	P
RF-43	Explorar motor de lenguaje y voz (se mencionaron OpenAI y ElevenLabs), sujeto a evaluación.	V
RF-44	Evaluar si el canal principal del asistente será aplicación web/móvil, WhatsApp u otro.	V

5.2  Ejemplos de interacción para la demostración
ESCENARIO	EJEMPLO DE INTERACCIÓN / RESULTADO
Resumen diario	“Noah, ¿cuánto vendimos hoy?” → ventas acumuladas, franja horaria y comparación breve.
Rentabilidad	“¿Cuánto ganamos este mes?” → resultado estimado y explicación de costos y gastos incluidos.
Comparación	“¿Esta semana vamos mejor que la anterior?” → variación absoluta y porcentual.
Merma potencial	“Hay cinco unidades de un insumo próximas a vencer; podrías evaluar una promoción”.
Captura de gasto	“Registra una compra de ingredientes por 180 soles” → formulario prellenado y confirmación.
Pedido por voz	“Dos pollos y tres ceviches para mesa cuatro” → pedido estructurado para confirmar.
Próxima vertical	“Noah, agéndame un corte el martes a las 14:00” → cita sujeta a disponibilidad.

Las respuestas anteriores son escenarios para validar la experiencia del prototipo, no promesas de exactitud, conectividad o autonomía sin desarrollo y pruebas.
06  Variantes de negocio y evolución
6.1  Tienda / bodega — plan simplificado
ID	REQUERIMIENTO	TIPO
RF-45	Habilitar una variante orientada a ventas, compras, gastos y resultado mensual estimado.	A
RF-46	Permitir registrar el importe de boletas y comprobantes mediante formulario o voz.	A
RF-47	Ofrecer consultas de ingresos/egresos sin exigir catálogo o inventario completo.	A
RF-48	Dejar como mejora futura la lectura automática de boletas/facturas, previa validación.	V

6.2  Barbería y otros servicios — extensión cotizable
ID	REQUERIMIENTO	TIPO
RF-49	Catalogar servicios (ej. cortes), precios y duración.	A
RF-50	Gestionar calendario y citas con horarios disponibles.	A
RF-51	Reservar mediante voz con confirmación y control de solapamientos.	A
RF-52	Reutilizar ingresos/egresos y reportes gerenciales del núcleo.	A

6.3  Automatización comercial futura
Se mencionó una referencia comercial donde un asistente propone publicaciones para redes sociales y las publica tras la aprobación del dueño. Se registrará como oportunidad futura de investigación, no como alcance confirmado del primer prototipo. Requiere definir redes, permisos, aprobación y condiciones de las API externas.
07  Pantallas y arquitectura de navegación del prototipo
El diseño debe ser sobrio, sencillo para usuarios no técnicos y coherente en escritorio y móvil. La interfaz debe dar acceso claro al asistente sin obligar a navegar por muchos reportes.
CÓD.	PANTALLA / VISTA	CONTENIDO QUE DEBE MOSTRAR
P-01	Acceso y selección del negocio	Inicio, negocio activo, acceso por rol; sujeto a confirmar modelo comercial.
P-02	Dashboard del propietario	KPIs de ventas, gastos, resultado estimado, tendencias y alertas.
P-03	Asistente “Noah”	Botón voz, transcripción, respuesta y propuestas de acción.
P-04	Ventas y caja	Operaciones, resumen de cobros y cierres del período.
P-05	Gastos y compras	Registro manual/por voz, comprobantes y clasificación.
P-06	Carta / menú	Platos, categorías, precios, disponibilidad.
P-07	Ficha de receta y costeo	Insumos, cantidades, costos, precio y margen estimado.
P-08	Inventario / stock	Existencias, movimientos, fechas y ajustes.
P-09	Proveedores	Directorio y relación con compras.
P-10	Alertas y recomendaciones	Alertas de vencimiento, exceso, rotación y acciones sugeridas.
P-11	Mesas / pedidos	Vista de mesas, pedidos y estados.
P-12	Pedido de mesero por voz (móvil)	Captura conversacional, borrador y confirmación.
P-13	Cocina / comandas	Cola de preparación, estado y salida de impresión/etiqueta.
P-14	Delivery	Pedidos por canal y estado; integraciones señaladas como pendientes.
P-15	Reportes	Ventas por período, margen por plato y comparativo semanal.
P-16	Configuración	Usuarios, negocio, notificaciones, conectores previstos.
A-01	Modo tienda	Dashboard simple y captura de ingresos/egresos.
A-02	Modo barbería (opcional)	Servicios, agenda y reserva por voz.

08  Flujos de usuario que el prototipo debe demostrar
FLUJO	SECUENCIA Y RESULTADO ESPERADO
F-01 · Consulta de dueño	Ingresar → dashboard → activar asistente → preguntar por ventas → respuesta con cifra, período y detalle.
F-02 · Costeo	Configurar insumos → definir receta → calcular costo → consultar margen → revisar recomendación.
F-03 · Alerta de stock	Ver inventario perecible → recibir aviso → consultar producto y plazo → evaluar promoción sin publicar automáticamente.
F-04 · Pedido de mesa	Mesero abre mesa → habla pedido → revisa transcripción y cantidades → confirma → aparece en caja/cocina.
F-05 · Pedido delivery	Seleccionar canal → registrar pedido → enrutar cocina/caja → consultar estado.
F-06 · Egresos por voz	Pedir registrar gasto → datos propuestos → confirmar → ver reflejo en flujo de caja.
F-07 · Modo tienda	Seleccionar modalidad simple → cargar ingresos/egresos → preguntar resultado aproximado.
F-08 · Cita barbería (opcional)	Consultar agenda → solicitar cita por voz → validar disponibilidad → confirmar reserva.

Diagrama conceptual de módulos
CAPA	ELEMENTOS
Experiencia	Dashboard web/móvil + asistente conversacional + notificaciones.
Núcleo de negocio	Usuarios, ventas, gastos, reportes y configuración.
Módulo restaurante	Recetas/costeo + inventario + compras/proveedores + mesas/pedidos + cocina + delivery.
Extensiones	Modo tienda simplificado + servicios/agenda para barbería.
Integraciones por evaluar	Modelo de IA, reconocimiento y síntesis de voz, impresión, delivery y mensajería.

09  Datos, reglas de negocio y límites de las respuestas
Datos mínimos a identificar en el prototipo
ENTIDAD	DATOS CLAVE DE REFERENCIA
Negocio	Nombre, giro, moneda, configuración y usuarios autorizados.
Plato / producto	Nombre, categoría, precio y receta asociada.
Insumo	Descripción, unidad, costo, cantidad disponible, vida útil y fecha relevante.
Compra / gasto	Importe, fecha, concepto, proveedor y comprobante opcional.
Venta / pedido	Fecha, canal, detalle, cantidades, importes, mesa y estados.
Proveedor	Identificación, contacto y productos suministrados.
Notificación	Regla, fecha, gravedad, estado y recomendación.
Interacción IA	Usuario, intención, datos consultados, propuesta de acción y confirmación.

Reglas propuestas para validación
ID	REGLA / SALVEDAD
RN-01	Los reportes dependen de la calidad y completitud de los datos ingresados o integrados.
RN-02	Costo teórico de un plato = suma del costo de cada insumo según la cantidad indicada en la receta.
RN-03	Margen bruto referencial = (precio de venta − costo teórico) / precio de venta, si el precio es mayor que cero.
RN-04	Resultado del negocio: mostrar cálculo y gastos incluidos; no equiparar automáticamente ingreso con utilidad neta.
RN-05	Los comparativos deben especificar rango temporal y base de comparación equivalente.
RN-06	Alertas perecibles requieren fecha/vida útil capturada y una regla explícita; no adivinar vencimientos.
RN-07	Acciones iniciadas por voz que cambien datos requieren revisión, permiso y confirmación del usuario.
RN-08	El pedido interpretado a partir de una conversación es borrador hasta su validación por el mesero.
RN-09	Las integraciones de terceros se consideran pendientes hasta comprobar disponibilidad, costos y permisos.
RN-10	Promociones sugeridas no se aplican automáticamente a precios o redes sociales sin autorización.

10  Consideraciones técnicas y no funcionales
Los siguientes puntos constituyen recomendaciones para estimar un sistema comercial mantenible. Deben revisarse con el cliente y no se presentan como decisiones técnicas ya aprobadas.
ÁREA	CRITERIO DE DISEÑO / VALIDACIÓN
Experiencia y accesibilidad	Navegación simple, lenguaje claro, soporte móvil para meseros, alternativa textual si falla el micrófono.
Datos confiables	Trazabilidad de la fuente, fecha de actualización, reglas de cálculo y advertencias por falta de datos.
Privacidad y seguridad	Separación de datos entre negocios, roles, auditoría de cambios, tratamiento de audio y permisos del micrófono.
Control de acciones IA	Confirmación humana de compras, gastos, pedidos, citas, publicaciones y operaciones con efecto económico.
Costos de operación	Evaluar consumo de IA/voz, almacenamiento, hosting, notificaciones, mensajería y costos por uso.
Despliegue	Definir si será app web adaptable, PWA, app móvil y/o canal WhatsApp; no se eligió una tecnología definitiva.
Impresión	Definir impresora/comandera/etiquetera, conectividad local y pruebas con dispositivos reales.
Delivery	Identificar plataformas específicas, API disponibles, conciliación de pedidos y costos de integración.
SaaS / planes	Evaluar modalidad multiempresa y planes diferenciados; negocio aún debe validar su esquema de comercialización.
Disponibilidad	Definir respaldos, monitoreo, sincronización y funcionamiento ante caída de red según escenarios reales.

11  Criterios de aceptación del prototipo
Los puntos siguientes permiten validar que el prototipo representa lo conversado, sin exigir todavía una integración productiva.
ID	EVIDENCIA DE VALIDACIÓN
CA-01	El prototipo abre directamente una experiencia reconocible de administración de restaurante.
CA-02	El tablero resume ventas, gastos, rentabilidad estimada y comparación de semanas.
CA-03	El dueño puede recorrer una pregunta por voz y ver de dónde se obtiene la cifra mostrada.
CA-04	Existe un flujo visual completo de receta, costeo y margen por plato.
CA-05	Se muestra inventario, compras, alertas de sobrantes y productos perecibles.
CA-06	Se puede demostrar visualmente una sugerencia de promoción a partir de una alerta.
CA-07	El mesero captura un pedido por voz, lo revisa y confirma antes del envío.
CA-08	Un pedido confirmado se refleja en las vistas de caja y cocina en el recorrido diseñado.
CA-09	Se representan impresión/etiquetado y delivery sin afirmar que están integrados.
CA-10	Se distingue el modo básico tienda del flujo más completo de restaurante.
CA-11	La vista de barbería, si se incluye, muestra agenda y no solapamiento de horarios.
CA-12	Los módulos opcionales quedan identificados para una cotización separada.
CA-13	Las acciones de IA tienen confirmación antes de alterar el negocio.
CA-14	La demostración identifica claramente datos de ejemplo, simulaciones y conexiones pendientes.

12  Preguntas abiertas y decisiones pendientes
PRIORIDAD	PUNTO POR CONFIRMAR
Alta	Definir plan inicial y alcance productivo mínimo: sistema restaurante completo o versión reducida por fases.
Alta	Determinar plataforma principal del asistente: web/móvil, WhatsApp u otros canales.
Alta	Definir cómo se capturarán las ventas, compras y costos (manual, comprobantes, importación o terceros).
Alta	Conseguir ejemplos reales de recetas, insumos, fichas técnicas, costos y reportes para validar reglas.
Alta	Definir qué plataformas delivery y qué hardware de cocina deben conectarse.
Alta	Acordar si la transcripción se procesa en vivo, se graba audio o se utiliza activación puntual.
Media	Definir roles definitivos y permisos, número de negocios por cuenta y planes comerciales.
Media	Precisar indicadores financieros y tratamiento de impuestos, descuentos, devoluciones y costos fijos.
Media	Definir qué acciones puede ejecutar la IA, qué confirma el usuario y qué se limita a recomendaciones.
Media	Revisar viabilidad, precios, privacidad y condiciones de OpenAI, proveedor de voz y mensajería.
Media	Validar marca comercial final: “Noah” es una denominación preliminar.
Media	Determinar si la integración con redes sociales se mantiene como etapa posterior.

Riesgos de implementación a comunicar desde la propuesta
•	El asistente no conocerá automáticamente ingresos, egresos ni margen si el negocio no registra o sincroniza datos confiables.
•	El costeo de platos puede requerir levantamiento inicial de recetas, gramajes, desperdicios y precios de compra por cliente.
•	Reconocer pedidos completos en conversaciones ruidosas exige evaluación con audio real y un paso obligatorio de confirmación.
•	Delivery, WhatsApp, publicaciones automáticas e impresión dependen de APIs, hardware, permisos y costos externos.
•	La rentabilidad calculada será referencial hasta acordar criterios contables, impuestos, gastos indirectos y cierres.
13  Acuerdos de la reunión y siguiente paso
ASPECTO	ACUERDO / OBSERVACIÓN
Prioridad de prototipado	Comenzar por restaurantes, usando como referencia el flujo de sistemas gastronómicos habituales e incorporando IA por voz.
Variantes	Mostrar la posibilidad de aislar el módulo de tienda/bodega y valorar barbería como módulo adicional.
Extras restaurante	Representar pedidos por mesero, comunicación con cocina, etiquetera/comandera y delivery.
Tipo de entrega	Prototipo visual, navegable o semifuncional, para revisar y ajustar antes de cerrar alcance.
Propuesta comercial	Presentar presupuestos separables por módulos, con tiempos definitivos tras validar el prototipo.
Reunión de revisión	Miércoles, 17:00 (hora compartida de Perú y Ecuador); fecha calendario a confirmar.
Alcance no decidido	No se acordaron aún precio final, cronograma de desarrollo ni proveedor técnico definitivo.

Recomendación de orden para la demostración
1) Dashboard del dueño → 2) consulta por voz de ventas y rentabilidad → 3) costeo de plato → 4) inventario y alerta de merma → 5) pedido de mesero por voz hasta cocina → 6) vista delivery → 7) variante tienda → 8) barbería como extensión opcional → 9) esquema de módulos para la propuesta económica.
Criterio de cierre: el promotor valida que el prototipo representa su visión de negocio y delimita cuáles módulos se desarrollarían en la primera fase. Cualquier integración real, costo recurrente o automatización crítica se estimará por separado antes de contratar.

