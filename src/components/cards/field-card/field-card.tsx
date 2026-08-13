import React from 'react';
import { Link } from 'react-router-dom';
import {
  Ruler,
  Spline,
  Mountain,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  BarChart3,
  CalendarCog,
  Clock,
} from 'lucide-react';

import { Card } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { Progress } from '@/components/ui/progress/progress';
import { FieldStatus, type FieldResponseDTO } from '@lib/shared';

import styles from './FieldCard.module.css';

interface FieldCardProps {
  propertyId: string;
  field: FieldResponseDTO;
}

export function FieldCard({ propertyId, field }: FieldCardProps) {
  // Configuração visual baseada no Status do banco de dados
  const statusConfig = {
    [FieldStatus.Waiting]: {
      label: 'Aguardando',
      icon: AlertTriangle,
      badgeClass: styles.badgeWaiting,
      color: '#f59e0b', // Amber
    },
    [FieldStatus.Processing]: {
      label: 'Processando',
      icon: Loader2,
      badgeClass: styles.badgeProcessing,
      color: '#3b82f6', // Blue
    },
    [FieldStatus.Ready]: {
      label: 'Pronto',
      icon: CheckCircle2,
      badgeClass: styles.badgeReady,
      color: 'hsl(var(--primary))',
    },
  };

  const currentStatus =
    statusConfig[field.status] || statusConfig[FieldStatus.Waiting];
  const StatusIcon = currentStatus.icon;

  // Fallbacks de apresentação
  const displayArea = field.area ? `${field.area} ha` : '--';
  const displayPerimeter = field.perimeter ? `${field.perimeter} km` : '--';
  const displaySoil = field.soilType ? field.soilType.split(' ')[0] : '--';

  // TODO: Mocks para quando os módulos de Safra e Resultados forem construídos
  const mockSeason = '2026/2027';
  const mockBalance = '+ 12.4 tCO2e';
  const mockSentAt = 'Hoje, 08:30';
  const mockEta = '2';

  return (
    <Card className={styles.card}>
      {/* Miniatura do mapa */}
      <div className={styles.mapContainer}>
        <div aria-hidden className={styles.mapGradient} />

        {/* Renderização condicional para as coordenadas caso existam */}
        <svg
          aria-hidden
          className={styles.svgOverlay}
          viewBox="0 0 300 120"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Fallback visual: idealmente usaríamos as coordenadas reais do field.coordinates aqui redimensionadas */}
          <polygon
            points="60,25 230,20 260,70 190,100 80,90 45,55"
            fill={currentStatus.color}
            fillOpacity="0.15"
            stroke={currentStatus.color}
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />
        </svg>

        <span className={`${styles.badge} ${currentStatus.badgeClass}`}>
          <StatusIcon
            size={12}
            className={
              field.status === FieldStatus.Processing ? 'animate-spin' : ''
            }
          />
          {currentStatus.label}
        </span>
      </div>

      {/* Corpo */}
      <div className={styles.content}>
        <div className={styles.headerRow}>
          <div>
            <h3 className={styles.title}>{field.name}</h3>
            <p className={styles.code}>{field.code}</p>
          </div>
        </div>

        {/* Métricas do talhão */}
        <div className={styles.metricsGrid}>
          <Metric icon={Ruler} label="Área" value={displayArea} />
          <Metric icon={Spline} label="Perímetro" value={displayPerimeter} />
          <Metric icon={Mountain} label="Solo" value={displaySoil} />
        </div>

        {/* Estado dinâmico */}
        <div className={styles.statusSection}>
          {field.status === FieldStatus.Ready && (
            <>
              <div className={styles.readyBox}>
                <div className={styles.readyRow}>
                  <span className={styles.readyLabel}>Safra atual</span>
                  <span className={styles.readyValue}>{mockSeason}</span>
                </div>
                <div className={styles.readyRow}>
                  <span className={styles.readyLabel}>Balanço de C</span>
                  <span className={styles.readyHighlight}>{mockBalance}</span>
                </div>
              </div>
              <Button asChild className={styles.actionBtn}>
                <Link
                  to={`/properties/${propertyId}/fields/${field.id}/results`}
                >
                  <BarChart3 size={16} style={{ marginRight: '8px' }} />
                  Ver Resultados
                </Link>
              </Button>
            </>
          )}

          {field.status === FieldStatus.Processing && (
            <>
              <div className={styles.processingBox}>
                <p className={styles.processingText}>
                  <Clock size={14} />
                  Enviado: {mockSentAt}
                </p>
                <p
                  className={styles.processingText}
                  style={{ margin: '4px 0 8px 0' }}
                >
                  Previsão de conclusão: ~{mockEta}h
                </p>
                <Progress value={45} className="h-1.5" />
              </div>
              <Button variant="secondary" disabled className={styles.actionBtn}>
                <Loader2
                  size={16}
                  className="animate-spin"
                  style={{ marginRight: '8px' }}
                />
                Processando...
              </Button>
            </>
          )}

          {field.status === FieldStatus.Waiting && (
            <>
              <p className={styles.waitingBox}>
                Configure a safra e os manejos para iniciar o monitoramento.
              </p>
              <Button
                asChild
                className={`${styles.actionBtn} ${styles.btnAmber}`}
              >
                <Link
                  to={`/properties/${propertyId}/fields/${field.id}/season`}
                >
                  <CalendarCog size={16} style={{ marginRight: '8px' }} />
                  Configurar Safra
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className={styles.metricBox}>
      <Icon size={14} style={{ margin: '0 auto', color: 'var(--primary)' }} />
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>{value}</p>
    </div>
  );
}
