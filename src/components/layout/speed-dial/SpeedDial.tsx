import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sprout, Leaf, Droplets, FileBarChart, Bot } from 'lucide-react';

import styles from './SpeedDial.module.css';

interface QuickAction {
  label: string;
  icon: typeof Plus;
  href: string;
  bgColor: string;
}

const actions: QuickAction[] = [
  {
    label: 'Nova propriedade',
    icon: Sprout,
    href: '/properties/new',
    bgColor: '#10b981',
  },
  {
    label: 'Análise de Carbono',
    icon: Leaf,
    href: '/carbon',
    bgColor: '#059669',
  },
  {
    label: 'Análise Hídrica',
    icon: Droplets,
    href: '/water',
    bgColor: '#0284c7',
  },
  {
    label: 'Novo relatório',
    icon: FileBarChart,
    href: '/reports',
    bgColor: '#f59e0b',
  },
  {
    label: 'Assistente Sulflux',
    icon: Bot,
    href: '/assistant',
    bgColor: '#8b5cf6',
  },
];

export function SpeedDial() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fechar ações rápidas"
          className={styles.overlay}
          onClick={() => setOpen(false)}
        />
      )}

      <div className={styles.speedDialContainer}>
        {open && (
          <div className={styles.actionsList}>
            {actions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className={styles.actionItem}
                onClick={() => setOpen(false)}
              >
                <span className={styles.actionLabel}>{action.label}</span>
                <div
                  className={styles.actionIconBox}
                  style={{ backgroundColor: action.bgColor }}
                >
                  <action.icon size={18} />
                </div>
              </Link>
            ))}
          </div>
        )}

        <button
          type="button"
          aria-label="Abrir ações rápidas"
          className={`${styles.mainFab} ${open ? styles.mainFabOpen : ''}`}
          onClick={() => setOpen(!open)}
        >
          <Plus size={24} />
        </button>
      </div>
    </>
  );
}
