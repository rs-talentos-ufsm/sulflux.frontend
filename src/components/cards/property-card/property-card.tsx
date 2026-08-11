import { Link } from 'react-router-dom';
import {
  MapPin,
  Ruler,
  Layers,
  Eye,
  History,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

import { Card } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { type PropertyResponseDTO, PropertyStatus } from '@lib/shared';

import styles from './PropertyCard.module.css';

export type UIProperty = PropertyResponseDTO & {
  area?: string;
  lastAccess?: string;
  // talhoes?: Array<{ id: string; status: 'aguardando' | 'processando' | 'pronto' }>
};

export function PropertyCard({ property }: { property: UIProperty }) {
  const isConfigure = property.status === PropertyStatus.Configure;

  // TODO: Quando o backend começar a enviar o relacionamento "property.talhoes",
  // basta descomentar essa lógica para calcular dinamicamente.
  /*
  const counts = useMemo(() => {
    if (!property.talhoes) return { total: 0, aguardando: 0, processando: 0, pronto: 0 }
    
    return property.talhoes.reduce(
      (acc, talhao) => {
        acc.total++
        if (talhao.status === 'aguardando') acc.aguardando++
        if (talhao.status === 'processando') acc.processando++
        if (talhao.status === 'pronto') acc.pronto++
        return acc
      },
      { total: 0, aguardando: 0, processando: 0, pronto: 0 }
    )
  }, [property.talhoes])
  */

  // Fallback temporário até os talhões serem integrados
  const counts = { total: 0, aguardando: 0, processando: 0, pronto: 0 };

  return (
    <Card className={styles.card}>
      {/* Cabeçalho com espaço para imagem aérea/satélite */}
      <div className={styles.header}>
        <div aria-hidden className={styles.headerPattern} />

        <div className={styles.badgeStatusWrapper}>
          <span
            className={`${styles.badgeStatus} ${
              isConfigure ? styles.badgeConfigure : styles.badgeActive
            }`}
          >
            {isConfigure ? (
              <AlertTriangle size={12} />
            ) : (
              <CheckCircle2 size={12} />
            )}
            {isConfigure ? 'Configure' : 'Active'}
          </span>
        </div>

        <div className={styles.badgeCar}>{property.car}</div>
      </div>

      {/* Corpo */}
      <div className={styles.body}>
        <h3 className={`text-balance ${styles.title}`}>{property.name}</h3>
        <p className={styles.location}>
          <MapPin size={14} className={styles.iconPrimary} />
          {property.location}
        </p>

        {/* Métricas principais */}
        <div className={styles.metricsBox}>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>
              <Ruler size={12} />
              Área Total
            </div>
            {/* Fallback para a área enquanto não vem da API */}
            <p className={styles.metricValue}>{property.area || '-- ha'}</p>
          </div>
          <div className={styles.metricDivider} />
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>
              <Layers size={12} />
              Talhões
            </div>
            <p className={styles.metricValue}>{counts.total}</p>
          </div>
        </div>

        {/* Lista de status dos talhões ou aviso de configuração */}
        {isConfigure ? (
          <div className={styles.warningBox}>
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            Nenhum talhão configurado.
          </div>
        ) : (
          <ul className={styles.statusList}>
            <StatusRow
              icon={AlertTriangle}
              colorClass={styles.colorAmber}
              label="Aguardando Safra"
              count={counts.aguardando}
            />
            <StatusRow
              icon={Loader2}
              colorClass={styles.colorBlue}
              label="Processando"
              count={counts.processando}
            />
            <StatusRow
              icon={CheckCircle2}
              colorClass={styles.colorPrimary}
              label="Monitoramento Concluído"
              count={counts.pronto}
            />
          </ul>
        )}

        {/* Fallback silencioso se lastAccess não existir ainda */}
        {property.lastAccess && (
          <p className={styles.lastAccess}>
            Último acesso: {property.lastAccess}
          </p>
        )}

        {/* Ações no rodapé */}
        <div className={styles.actionsContainer}>
          <div className={styles.actionsRow}>
            {isConfigure ? (
              <Button
                asChild
                className={`${styles.btnPrimaryFlex} ${styles.btnAmber}`}
              >
                <Link to={`/propriedades/${property.id}`}>
                  <Layers size={16} />
                  Configure Talhões
                </Link>
              </Button>
            ) : (
              <Button asChild className={styles.btnPrimaryFlex}>
                <Link to={`/propriedades/${property.id}`}>
                  <Eye size={16} />
                  Ver Propriedade
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              aria-label="Editar propriedade"
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Excluir propriedade"
              className={styles.btnDestructive}
            >
              <Trash2 size={16} />
            </Button>
          </div>

          {!isConfigure && (
            <Button asChild variant="outline" className={styles.btnHistory}>
              <Link to={`/propriedades/${property.id}/monitoramento`}>
                <History size={16} />
                Histórico de Monitoramento
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function StatusRow({
  icon: Icon,
  colorClass,
  label,
  count,
}: {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    style?: React.CSSProperties;
  }>;
  colorClass: string;
  label: string;
  count: number;
}) {
  return (
    <li
      className={`${styles.statusRow} ${count === 0 ? styles.statusRowEmpty : ''}`}
    >
      <span className={`${styles.statusLabel} ${colorClass}`}>
        <Icon size={14} />
        {label}
      </span>
      <span className={styles.statusCount}>{count}</span>
    </li>
  );
}
