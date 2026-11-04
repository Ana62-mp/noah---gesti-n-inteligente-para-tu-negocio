import { Customer } from '../types';

type CustomerSeed = [name: string, phone: string, email: string, documentId: string, address: string, birthday: string, visits: number, spent: number, balance: number, lastVisit: string, notes: string, optIn: boolean];

const build = (prefix: string, city: string, seeds: CustomerSeed[]): Customer[] =>
  seeds.map(([name, phone, email, documentId, address, birthday, visits, totalSpent, balanceDue, lastVisit, notes, marketingOptIn], index) => ({
    id: `${prefix}-${index + 1}`,
    name,
    phone,
    email,
    documentId,
    address,
    city,
    birthday,
    visits,
    totalSpent,
    balanceDue,
    lastVisit,
    notes,
    marketingOptIn,
    createdAt: `2026-0${1 + (index % 8)}-${String(3 + index * 2).padStart(2, '0')}`,
  }));

export const RESTAURANT_CUSTOMERS: Customer[] = build('rc', 'Quito', [
  ['María Elena Vinueza', '0998812233', 'mevinueza@correo.ec', '1712345678', 'Av. Coruña N24-18 y Whymper', '1984-03-12', 18, 412.5, 0, '2026-11-03', 'Almuerza los martes. Alérgica al maní.', true],
  ['Gabriel Pazmiño', '0987129900', 'gabriel.pazmino@correo.ec', '1723456789', 'La Floresta, calle Toledo 340', '1990-07-22', 9, 187, 0, '2026-11-02', 'Pide el encebollado sin cebolla.', true],
  ['Sofía Carrión', '0954417890', 'sofia.carrion@correo.ec', '1734567890', 'González Suárez N32-15', '1995-11-05', 6, 124.5, 0, '2026-10-30', '', false],
  ['Andes Consulting S.A.', '022458811', 'compras@andesconsulting.ec', '1791234567001', 'Av. República del Salvador N36-84', '', 24, 1180, 86.5, '2026-10-29', 'Factura mensual. Crédito a 15 días.', true],
  ['Luis Fernando Paredes', '0991020304', 'lparedes@correo.ec', '1745678901', 'Mariscal Foch E7-45', '1988-01-30', 12, 256, 0, '2026-10-28', 'Prefiere mesa junto a la ventana.', true],
  ['Daniela Játiva', '0983344556', 'dani.jativa@correo.ec', '1756789012', 'Av. 12 de Octubre N24-593', '1992-09-14', 7, 143, 0, '2026-10-27', '', true],
  ['Colegio San Gabriel', '022334455', 'tesoreria@sangabriel.edu.ec', '1790011223001', 'Av. América N30-12', '', 5, 640, 120, '2026-10-24', 'Eventos de fin de año.', false],
  ['Patricio Naranjo', '0972233445', 'pnaranjo@correo.ec', '1767890123', 'Cumbayá, Vía Interoceánica km 12', '1979-05-08', 15, 322, 0, '2026-10-22', 'Cliente frecuente de fines de semana.', true],
  ['Verónica Almeida', '0961122334', 'vero.almeida@correo.ec', '1778901234', 'La Carolina, Av. Eloy Alfaro', '1993-12-19', 4, 78, 0, '2026-10-20', '', true],
  ['Hotel Plaza Real', '023456789', 'cocina@plazareal.ec', '1792345678001', 'Av. Amazonas N21-147', '', 10, 980, 210, '2026-10-18', 'Pedidos de catering para grupos.', true],
  ['Carlos Guamán', '0959988776', 'cguaman@correo.ec', '1789012345', 'Calderón, Av. Giovanni Calles', '1985-08-27', 3, 54, 0, '2026-10-15', '', false],
  ['Marcela Troya', '0948877665', 'marcela.troya@correo.ec', '1790123456', 'Iñaquito, Av. Naciones Unidas', '1991-04-03', 8, 164, 0, '2026-10-12', 'Pide factura con RUC.', true],
]);

export const STORE_CUSTOMERS: Customer[] = build('sc', 'Guayaquil', [
  ['Lourdes Zambrano', '0991112020', 'lourdes.zambrano@correo.ec', '0912345678', 'Urdesa Central, calle Ebanos 410', '1971-02-18', 42, 318, 24.5, '2026-11-03', 'Compra pan y leche cada mañana.', true],
  ['Hugo Briones', '0982223030', '', '0923456789', 'Urdesa, calle Circunvalación 120', '1966-10-02', 37, 276, 58, '2026-11-03', 'Paga al fin de mes.', false],
  ['Marlene Cevallos', '0973334040', 'marlene.cevallos@correo.ec', '0934567890', 'Urdesa, calle Víctor Emilio Estrada', '1980-06-25', 29, 212, 0, '2026-11-02', '', true],
  ['Carmen Pincay', '0964445050', '', '0945678901', 'Ceibos, mz. 12 villa 4', '1975-09-09', 21, 158, 31.5, '2026-11-01', 'La llaman "Tía Carmita".', false],
  ['José Tomalá', '0955556060', '', '0956789012', 'Kennedy Norte, calle Nahim Isaías', '1998-03-30', 16, 96, 28, '2026-10-31', 'Repartidor, compra snacks.', false],
  ['Unidad Educativa Urdesa', '042381100', 'proveeduria@ueurdesa.edu.ec', '0990123456001', 'Urdesa, av. Las Lomas', '', 12, 410, 0, '2026-10-30', 'Pedido semanal de jugos y galletas.', true],
  ['Rosa Mendieta', '0946667070', 'rosa.mendieta@correo.ec', '0967890123', 'Urdesa, calle Dr. Emilio Romero', '1969-12-11', 33, 244, 15, '2026-10-29', '', true],
  ['Pedro Macías', '0937778080', '', '0978901234', 'Ceibos, cooperativa Los Álamos', '1983-07-17', 18, 132, 0, '2026-10-28', '', false],
  ['Karina Villón', '0928889090', 'karina.villon@correo.ec', '0989012345', 'Urdesa, calle Costanera', '1994-01-21', 14, 118, 9.5, '2026-10-27', 'Compra para la oficina.', true],
  ['Taller Mecánico El Pistón', '042398877', '', '0991234560001', 'Urdesa, av. Guillermo Pareja', '', 9, 188, 46, '2026-10-26', 'Compra bebidas para el personal.', false],
  ['Jorge Cedeño', '0919990101', '', '0901234567', 'Kennedy, calle Costanera', '1977-05-05', 11, 87, 0, '2026-10-24', '', false],
  ['Gladys Alcívar', '0910001212', 'gladys.alcivar@correo.ec', '0912340987', 'Urdesa Norte', '1962-08-14', 26, 201, 0, '2026-10-23', 'Prefiere atún y arroz.', true],
  ['Doña Teresa Loor', '0901112323', '', '0923459876', 'Ceibos, mz. 7 villa 12', '1958-11-28', 31, 236, 12, '2026-10-20', '', false],
  ['Iván Plúas', '0992223434', 'ivan.pluas@correo.ec', '0934560987', 'Urdesa, calle Higueras', '1989-02-02', 6, 52, 0, '2026-10-18', 'Cliente nuevo del barrio.', true],
]);

export const BARBER_CUSTOMERS: Customer[] = build('bc', 'Cuenca', [
  ['Santiago Proaño', '0981112233', 'santiago.proano@correo.ec', '0104567890', 'El Vergel, calle Lamar 4-21', '1992-04-16', 14, 112, 0, '2026-11-03', 'Fade bajo cada 3 semanas.', true],
  ['Andrés Viteri', '0993334455', 'andres.viteri@correo.ec', '0115678901', 'Av. Remigio Crespo 3-40', '1988-09-01', 9, 90, 0, '2026-11-03', 'Combo corte y barba.', true],
  ['Fernando Noboa', '0975556677', '', '0126789012', 'Centro Histórico, calle Larga 7-33', '1979-12-24', 21, 126, 0, '2026-11-03', 'Puntual, siempre con David.', false],
  ['Luis Paredes', '0987651122', 'luis.paredes@correo.ec', '0107890123', 'Ricaurte, calle Los Cerezos', '1995-06-07', 6, 60, 10, '2026-10-20', '', true],
  ['Mateo Orellana', '0969998877', 'mateo.orellana@correo.ec', '0158901234', 'Yanuncay, av. Loja 5-12', '1999-02-14', 18, 144, 0, '2026-10-31', 'Estudiante, descuento universitario.', true],
  ['Diego Crespo', '0958887766', '', '0109012345', 'Challuabamba', '1984-10-30', 11, 99, 0, '2026-10-30', '', false],
  ['Esteban Molina', '0947776655', 'esteban.molina@correo.ec', '0110123456', 'Monay, calle Tarqui', '1991-01-09', 8, 76, 0, '2026-10-28', 'Prefiere barbero Carlos.', true],
  ['Pablo Arévalo', '0936665544', '', '0101234567', 'El Batán', '1986-07-19', 15, 135, 10, '2026-10-27', '', false],
  ['Javier Tenesaca', '0925554433', 'javier.tenesaca@correo.ec', '0112345098', 'Totoracocha', '1997-03-22', 5, 42, 0, '2026-10-25', 'Primera visita en octubre.', true],
  ['Ricardo Idrovo', '0914443322', '', '0123450987', 'San Sebastián', '1982-11-11', 13, 117, 0, '2026-10-24', '', false],
  ['Cristian Vélez', '0903332211', 'cristian.velez@correo.ec', '0134509876', 'Gil Ramírez Dávalos', '1993-08-05', 7, 66, 0, '2026-10-22', '', true],
  ['Academia Deportiva Cuenca', '074101010', 'contacto@adcuenca.ec', '0190123456001', 'Av. Ordóñez Lasso', '', 4, 160, 40, '2026-10-20', 'Cortes para el equipo juvenil.', true],
  ['Marco Peña', '0992221100', 'marco.pena@correo.ec', '0145098761', 'Misicata', '1990-05-26', 10, 90, 0, '2026-10-17', '', false],
  ['Wilson Siguencia', '0981110099', '', '0156098712', 'Sayausí', '1975-09-30', 16, 128, 0, '2026-10-15', 'Siempre barba completa.', false],
]);
