import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Clock,
  Send,
  Calendar,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover/popover';
import { useProperties } from '@/hooks/useProperty';
import { usePropertyMonitoringHistory } from '@/hooks/useMonitoring';
import { useTenantStore } from '@/store/tenantStore';
import styles from './NotificationDropdown.module.css';

function formatRelativeTime(dateString?: string | Date): string {
  if (!dateString) return 'Recentemente';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Agora mesmo';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `há ${diffInDays} dias`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } catch {
    return 'Recentemente';
  }
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const activePropertyId = useTenantStore((s) => s.activePropertyId);
  const { data: propertiesData } = useProperties({ page: 1, limit: 1 });

  // Pega a primeira fazenda caso não tenha nenhuma selecionada ainda
  const effectivePropertyId = activePropertyId || propertiesData?.data?.[0]?.id;

  const { data: historyData } =
    usePropertyMonitoringHistory(effectivePropertyId);

  const notifications = useMemo(() => {
    const events = historyData?.events || [];
    return events.map((ev) => {
      let icon = CheckCircle2;
      let iconColor = 'var(--primary)';
      let iconBg = 'color-mix(in srgb, var(--primary) 15%, transparent)';

      if (ev.type === 'PROCESSING') {
        icon = Clock;
        iconColor = '#0284c7';
        iconBg = 'color-mix(in srgb, #0284c7 15%, transparent)';
      } else if (ev.type === 'SENT') {
        icon = Send;
        iconColor = '#8b5cf6';
        iconBg = 'color-mix(in srgb, #8b5cf6 15%, transparent)';
      } else if (ev.type === 'SEASON') {
        icon = Calendar;
        iconColor = '#f59e0b';
        iconBg = 'color-mix(in srgb, #f59e0b 15%, transparent)';
      }

      return {
        id: ev.id,
        title: ev.title,
        message: ev.detail || 'Evento de monitoramento ambiental registrado.',
        time: formatRelativeTime(ev.date),
        type: ev.type,
        icon,
        iconColor,
        iconBg,
        url: '/reports',
      };
    });
  }, [historyData]);

  const count = notifications.length;

  const handleSelect = (url: string) => {
    navigate(url);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={styles.trigger}
          aria-label="Notificações e Alertas"
        >
          <Bell style={{ width: '1.15rem', height: '1.15rem' }} />
          {count > 0 && <span className={styles.badge}>{count}</span>}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className={styles.dropdownContent}
        align="end"
        sideOffset={6}
      >
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.title}>Notificações & Alertas</span>
            {count > 0 && (
              <span className={styles.unreadTag}>{count} novos</span>
            )}
          </div>
        </div>

        <div className={styles.list}>
          {notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <Inbox
                style={{
                  width: '2rem',
                  height: '2rem',
                  color: 'var(--muted-foreground)',
                  opacity: 0.5,
                }}
              />
              <span className={styles.emptyTitle}>Sem novas notificações</span>
              <p className={styles.emptyDesc}>
                Todos os eventos de monitoramento estão em dia.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const IconComp = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={styles.item}
                  onClick={() => handleSelect(item.url)}
                >
                  <div
                    className={styles.iconWrapper}
                    style={{
                      backgroundColor: item.iconBg,
                      color: item.iconColor,
                    }}
                  >
                    <IconComp style={{ width: '1rem', height: '1rem' }} />
                  </div>

                  <div className={styles.itemContent}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemTitle}>{item.title}</span>
                      <span className={styles.itemTime}>{item.time}</span>
                    </div>
                    <span className={styles.itemMessage}>{item.message}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className={styles.footer}>
          <Link
            to="/reports"
            className={styles.footerLink}
            onClick={() => setOpen(false)}
          >
            <span>Ver histórico completo</span>
            <ArrowRight style={{ width: '0.85rem', height: '0.85rem' }} />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
