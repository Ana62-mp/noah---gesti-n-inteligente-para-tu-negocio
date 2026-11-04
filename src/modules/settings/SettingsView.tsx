import React, { useState } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { ROLE_LABELS, canAccessSection, getRolesForBusiness } from '../../shared/permissions/rolePermissions';
import {
  Settings,
  Shield,
  Bell,
  Cpu,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentBusiness,
    currentRole,
    setCurrentRole,
    isGeminiMode,
    isGeminiAvailable,
    setIsGeminiMode,
    simulateError,
    setSimulateError,
    simulateEmpty,
    setSimulateEmpty,
    resetAllData,
    showToast,
    setHasCompletedOnboarding,
    setActiveSection,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'business' | 'permissions' | 'connectors' | 'demo'>('demo');

  // Business info form
  const [businessName, setBusinessName] = useState(currentBusiness.name);
  const [ruc, setRuc] = useState(currentBusiness.ruc);
  const [city, setCity] = useState(currentBusiness.city);

  const matrixRoles = getRolesForBusiness('restaurant');
  const permissionsMatrix = [
    { module: 'Dashboard, reportes y rentabilidad', section: 'dashboard' },
    { module: 'Ventas y cierre de caja', section: 'sales' },
    { module: 'Gastos (dueño) y compras de insumos (inventario)', section: 'expenses' },
    { module: 'Recetas, costeo y márgenes', section: 'costing' },
    { module: 'Carta con precios (costos solo para el dueño)', section: 'menu' },
    { module: 'Mesas y pedidos (cobro: dueño y caja)', section: 'tables' },
    { module: 'Delivery y para llevar', section: 'delivery' },
    { module: 'Tablero de cocina', section: 'kitchen' },
    { module: 'Insumos, bodega y proveedores', section: 'inventory' },
    { module: 'Configuración y demostración', section: 'settings' },
  ];

  const plannedConnectors = [
    { name: 'Gemini (Google AI)', purpose: 'Motor conversacional de inteligencia artificial', status: 'Opcional: requiere clave' },
    { name: 'Web Speech API & Síntesis', purpose: 'Transcripción y lectura de respuestas por voz', status: 'Activo en navegador' },
    { name: 'Comandera Térmica (ESC/POS)', purpose: 'Impresión de tickets para cocina y barra', status: 'Pendiente de evaluar' },
    { name: 'WhatsApp Business API', purpose: 'Recepción de pedidos y reportes diarios al dueño', status: 'Pendiente de evaluar' },
    { name: 'Facturación Electrónica SRI Ecuador', purpose: 'Emisión automática de comprobantes con RUC', status: 'Próximamente' },
    { name: 'Plataformas de Delivery (A, B, C)', purpose: 'Sincronización de pedidos y motorizados externos', status: 'Pendiente de evaluar' },
    { name: 'Publicación en Redes Sociales', purpose: 'Propuesta de promociones y publicación con visto bueno', status: 'Exploración futura' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#CF6811]" />
            <h2 className="text-lg font-bold text-[#111111]">Configuración y Ajustes</h2>
          </div>
          <p className="text-xs text-[#6B6B6B]">
            Datos del negocio, permisos de roles, conectores previstos y controles del prototipo demo.
          </p>
        </div>

        <div className="flex items-center p-1 bg-[#F5F4F1] rounded-xl border border-[#E7E5E0] overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'demo' ? 'bg-white text-[#111111] shadow-[var(--shadow-soft)]' : 'text-[#6B6B6B]'
            }`}
          >
            Controles Demo
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'business' ? 'bg-white text-[#111111] shadow-[var(--shadow-soft)]' : 'text-[#6B6B6B]'
            }`}
          >
            Datos del negocio
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'permissions' ? 'bg-white text-[#111111] shadow-[var(--shadow-soft)]' : 'text-[#6B6B6B]'
            }`}
          >
            Roles y permisos
          </button>
          <button
            onClick={() => setActiveTab('connectors')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'connectors' ? 'bg-white text-[#111111] shadow-[var(--shadow-soft)]' : 'text-[#6B6B6B]'
            }`}
          >
            Conectores previstos
          </button>
        </div>
      </div>

      {/* TAB 1: DEMO CONTROLS (CRITICAL FOR ACCEPTANCE CRITERIA) */}
      {activeTab === 'demo' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E7E5E0] p-6 shadow-[var(--shadow-soft)] space-y-6">
            <div className="border-b border-[#E7E5E0] pb-3">
              <h3 className="text-base font-bold text-[#111111]">
                Panel de Control de la Presentación (Sandbox)
              </h3>
              <p className="text-xs text-[#6B6B6B]">
                Permite demostrar estados de error de red, estados vacíos, motor IA real y restablecer datos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* IA Real Gemini Toggle */}
              <div className="p-4 rounded-xl border border-[#CF6811]/30 bg-[#FBF6E6] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#421A05] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#CF6811]" />
                    <span>Modo IA real (Gemini)</span>
                  </div>
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5 max-w-xs">
                    {isGeminiAvailable ? 'Envía un resumen de los datos de ejemplo a Gemini desde el servidor. Si falla, vuelve al modo demo.' : 'Desactivado: falta GEMINI_API_KEY en el servidor. Las respuestas son simuladas.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGeminiMode}
                    disabled={!isGeminiAvailable}
                    onChange={(e) => setIsGeminiMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#E7E5E0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E7E5E0] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#CF6811]"></div>
                </label>
              </div>

              {/* Force Network Error State */}
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Forzar estado de error de red</span>
                  </div>
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5 max-w-xs">
                    Simula caída de conexión o fallo de servidor para validar el componente ErrorState con botón "Reintentar".
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateError}
                    onChange={(e) => setSimulateError(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#E7E5E0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E7E5E0] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A43108]"></div>
                </label>
              </div>

              {/* Force Empty State */}
              <div className="p-4 rounded-xl border border-[#E7E5E0] bg-[#FAFAF8] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#111111]">
                    Forzar estado vacío (EmptyState)
                  </div>
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5 max-w-xs">
                    Muestra las listas y tablas sin registros con ilustración y acción sugerida.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateEmpty}
                    onChange={(e) => setSimulateEmpty(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#E7E5E0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E7E5E0] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#421A05]"></div>
                </label>
              </div>

              {/* Reset Data */}
              <div className="p-4 rounded-xl border border-[#E7E5E0] bg-[#FAFAF8] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#111111]">
                    Restablecer base de datos mock
                  </div>
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5 max-w-xs">
                    Devuelve las 60 ventas, 80 gastos, stock de 40 insumos y recetas a su estado inicial.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={resetAllData}
                >
                  Restablecer
                </Button>
              </div>
            </div>

            {/* Re-run Onboarding */}
            <div className="pt-4 border-t border-[#E7E5E0] flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#111111]">¿Deseas repetir el Asistente de Configuración inicial?</span>
                <p className="text-[#6B6B6B]">Vuelve a ejecutar "Arma tu NOAH" de 4 pasos.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setHasCompletedOnboarding(false);
                  setActiveSection('dashboard');
                }}
              >
                Personalizar mi NOAH
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUSINESS INFO */}
      {activeTab === 'business' && (
        <div className="bg-white rounded-2xl border border-[#E7E5E0] p-6 shadow-[var(--shadow-soft)] max-w-2xl mx-auto space-y-4 text-xs">
          <div className="border-b border-[#E7E5E0] pb-3">
            <h3 className="text-base font-bold text-[#111111]">Datos Legales y Comerciales</h3>
            <p className="text-[#6B6B6B]">Configuración territorial y fiscal para Ecuador</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Nombre Comercial:</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 bg-[#F5F4F1] focus:bg-white text-xs font-bold text-[#111111]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#111111] block mb-1">RUC:</label>
                <input
                  type="text"
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value)}
                  className="w-full border border-[#E7E5E0] rounded-xl p-2.5 bg-[#F5F4F1] font-mono text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-[#111111] block mb-1">Ciudad / Barrio:</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-[#E7E5E0] rounded-xl p-2.5 bg-[#F5F4F1] text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-[#FAFAF8] p-3 rounded-xl border border-[#E7E5E0]">
              <div>
                <span className="text-[#6B6B6B] block">País por defecto:</span>
                <strong className="text-[#111111]">Ecuador</strong>
              </div>
              <div>
                <span className="text-[#6B6B6B] block">Moneda oficial:</span>
                <strong className="text-[#111111]">USD ($)</strong>
              </div>
              <div>
                <span className="text-[#6B6B6B] block">IVA estándar:</span>
                <strong className="text-[#111111]">15 %</strong>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => showToast('Datos comerciales actualizados', 'success')}
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: ROLES & PERMISSIONS */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-2xl border border-[#E7E5E0] p-6 shadow-[var(--shadow-soft)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#111111]">
                Matriz de Control de Accesos por Rol (RBAC)
              </h3>
              <p className="text-xs text-[#6B6B6B]">
                Protege información sensible del negocio según las responsabilidades del puesto.
              </p>
            </div>
            <div className="text-xs">
              <span className="text-[#6B6B6B]">Tu rol actual: </span>
              <strong className="text-[#CF6811] font-bold">{ROLE_LABELS[currentRole]}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5F4F1] text-[#6B6B6B] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Módulo del sistema</th>
                  {matrixRoles.map((role) => (
                    <th key={role} className="py-2.5 px-3 text-center">{ROLE_LABELS[role]}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {permissionsMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FBF6E6]/30">
                    <td className="py-2.5 px-3 font-medium text-[#111111]">{row.module}</td>
                    {matrixRoles.map((role) => (
                      <td key={role} className="py-2.5 px-3 text-center">
                        {canAccessSection(role, row.section) ? (
                          <span className="text-[#5C5011] font-bold" aria-label="Con acceso">✓</span>
                        ) : (
                          <span className="text-[#6B6B6B]" aria-label="Sin acceso">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#6B6B6B]">
            Noah está disponible para todos, pero solo responde lo que corresponde a cada perfil.
            En el prototipo este control ocurre en la pantalla; en producción también debe validarse en el servidor.
          </p>
        </div>
      )}

      {/* TAB 4: CONNECTORS */}
      {activeTab === 'connectors' && (
        <div className="bg-white rounded-2xl border border-[#E7E5E0] p-6 shadow-[var(--shadow-soft)] space-y-4">
          <div className="border-b border-[#E7E5E0] pb-3">
            <h3 className="text-base font-bold text-[#111111]">
              Estado de Conectores e Integraciones Previstas
            </h3>
            <p className="text-xs text-[#6B6B6B]">
              Transparencia técnica de integraciones según los requerimientos levantados.
            </p>
          </div>

          <div className="divide-y divide-[#E7E5E0]">
            {plannedConnectors.map((c, i) => (
              <div key={i} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#111111]">{c.name}</div>
                  <div className="text-[11px] text-[#6B6B6B]">{c.purpose}</div>
                </div>

                <Badge
                  variant={
                    c.status.includes('Activo')
                      ? 'olive'
                      : c.status.includes('Pendiente')
                      ? 'banana'
                      : 'harvest'
                  }
                  size="sm"
                >
                  {c.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
