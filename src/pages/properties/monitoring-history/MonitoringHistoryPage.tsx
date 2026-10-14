import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  CheckCircle2,
  Loader2,
  Upload,
  CalendarCog,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useProperty } from '@/hooks/useProperty';
import { usePropertyMonitoringHistory } from '@/hooks/useMonitoring';
import { Button } from '@/components/ui/button/button';

import styles from './MonitoringHistoryPage.module.css';

export default function MonitoringHistoryPage() {
  const { propertyId } = useParams<{ propertyId: string }>();

  const { data: property } = useProperty(propertyId!);
  const {
    data: history,
    isLoading,
    isError,
  } = usePropertyMonitoringHistory(propertyId);

  if (isLoading) {
    return (
      <div className={styles.centerLoading}>
        <Loader2 className="animate-spin" size={36} />
        <p>Carregando histórico e eventos de monitoramento...</p>
      </div>
    );
  }

  if (isError || !history) {
    return (
      <div className={styles.centerLoading}>
        <p>Histórico não encontrado para esta propriedade.</p>
        <Button asChild variant="outline" style={{ marginTop: '1rem' }}>
          <Link to="/properties">Voltar para propriedades</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumbNav}>
        <Link to="/properties" className={styles.breadcrumbLink}>
          Propriedades
        </Link>
        <ChevronRight size={14} />
        <Link
          to={`/properties/${propertyId}`}
          className={styles.breadcrumbLink}
        >
          {property?.name || 'Propriedade'}
        </Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>
          Histórico de Monitoramento
        </span>
      </nav>

      {/* Cabeçalho */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          Histórico de Monitoramento: {property?.name}
        </h1>
        <p className={styles.subtitle}>
          Linha do tempo de calibração espectral, sensoriamento de satélite e
          balanço histórico de safras.
        </p>
      </div>

      <div className={styles.gridContent}>
        {/* Balanço consolidado por safra */}
        <div className={styles.chartCard}>
          <div>
            <h3 className={styles.cardTitle}>Balanço de C por Safra (t)</h3>
            <p className={styles.cardSubtitle}>
              Evolução histórica do sequestro líquido
            </p>
          </div>

          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={history.balancoPorSafra}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="safra" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="balanco"
                  name="Balanço (t)"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Linha do tempo de eventos */}
        <div className={styles.timelineCard}>
          <div>
            <h3 className={styles.cardTitle}>
              Linha do Tempo de Processamento
            </h3>
            <p className={styles.cardSubtitle}>
              Auditoria de leituras e sincronizações com a plataforma
            </p>
          </div>

          <div className={styles.timelineList}>
            <div className={styles.timelineLine} />

            {history.events.map((ev) => {
              const iconBoxClass =
                ev.type === 'READY'
                  ? styles.iconReady
                  : ev.type === 'PROCESSING'
                    ? styles.iconProcessing
                    : ev.type === 'SEASON'
                      ? styles.iconSeason
                      : styles.iconSent;

              const Icon =
                ev.type === 'READY'
                  ? CheckCircle2
                  : ev.type === 'PROCESSING'
                    ? Loader2
                    : ev.type === 'SEASON'
                      ? CalendarCog
                      : Upload;

              const dateStr = new Date(ev.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={ev.id} className={styles.timelineItem}>
                  <div className={`${styles.timelineIconBox} ${iconBoxClass}`}>
                    <Icon size={16} />
                  </div>

                  <div className={styles.timelineDetails}>
                    <div className={styles.timelineTop}>
                      <span className={styles.eventTitle}>{ev.title}</span>
                      <span className={styles.eventDate}>{dateStr}</span>
                    </div>

                    {ev.fieldName && (
                      <span className={styles.eventTalhao}>
                        Talhão: {ev.fieldName}
                      </span>
                    )}

                    {ev.detail && (
                      <p className={styles.eventDetail}>{ev.detail}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
