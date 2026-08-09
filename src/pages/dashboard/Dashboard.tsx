import { useDashboard } from '@/hooks/useDashboard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card/card';
import { Badge } from '@/components/ui/badge/badge';
import { Progress } from '@/components/ui/progress/progress';
import {
  ListTodo,
  Clock,
  AlertCircle,
  Target,
  TrendingUp,
  Bug,
  FolderOpen,
  CheckCircle2,
  Loader2,
  Timer,
} from 'lucide-react';

import styles from './Dashboard.module.css';

const NATURE_CONFIG: Record<string, { label: string; colorClass: string }> = {
  DEV: { label: 'Desenvolvimento', colorClass: styles.bgBlue },
  MEETING: { label: 'Reunião', colorClass: styles.bgGreen },
  TESTING: { label: 'Teste', colorClass: styles.bgYellow },
  DOCUMENTATION: { label: 'Documentação', colorClass: styles.bgPurple },
  CODE_REVIEW: { label: 'Code Review', colorClass: styles.bgPink },
  OTHER: { label: 'Outros', colorClass: styles.bgGray },
};

const getKpiConfig = (data: any) => [
  {
    title: 'Total Tarefas',
    value: data.totalTasks,
    icon: ListTodo,
    colorClass: styles.textBlue,
  },
  {
    title: 'Horas Totais',
    value: `${data.totalHours}h`,
    icon: Clock,
    colorClass: styles.textGreen,
  },
  {
    title: 'Concluídas',
    value: data.completedTasks,
    icon: CheckCircle2,
    colorClass: styles.textPurple,
  },
  {
    title: 'Atrasadas',
    value: data.delayedTasks,
    icon: AlertCircle,
    colorClass: styles.textRed,
    isAlert: data.delayedTasks > 0,
  },
  {
    title: 'Meta Diária',
    value: `${data.dailyGoalPercent}%`,
    icon: Target,
    colorClass: styles.textOrange,
  },
  {
    title: 'Projetos',
    value: data.totalProjects,
    icon: FolderOpen,
    colorClass: styles.textBlue,
  },
  {
    title: 'Urgentes',
    value: data.urgentTasks,
    icon: Bug,
    colorClass: styles.textRed,
    isAlert: data.urgentTasks > 0,
  },
  {
    title: 'Minutos Hoje',
    value: `${data.todayMinutes}m`,
    icon: TrendingUp,
    colorClass: styles.textGreen,
  },
];

function timeAgo(dateString: string) {
  const diffMin = Math.round(
    (new Date().getTime() - new Date(dateString).getTime()) / 60000,
  );
  if (diffMin < 60) return `${diffMin} min atrás`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;
  return `${Math.floor(diffHours / 24)} dias atrás`;
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={styles.errorContainer}>
        <p>Erro ao carregar o dashboard. Tente novamente.</p>
      </div>
    );
  }

  const kpis = getKpiConfig(data.kpis);

  // Para a lista de projetos, achamos o valor máximo para a barra de progresso ser relativa a ele
  const maxProjectHours = Math.max(
    ...data.appointmentsPerProject.map((p) => p.horas),
    1,
  );

  // Cálculo para o gráfico radial nativo (SVG puro) baseado nos dados reais
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (data.kpis.dailyGoalPercent / 100) * circumference;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          Visão geral de performance e atividades reais
        </p>
      </div>

      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className={styles.kpiContent}>
              <div className={styles.kpiTop}>
                <kpi.icon
                  className={[styles.kpiIcon, kpi.colorClass]
                    .filter(Boolean)
                    .join(' ')}
                />
                {kpi.isAlert && (
                  <Badge variant="destructive" className={styles.alertBadge}>
                    !
                  </Badge>
                )}
              </div>
              <div className={styles.kpiBottom}>
                <p
                  className={[
                    styles.kpiValue,
                    kpi.isAlert ? styles.textRed : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {kpi.value}
                </p>
                <p className={styles.kpiTitle}>{kpi.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seção de Visualizações Criadas na Mão */}
      <div className={styles.chartsGrid}>
        {/* Horas por Natureza - Stacked Bar & Lista */}
        <Card>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>
              Horas por Natureza
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.hoursPerNature.length > 0 ? (
              <div className={styles.natureContainer}>
                {/* Stacked Bar Simples feita com divs */}
                <div className={styles.stackedBar}>
                  {data.hoursPerNature.map((item, i) => {
                    const config =
                      NATURE_CONFIG[item.natureza] || NATURE_CONFIG.OTHER;
                    // Para evitar divisão por zero, usamos o Math.max
                    const percent =
                      (item.horas / Math.max(data.kpis.totalHours, 1)) * 100;
                    return (
                      <div
                        key={i}
                        className={[styles.stackedSegment, config.colorClass]
                          .filter(Boolean)
                          .join(' ')}
                        style={{ width: `${percent}%` }}
                        title={`${config.label}: ${item.horas}h`}
                      />
                    );
                  })}
                </div>
                {/* Legenda detalhada */}
                <div className={styles.natureLegend}>
                  {data.hoursPerNature.map((item, i) => {
                    const config =
                      NATURE_CONFIG[item.natureza] || NATURE_CONFIG.OTHER;
                    return (
                      <div key={i} className={styles.natureItem}>
                        <div className={styles.natureItemLeft}>
                          <div
                            className={[styles.legendDot, config.colorClass]
                              .filter(Boolean)
                              .join(' ')}
                          />
                          <span>{config.label}</span>
                        </div>
                        <span className={styles.natureValue}>
                          {item.horas}h
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>Sem apontamentos</div>
            )}
          </CardContent>
        </Card>

        {/* Meta Diária - SVG Radial Progress Nativo */}
        <Card>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>Meta Diária</CardTitle>
          </CardHeader>
          <CardContent className={styles.radialContent}>
            <div className={styles.radialWrapper}>
              <svg className={styles.radialSvg} viewBox="0 0 100 100">
                {/* Círculo de fundo */}
                <circle
                  className={styles.radialBackground}
                  cx="50"
                  cy="50"
                  r={radius}
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Círculo de progresso */}
                <circle
                  className={styles.radialProgress}
                  cx="50"
                  cy="50"
                  r={radius}
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className={styles.radialTextWrapper}>
                <span className={styles.radialPercent}>
                  {data.kpis.dailyGoalPercent}%
                </span>
                <span className={styles.radialLabel}>concluído</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horas por Projeto - Usando o Radix Progress */}
        <Card className={styles.colSpan2}>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>
              Horas por Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.appointmentsPerProject.length > 0 ? (
              <div className={styles.projectList}>
                {data.appointmentsPerProject.map((item, index) => {
                  const percent = (item.horas / maxProjectHours) * 100;
                  return (
                    <div key={index} className={styles.projectItem}>
                      <div className={styles.projectItemHeader}>
                        <span className={styles.projectName}>
                          {item.projeto}
                        </span>
                        <span className={styles.projectValue}>
                          {item.horas}h
                        </span>
                      </div>
                      <Progress
                        value={percent}
                        className={styles.projectProgress}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                Sem projetos com tempo apontado
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className={styles.cardTitle}>
            Atividade Recente (Apontamentos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length > 0 ? (
            <div className={styles.feedContainer}>
              {data.recentActivity.map((item, index) => (
                <div key={index} className={styles.feedItem}>
                  <Timer className={styles.feedIcon} />
                  <div className={styles.feedText}>
                    <p>
                      <strong>{item.userName}</strong> - Apontou{' '}
                      {item.loggedMinutes}m em &quot;{item.taskTitle}&quot;
                    </p>
                  </div>
                  <span className={styles.feedTime}>
                    {timeAgo(item.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              Nenhuma atividade recente encontrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
