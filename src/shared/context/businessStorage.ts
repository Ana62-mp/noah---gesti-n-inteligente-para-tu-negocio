import { getRecommendedModules, REQUIRED_MODULES } from '../business/moduleCatalog';
import { buildMember } from '../permissions/rolePermissions';
import { DEFAULT_TEAMS } from '../services/businessMocks';
import { BUSINESS_OPTIONS } from '../services/mockData';
import { BusinessConfig, ModuleId, TeamMember } from '../types';

const CUSTOM_BUSINESS_KEY = 'noah_custom_business';

const readJson = <T,>(key: string): T | null => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : null;
  } catch {
    return null;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be blocked in private windows; the demo keeps working in memory.
  }
};

export const loadCustomBusiness = (): BusinessConfig | null => readJson<BusinessConfig>(CUSTOM_BUSINESS_KEY);

export const saveCustomBusiness = (business: BusinessConfig) => writeJson(CUSTOM_BUSINESS_KEY, business);

export const findBusiness = (id: string | null): BusinessConfig | null => {
  const custom = loadCustomBusiness();
  if (custom?.id === id) return custom;
  return BUSINESS_OPTIONS.find((business) => business.id === id) ?? null;
};

export const loadModules = (business: BusinessConfig): ModuleId[] =>
  readJson<ModuleId[]>(`noah_modules_${business.id}`) ?? getRecommendedModules(business.type);

export const saveModules = (businessId: string, modules: ModuleId[]) => {
  const withRequired = [...new Set([...REQUIRED_MODULES, ...modules])];
  writeJson(`noah_modules_${businessId}`, withRequired);
  return withRequired;
};

const buildDefaultTeam = (business: BusinessConfig): TeamMember[] => {
  const isCustom = !BUSINESS_OPTIONS.some(({ id }) => id === business.id);
  return isCustom ? [buildMember('m-owner', business.ownerName, 'owner')] : DEFAULT_TEAMS[business.type];
};

export const loadTeam = (business: BusinessConfig): TeamMember[] =>
  readJson<TeamMember[]>(`noah_team_${business.id}`) ?? buildDefaultTeam(business);

export const saveTeam = (businessId: string, team: TeamMember[]) => writeJson(`noah_team_${businessId}`, team);

export const clearBusinessCustomization = (businessId: string) => {
  try {
    localStorage.removeItem(`noah_team_${businessId}`);
    localStorage.removeItem(`noah_modules_${businessId}`);
  } catch {
    // Same as above: nothing to clear when storage is blocked.
  }
};
