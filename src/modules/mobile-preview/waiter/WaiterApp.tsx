import React, { useEffect, useState } from 'react';
import { ClipboardList, Grid3X3, Mic, UtensilsCrossed } from 'lucide-react';
import { PhoneTab, PhoneTabBar } from '../components/PhoneChrome';
import { WaiterMenu } from './WaiterMenu';
import { WaiterOrder } from './WaiterOrder';
import { WaiterOrders } from './WaiterOrders';
import { WaiterTables } from './WaiterTables';

export type WaiterTab = 'tables' | 'order' | 'orders' | 'menu';

const ICON = 'w-5 h-5';
const DEFAULT_TABLE = 4;

const TABS: PhoneTab<WaiterTab>[] = [
  { id: 'tables', label: 'Mesas', icon: <Grid3X3 className={ICON} /> },
  { id: 'order', label: 'Tomar pedido', icon: <Mic className={ICON} /> },
  { id: 'orders', label: 'Mis pedidos', icon: <ClipboardList className={ICON} /> },
  { id: 'menu', label: 'Carta', icon: <UtensilsCrossed className={ICON} /> },
];

export const WaiterApp: React.FC<{ requestedTab: { tab: string; nonce: number } | null }> = ({ requestedTab }) => {
  const [tab, setTab] = useState<WaiterTab>('tables');
  const [tableNumber, setTableNumber] = useState(DEFAULT_TABLE);

  useEffect(() => {
    if (requestedTab) setTab(requestedTab.tab as WaiterTab);
  }, [requestedTab]);

  return (
    <>
      <div className="flex-1 min-h-0 flex flex-col relative">
        {tab === 'tables' && (
          <WaiterTables
            onTakeOrder={(table) => {
              setTableNumber(table);
              setTab('order');
            }}
          />
        )}
        {tab === 'order' && (
          <WaiterOrder tableNumber={tableNumber} onChangeTable={setTableNumber} onSeeOrders={() => setTab('orders')} />
        )}
        {tab === 'orders' && <WaiterOrders />}
        {tab === 'menu' && <WaiterMenu />}
      </div>
      <PhoneTabBar tabs={TABS} active={tab} onChange={setTab} />
    </>
  );
};
