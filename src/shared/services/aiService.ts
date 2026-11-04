import { ChatMessage, BusinessConfig, UserRole } from '../types';
import { askGemini } from './geminiClient';
import { getRestrictedAnswer, isExpenseCapture, normalizeQuery, parseExpenseCapture } from './assistantPolicy';
import { matchRoleIntent } from './roleIntents';
import { getDefaultSections } from '../permissions/rolePermissions';
import { formatCurrency } from '../utils/formatters';

const nowLabel = () => new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

export interface AIResponse {
  message: ChatMessage;
  requiresConfirmation?: boolean;
}

export class AIService {
  private isGeminiMode: boolean = false;

  public setGeminiMode(enabled: boolean) {
    this.isGeminiMode = enabled;
  }

  public getGeminiMode(): boolean {
    return this.isGeminiMode;
  }

  /**
   * Main chat query handler: checks if Gemini mode is enabled, otherwise uses rich demo pattern matcher
   */
  public async askNoah(
    userQuery: string,
    business: BusinessConfig,
    role: UserRole,
    history: ChatMessage[] = [],
    sections: readonly string[] = getDefaultSections(role)
  ): Promise<AIResponse> {
    const normalized = normalizeQuery(userQuery);
    const restricted = getRestrictedAnswer(role, normalized, sections);
    if (restricted) {
      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: restricted,
          timestamp: nowLabel(),
          provenance: {
            period: 'Control de acceso',
            modules: ['Permisos y roles'],
            updatedAt: 'Ahora',
            certainty: 'Alta: restricción de rol activa',
          },
        },
      };
    }

    if (this.isGeminiMode) {
      try {
        const live = await askGemini(userQuery, business, role, history, sections);
        if (live) return { message: live };
      } catch (err) {
        console.warn('Gemini unavailable, using demo engine.', err);
      }
    }

    const roleAnswer = await matchRoleIntent(normalized);
    if (roleAnswer) {
      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: roleAnswer.text,
          timestamp: nowLabel(),
          source: 'demo',
          provenance: {
            period: 'Hoy',
            modules: roleAnswer.modules,
            updatedAt: 'Ahora',
            certainty: 'Alta: datos de ejemplo del prototipo',
          },
        },
      };
    }

    const demo = this.matchDemoIntent(normalized, business, role, userQuery);
    return { ...demo, message: { ...demo.message, source: 'demo' } };
  }

  private matchDemoIntent(query: string, business: BusinessConfig, role: UserRole, spokenQuery: string): AIResponse {
    const timestamp = nowLabel();

    if (!isExpenseCapture(query)) {
      if (business.type === 'store') return this.matchStoreIntent(role, timestamp);
      if (business.type === 'barbershop' || business.type === 'services') return this.matchBarberIntent(query, timestamp);
    }

    // 1. ¿Cuánto vendimos hoy?
    if (query.includes('cuanto vendimos') || query.includes('ventas de hoy') || query.includes('ventas hoy')) {
      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: `Hoy llevas **$780,50** en 86 pedidos confirmados. La franja más fuerte fue el almuerzo (12:30 a 14:30) con **$352,00**. ¡Vas un **12 % arriba** del martes pasado a esta misma hora!`,
          timestamp,
          cards: [
            {
              type: 'kpi',
              title: 'Resumen de ventas de hoy',
              data: {
                total: '$780,50',
                pedidos: 86,
                mejorFranja: '12:30 - 14:30 ($352,00)',
                frenteAlMartes: '+12 %',
              },
            },
          ],
          provenance: {
            period: 'Hoy (00:00 a 14:30)',
            modules: ['Ventas y Caja', 'Mesas y Salón', 'Delivery'],
            updatedAt: 'Hace 2 minutos',
            certainty: 'Alta: 86 transacciones conciliadas',
          },
        },
      };
    }

    // 2. ¿Cuánto ganamos este mes? / Rentabilidad
    if (query.includes('cuanto ganamos') || query.includes('ganancia') || query.includes('rentabilidad') || query.includes('resultado del mes')) {
      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: `Tu resultado estimado de octubre es **$2.950,00**:\n• Vendiste **$15.400,00** en total.\n• Costo de insumos consumidos: **$6.300,00**.\n• Gastos operativos: **$6.150,00** (arriendo $850, nómina $2.900, luz $185, gas, agua y varios).`,
          timestamp,
          cards: [
            {
              type: 'kpi',
              title: 'Desglose financiero - Octubre 2026',
              data: {
                ventas: '$15.400,00',
                costoInsumos: '-$6.300,00',
                gastosOperativos: '-$6.150,00',
                resultadoNetoEstimado: '$2.950,00',
                margenNeto: '19.1 %',
              },
            },
          ],
          provenance: {
            period: '01/10/2026 al 31/10/2026',
            modules: ['Ventas', 'Gastos y Compras', 'Fichas de Costeo'],
            updatedAt: 'Cierre preliminar de octubre',
            certainty: 'Media: cifras referenciales antes de deducción de IVA y retenciones SRI',
            notes: 'No incluye amortización de equipos de cocina ni provisión patronal extraordinaria.',
          },
        },
      };
    }

    // 3. ¿Esta semana vamos mejor que la anterior?
    if (query.includes('esta semana') || query.includes('semana anterior') || query.includes('comparativo semanal') || query.includes('vamos mejor')) {
      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: `Sí, Carlos. En lo que va de esta semana acumulas **$2.140,00** frente a **$1.960,00** de la semana pasada al mismo corte (**+$180,00**, un **+9.2 %**). El lunes creció un 14 % y hoy martes vas +12 %.`,
          timestamp,
          cards: [
            {
              type: 'chart',
              title: 'Comparativo semanal (Lunes y Martes)',
              data: {
                estaSemana: '$2.140,00',
                semanaAnterior: '$1.960,00',
                diferencia: '+9,2 %',
              },
            },
          ],
          provenance: {
            period: 'Semana 45 vs Semana 44',
            modules: ['Ventas y Caja'],
            updatedAt: 'Hoy, 14:30',
            certainty: 'Alta: datos directos de punto de venta',
          },
        },
      };
    }

    // 4. ¿Cuál es mi plato menos rentable?
    if (query.includes('menos rentable') || query.includes('peor margen') || query.includes('menos ganancia') || query.includes('bajo margen')) {
      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: `Tu plato menos rentable hoy es el **Ceviche de camarón**, con un margen bruto de solo **18 %** (debería estar sobre el 45 %). Cada porción te cuesta **$7,38** y la vendes a **$9,00** (ganas solo $1,62 por plato).\n\n**Causa:** El camarón mediano subió un 15 % este mes en Mariscos del Pacífico.\n**Sugerencia:** Si subes el precio a **$10,50**, tu margen sube a 30 %; o acompáñalo con chifles en lugar de porción doble de canguil.`,
          timestamp,
          cards: [
            {
              type: 'dish_cost',
              title: 'Alerta de costeo: Ceviche de Camarón',
              data: {
                dishName: 'Ceviche de camarón',
                sellingPrice: 9.00,
                cost: 7.38,
                margin: '18 %',
                targetMargin: '45 %',
                suggestedPrice: 10.50,
              },
            },
          ],
          provenance: {
            period: 'Costo actualizado al 30/10/2026',
            modules: ['Carta y Menú', 'Recetas y Costeo', 'Proveedores (Mariscos del Pacífico)'],
            updatedAt: 'Ayer',
            certainty: 'Alta: receta detallada con gramajes reales',
          },
        },
      };
    }

    // 5. ¿Cuánto me cuesta hacer un encebollado?
    if (query.includes('cuesta hacer un encebollado') || query.includes('costo encebollado') || query.includes('receta de encebollado')) {
      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: `Preparar un **Encebollado mixto de albacora** te cuesta **$1,85**. Lo vendes a **$4,50**, lo que te deja una ganancia bruta de **$2,65** por plato (un excelente **59 % de margen**).\n\nDesglose principal:\n• Albacora fresca (0.22 kg): $1,14\n• Yuca y cebolla paiteña: $0,24\n• Limón, chifles y aliños: $0,47`,
          timestamp,
          cards: [
            {
              type: 'dish_cost',
              title: 'Ficha técnica: Encebollado de albacora',
              data: {
                dishName: 'Encebollado mixto',
                sellingPrice: 4.50,
                cost: 1.85,
                margin: '59 %',
                gainPerDish: '$2,65',
              },
            },
          ],
          provenance: {
            period: 'Precios de mercado vigentes',
            modules: ['Recetas y Costeo'],
            updatedAt: '02/11/2026',
            certainty: 'Alta: ficha validada con compras del Mercado Mayorista',
          },
        },
      };
    }

    // 6. ¿Qué tengo por vencer? / Merma
    if (query.includes('por vencer') || query.includes('vencen') || query.includes('merma') || query.includes('vencimientos') || query.includes('sobrestock')) {
      if (role !== 'owner') {
        return {
          message: {
            id: `msg-noah-${Date.now()}`,
            sender: 'noah',
            text: `Tienes **5 pollos enteros (≈ 13 kg)** en la cámara frigorífica que **vencen mañana** y **3 kg de limón sutil** que deben rotar en máximo 2 días.\n\nEl dueño recibió el mismo aviso y decide qué hacer con ese excedente.`,
            timestamp,
            provenance: {
              period: 'Control de caducidades a 48h',
              modules: ['Insumos y Bodega', 'Alertas y Merma'],
              updatedAt: 'Hoy, 08:30',
              certainty: 'Alta: fechas de ingreso de Distribuidora Los Andes',
            },
          },
        };
      }

      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: `⚠️ Tienes **5 pollos enteros (≈ 13 kg)** en la cámara frigorífica que **vencen mañana**.\nAdemás, hay **3 kg de limón sutil** que deben rotar en máximo 2 días.\n\nTe propongo crear un borrador de promoción para hoy: **"2x1 en Seco de Pollo"** o almuerzo con jugo de limón imperial, para transformar ese sobrestock en liquidez antes de que sea pérdida.`,
          timestamp,
          actionDraft: {
            id: `draft-promo-${Date.now()}`,
            type: 'promo',
            title: 'Borrador: Promo 2x1 en Seco de Pollo',
            details: {
              plato: 'Seco de pollo',
              precioOriginal: '$11,00 (2 platos)',
              precioPromo: '$7,50',
              vigencia: 'Hoy hasta las 16:00',
              canal: 'Salón y Para Llevar',
              aviso: 'No se publica ni se aplica sin tu confirmación.',
            },
            status: 'pending',
          },
          provenance: {
            period: 'Control de caducidades a 48h',
            modules: ['Insumos y Bodega', 'Alertas y Merma'],
            updatedAt: 'Hoy, 08:30',
            certainty: 'Alta: fechas de ingreso de Distribuidora Los Andes',
          },
        },
        requiresConfirmation: true,
      };
    }

    // 7. Registra una compra / gasto
    if (isExpenseCapture(query)) {
      const { amount, concept, category, supplier } = parseExpenseCapture(spokenQuery);

      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: `He preparado el borrador de este gasto para que lo verifiques antes de guardarlo en tu flujo de caja:`,
          timestamp,
          actionDraft: {
            id: `draft-exp-${Date.now()}`,
            type: 'expense',
            title: `Borrador de gasto: ${formatCurrency(amount)}`,
            details: {
              concepto: concept,
              monto: amount,
              categoria: category,
              proveedor: supplier,
              fecha: 'Hoy (03/11/2026)',
              metodoPago: 'Por confirmar',
              estado: 'Requiere tu confirmación',
            },
            status: 'pending',
          },
          provenance: {
            period: 'Captura asistida por voz',
            modules: ['Gastos y Compras', 'Flujo de Caja'],
            updatedAt: 'Ahora',
            certainty: 'Pendiente de confirmación humana',
          },
        },
        requiresConfirmation: true,
      };
    }

    // 8. Dos secos de pollo y tres ceviches para la mesa cuatro
    if (query.includes('secos de pollo') || query.includes('ceviches') || query.includes('mesa cuatro') || query.includes('mesa 4')) {
      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: `He interpretado el pedido para la **Mesa 4**:\n• 2 Secos de pollo ($11,00)\n• 3 Ceviches de camarón ($27,00) — *1 sin cebolla con chifles*\n• 1 Jarra de jugo de naranjilla ($4,00)\n\nTotal estimado: **$42,00**. ¿Confirmas el envío a cocina y apertura de comanda?`,
          timestamp,
          actionDraft: {
            id: `draft-ord-${Date.now()}`,
            type: 'order',
            title: 'Comanda Mesa 4 (Salón)',
            details: {
              mesa: 4,
              items: [
                { nombre: 'Seco de pollo', cantidad: 2, subtotal: 11.00 },
                { nombre: 'Ceviche de camarón', cantidad: 3, subtotal: 27.00, nota: '1 sin cebolla, con chifles' },
                { nombre: 'Jarra de naranjilla', cantidad: 1, subtotal: 4.00 },
              ],
              total: 42.00,
              mesero: 'Ana',
            },
            status: 'pending',
          },
          provenance: {
            period: 'Toma de pedido por voz',
            modules: ['Mesas y Salón', 'Cocina y Comandas'],
            updatedAt: 'Ahora',
            certainty: 'Borrador revisable',
          },
        },
        requiresConfirmation: true,
      };
    }

    // 9. ¿Cuánto tengo en caja? / Cierre de caja
    if (query.includes('en caja') || query.includes('cierre de caja') || query.includes('saldo de caja')) {
      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: `En caja llevas **$780,50** cobrados hoy, repartidos así:\n• Efectivo físico: **$395,00**\n• Tarjetas de débito/crédito (Datafast): **$225,50**\n• Transferencias Pichincha / DeUna: **$160,00**\n\nFondo inicial registrado: **$50,00**. Efectivo total a cuadrar: **$445,00**.`,
          timestamp,
          cards: [
            {
              type: 'kpi',
              title: 'Arqueo preliminar de caja',
              data: {
                totalVentas: '$780,50',
                efectivo: '$395,00',
                tarjetas: '$225,50',
                transferencias: '$160,00',
                fondoInicial: '$50,00',
              },
            },
          ],
          provenance: {
            period: 'Caja del día (Turno 03/11/2026)',
            modules: ['Ventas y Caja'],
            updatedAt: 'Hace 5 minutos',
            certainty: 'Alta: todas las notas emitidas están conciliadas',
          },
        },
      };
    }

    // 10. Consejo para vender más el miércoles
    if (query.includes('consejo') || query.includes('vender mas') || query.includes('miercoles')) {
      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: `Carlos, los miércoles tus ventas bajan un **20 %** históricamente en el horario de almuerzo. Te sugiero lanzar un **"Miércoles de Encebollado"** de 08:00 a 11:30 am a **$3,99** (precio regular $4,50).\n\nComo tu costo de encebollado es de solo **$1,85**, aún ganarás **$2,14 por plato** (53 % de margen) y atraerás a oficinistas de La Floresta.`,
          timestamp,
          cards: [
            {
              type: 'advice',
              title: 'Estrategia comercial de mitad de semana',
              data: {
                impactoEsperado: '+25 a 30 almuerzos adicionales',
                margenProyectado: '53.6 %',
                accion: 'Crear campaña o cartel de mesa',
              },
            },
          ],
          provenance: {
            period: 'Análisis de ventas últimas 8 semanas',
            modules: ['Reportes y Rentabilidad', 'Recetas y Costeo'],
            updatedAt: 'Hoy',
            certainty: 'Alta: correlación estacional comprobada',
          },
        },
      };
    }

    // Default polite response
    return {
      message: {
        id: `msg-noah-${Date.now()}`,
        sender: 'noah',
        text: role === 'owner'
          ? `Entendido. Con los datos registrados de **${business.name}** puedo ayudarte a consultar ventas de hoy, rentabilidad del mes, recetas y costeo, insumos por vencer o registrar pedidos y gastos por voz. ¿Cuál quieres ver?`
          : `No tengo esa respuesta en esta demostración. Prueba con una de las preguntas sugeridas.`,
        timestamp,
        provenance: {
          period: 'Consulta general',
          modules: ['Núcleo NOAH'],
          updatedAt: 'Ahora',
          certainty: 'Alta',
        },
      },
    };
  }

  private matchStoreIntent(role: UserRole, timestamp: string): AIResponse {
    if (role !== 'owner') {
      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: `En octubre la tienda vendió **$4.800,00**. Los egresos y el resultado solo los ve el dueño.`,
          timestamp,
          provenance: {
            period: 'Octubre 2026',
            modules: ['Ingresos de la tienda'],
            updatedAt: 'Cierre del mes',
            certainty: 'Media: registro de 20 notas de venta y facturas',
          },
        },
      };
    }

    return {
      message: {
        id: `msg-noah-${Date.now()}`,
        sender: 'noah',
        text: `Doña Rosa, en octubre vendiste **$4.800,00** y tuviste compras/gastos por **$3.650,00**. Te quedan aproximadamente **$1.150,00** antes de pagar el arriendo del local ($350,00).`,
        timestamp,
        cards: [
          {
            type: 'kpi',
            title: 'Resumen de Tienda Doña Rosa - Octubre',
            data: {
              ingresos: '$4.800,00',
              egresos: '$3.650,00',
              saldoAprox: '$1.150,00',
              arriendoPendiente: '$350,00',
            },
          },
        ],
        provenance: {
          period: 'Octubre 2026',
          modules: ['Ingresos y Egresos Simples'],
          updatedAt: 'Cierre del mes',
          certainty: 'Media: registro de 20 notas de venta y facturas',
        },
      },
    };
  }

  private matchBarberIntent(query: string, timestamp: string): AIResponse {
    const isMoneyQuestion = ['vendimos', 'ventas', 'en caja', 'ganamos', 'ganancia', 'resultado', 'gaste', 'gastos'].some((word) => query.includes(word));
    if (isMoneyQuestion) {
      const isToday = query.includes('hoy') || query.includes('caja');
      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: isToday
            ? `Hoy llevas **$112,00** cobrados en 14 turnos (ticket de $8,00): efectivo $64,00, DeUna $30,00 y tarjeta $18,00.`
            : `En octubre cobraste **$3.200,00** y gastaste **$1.996,00** (comisiones $980, arriendo $520 y productos). Te quedan cerca de **$1.204,00**.`,
          timestamp,
          provenance: {
            period: isToday ? 'Hoy' : 'Octubre 2026',
            modules: ['Cobros y caja', 'Gastos y compras'],
            updatedAt: 'Hoy',
            certainty: 'Media: cifras referenciales antes de impuestos',
          },
        },
      };
    }

    const isConflict = query.includes('martes') && (query.includes('2 de la tarde') || query.includes('14:00'));
    const time = query.match(/\d{1,2}:\d{2}/)?.[0] ?? '15:00';
    if (isConflict) {
      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: `⚠️ **Horario no disponible:** David ya tiene agendado a Santiago Proaño el martes a las 14:00 (Fade de 45 min).\n\nTe propongo estos 3 horarios libres más cercanos:`,
          timestamp,
          cards: [
            {
              type: 'appointment',
              title: 'Horarios libres alternativos con David',
              data: {
                conflicto: 'Martes 14:00 ocupado por Fade (45 min)',
                alternativas: ['Martes 14:50', 'Martes 15:30', 'Miércoles 10:00'],
              },
            },
          ],
          provenance: {
            period: 'Agenda semanal de barberos',
            modules: ['Agenda de Citas (Barber Kings)'],
            updatedAt: 'Ahora',
            certainty: 'Alta: detección automática de solapamiento',
          },
        },
      };
    }

    return {
      message: {
        id: `msg-noah-${Date.now()}`,
        sender: 'noah',
        text: `He preparado la reserva para **Luis**:\n• Servicio: Corte clásico con lavado (30 min)\n• Barbero: David\n• Fecha: Martes, ${time}\n• Valor: $6,00\n\n¿Deseas confirmar la cita?`,
        timestamp,
        actionDraft: {
          id: `draft-apt-${Date.now()}`,
          type: 'appointment',
          title: 'Cita en Barber Kings: Luis',
          details: {
            cliente: 'Luis',
            barbero: 'David',
            horario: `Martes, ${time}`,
            servicio: 'Corte clásico',
            valor: 6.00,
          },
          status: 'pending',
        },
        provenance: {
          period: 'Agenda de servicios',
          modules: ['Agenda de Citas'],
          updatedAt: 'Ahora',
          certainty: 'Borrador sin solapamiento',
        },
      },
      requiresConfirmation: true,
    };
  }
}

export const aiService = new AIService();
