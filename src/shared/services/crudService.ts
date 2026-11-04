import { apiService, CollectionName } from './apiService';

const SAVE_DELAY_MS = 180;
const wait = () => new Promise((resolve) => setTimeout(resolve, SAVE_DELAY_MS));

const newestFirst: readonly CollectionName[] = ['customers', 'products', 'promotions', 'suppliers', 'services', 'dishes', 'ingredients', 'expenses', 'sales', 'appointments'];

const buildId = (name: CollectionName) => `${name.slice(0, 3)}-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

export const crud = {
  async create<T extends { id: string }>(name: CollectionName, data: Omit<T, 'id'>): Promise<T> {
    await wait();
    const item = { ...data, id: buildId(name) } as T;
    const list = apiService.getCollection(name);
    if (newestFirst.includes(name)) list.unshift(item);
    return item;
  },

  async update<T extends { id: string }>(name: CollectionName, id: string, changes: Partial<T>): Promise<T> {
    await wait();
    const item = apiService.getCollection(name).find((entry) => entry.id === id);
    if (!item) throw new Error('No encontramos el registro. Puede que ya se haya eliminado.');
    Object.assign(item, changes);
    return item as T;
  },

  async remove(name: CollectionName, id: string): Promise<void> {
    await wait();
    const list = apiService.getCollection(name);
    const index = list.findIndex((entry) => entry.id === id);
    if (index === -1) throw new Error('No encontramos el registro. Puede que ya se haya eliminado.');
    list.splice(index, 1);
  },
};
