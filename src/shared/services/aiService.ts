import { ChatMessage, BusinessConfig, UserRole } from '../types';
import { askGemini } from './geminiClient';

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
    history: ChatMessage[] = []
  ): Promise<AIResponse> {
    // Role check: If waiter asks for owner financial secrets
    const lower = userQuery.toLowerCase().trim();
    if (role === 'waiter' && (lower.includes('ganamos') || lower.includes('rentabilidad') || lower.includes('gastos del mes'))) {
      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: `Hola. Por políticas de seguridad, esa información financiera solo la puede consultar el dueño o administrador del negocio. Si necesitas registrar un pedido o consultar platos de la carta, ¡con gusto te ayudo!`,
          timestamp: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
          provenance: {
            period: 'Control de acceso',
            modules: ['Permisos y Roles'],
            updatedAt: 'Ahora',
            certainty: 'Alta: restricción de rol activa',
          },
        },
      };
    }

    if (this.isGeminiMode) {
      try {
        const live = await askGemini(userQuery, business, role, history);
        if (live) return { message: live };
      } catch (err) {
        console.warn('Gemini unavailable, using demo engine.', err);
      }
    }

    // Demo Mode: Scripted intelligent intent matching
    const demo = this.matchDemoIntent(lower, business, role);
    return { ...demo, message: { ...demo.message, source: 'demo' } };
  }

  private matchDemoIntent(query: string, business: BusinessConfig, role: UserRole): AIResponse {
    const timestamp = new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

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
                orders: 86,
                topTime: '12:30 - 14:30 ($352,00)',
                vsLastWeek: '+12.0 % vs. martes anterior',
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
                actual: 2140,
                anterior: 1960,
                diferencia: '+9.2 %',
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
    if (query.includes('por vencer') || query.includes('merma') || query.includes('vencimientos') || query.includes('sobrestock')) {
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
    if (query.includes('registra una compra') || query.includes('pague') || query.includes('registra un gasto') || query.includes('gaste')) {
      const isLuz = query.includes('luz');
      const amount = isLuz ? 85.00 : 45.00;
      const concept = isLuz ? 'Pago de planilla de energía eléctrica' : 'Compra de ingredientes varios en mercado';
      const supplier = isLuz ? 'Empresa Eléctrica Quito' : 'Mercado Mayorista Quito';
      const category = isLuz ? 'servicios' : 'insumos';

      return {
        message: {
          id: `msg-noah-${Date.now()}`,
          sender: 'noah',
          text: `He preparado el borrador de este gasto para que lo verifiques antes de guardarlo en tu flujo de caja:`,
          timestamp,
          actionDraft: {
            id: `draft-exp-${Date.now()}`,
            type: 'expense',
            title: `Borrador de gasto: $${amount.toFixed(2)}`,
            details: {
              concepto: concept,
              monto: amount,
              categoria: category,
              proveedor: supplier,
              fecha: 'Hoy (03/11/2026)',
              metodoPago: isLuz ? 'Transferencia bancaria' : 'Efectivo de caja chica',
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
              mesero: role === 'waiter' ? 'Tú (Mesero)' : 'Ana',
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
                deunaTransf: '$160,00',
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

    // 11. Barbería: Agéndame un corte el martes a las 2 de la tarde
    if (query.includes('agendame') || query.includes('corte') || query.includes('barberia') || business.type === 'barbershop') {
      const isConflict = query.includes('martes') && (query.includes('2 de la tarde') || query.includes('14:00') || query.includes('14'));
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
          text: `He preparado la reserva para **Luis**:\n• Servicio: Corte clásico con lavado (30 min)\n• Barbero: David\n• Fecha: Martes 10 de noviembre, 15:00\n• Valor: $6,00\n\n¿Deseas confirmar la cita?`,
          timestamp,
          actionDraft: {
            id: `draft-apt-${Date.now()}`,
            type: 'appointment',
            title: 'Cita en Barber Kings: Luis',
            details: {
              cliente: 'Luis (Corte clásico)',
              barbero: 'David',
              horario: 'Martes, 15:00 - 15:30',
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

    // 12. Tienda: ¿Cuánto gasté este mes?
    if (business.type === 'store' || query.includes('tienda') || query.includes('gaste este mes')) {
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

    // Default polite response
    return {
      message: {
        id: `msg-noah-${Date.now()}`,
        sender: 'noah',
        text: `Entendido, Carlos. Con base en los datos registrados de **${business.name}**, puedo ayudarte a consultar ventas de hoy, rentabilidad del mes, recetas y costeo, insumos por vencer o registrar pedidos y gastos por voz. ¿De cuál te gustaría ver el detalle?`,
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
}

export const aiService = new AIService();
