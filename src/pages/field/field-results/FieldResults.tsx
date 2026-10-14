import { useParams, Link } from 'react-router-dom';
import {
  Leaf,
  Droplets,
  Gauge,
  ChevronRight,
  CalendarCog,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useProperty } from '@/hooks/useProperty';
import { useTalhaoResults } from '@/hooks/useMonitoring';
import { useFieldCycles } from '@/hooks/useCycle';
import { Button } from '@/components/ui/button/button';

import styles from './FieldResults.module.css';

export default function FieldResultsPage() {
  const { propertyId, fieldId } = useParams<{
    propertyId: string;
    fieldId: string;
  }>();

  const { data: property } = useProperty(propertyId!);
  const { data: results, isLoading, isError } = useTalhaoResults(fieldId);
  const { data: cycles = [] } = useFieldCycles(fieldId);

  if (isLoading) {
    return (
      <div className={styles.centerLoading}>
        <Loader2 className="animate-spin" size={36} />
        <p>Carregando resultados consolidados do talhão...</p>
      </div>
    );
  }

  if (isError || !results) {
    return (
      <div className={styles.centerLoading}>
        <p>Resultados não encontrados para este talhão.</p>
        <Button asChild variant="outline" style={{ marginTop: '1rem' }}>
          <Link to={`/properties/${propertyId}`}>Voltar para propriedade</Link>
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
          {results.name} ({results.code})
        </span>
      </nav>

      {/* Cabeçalho */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Resultados: {results.name}</h1>
          <p className={styles.subtitle}>
            {results.code} ·{' '}
            {results.area ? `${results.area.toFixed(1)} ha` : '-- ha'} ·{' '}
            {results.soilType || 'Latossolo Vermelho'} · {property?.location}
          </p>
        </div>

        <div className={styles.actions}>
          <Button asChild variant="outline">
            <Link to={`/properties/${propertyId}/fields/${fieldId}/season`}>
              <CalendarCog size={16} style={{ marginRight: '6px' }} />
              Editar Safra
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Balanço de Carbono</span>
            <div className={styles.kpiIconWrapper}>
              <Leaf size={16} />
            </div>
          </div>
          <p className={styles.kpiValue} style={{ color: 'var(--primary)' }}>
            {results.kpis.balancoCarbono}
          </p>
          <p className={styles.kpiHint}>Sequestro líquido verificado</p>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Estoque de C no Solo</span>
            <div className={styles.kpiIconWrapper}>
              <Gauge size={16} />
            </div>
          </div>
          <p className={styles.kpiValue}>{results.kpis.estoqueSolo}</p>
          <p className={styles.kpiHint}>Densidade orgânica superficial</p>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Eficiência Hídrica</span>
            <div className={styles.kpiIconWrapper}>
              <Droplets size={16} />
            </div>
          </div>
          <p className={styles.kpiValue}>{results.kpis.eficienciaHidrica}</p>
          <p className={styles.kpiHint}>Vigor vegetativo multiespectral</p>
        </div>
      </div>

      {/* Gráficos de Resultados */}
      <div className={styles.chartsGrid}>
        {/* Gráfico de Carbono */}
        <div className={styles.chartCard}>
          <div>
            <h3 className={styles.cardTitle}>
              Evolução do Estoque de Carbono (t)
            </h3>
            <p className={styles.cardSubtitle}>
              Estoque acumulado no solo vs emissões brutas medidas
            </p>
          </div>

          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={results.carbonSeries}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="estoque"
                  name="Estoque de C (t)"
                  fill="#10b981"
                  stroke="#10b981"
                  fillOpacity={0.25}
                />
                <Area
                  type="monotone"
                  dataKey="emissao"
                  name="Emissão (t)"
                  fill="#f59e0b"
                  stroke="#f59e0b"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Hídrico */}
        <div className={styles.chartCard}>
          <div>
            <h3 className={styles.cardTitle}>Vigor NDVI vs Precipitação</h3>
            <p className={styles.cardSubtitle}>
              Resposta espectral da cultura à disponibilidade de chuvas
            </p>
          </div>

          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={results.waterSeries}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="mes" />
                <YAxis yAxisId="left" domain={[0, 1]} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ndvi"
                  name="NDVI (Vigor)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="chuva"
                  name="Chuva (mm)"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ciclos e Fases da Safra */}
      <div className={styles.cyclesSection}>
        <div>
          <h3 className={styles.cardTitle}>Ciclos e Manejos Registrados</h3>
          <p className={styles.cardSubtitle}>
            Histórico das fases de cultura e cobertura informadas para este
            talhão
          </p>
        </div>

        <div className={styles.cyclesList}>
          {cycles.length > 0 ? (
            cycles.map((c) => (
              <div key={c.id} className={styles.cycleItem}>
                <div className={styles.cycleInfo}>
                  <p className={styles.cycleTitle}>{c.titulo}</p>
                  <p className={styles.cycleMeta}>
                    {c.cultura ? `Cultura: ${c.cultura}` : 'Cobertura'} · Safra{' '}
                    {c.safra} · Insumos: {c.inputs.length} registrado(s)
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor:
                      c.tipo === 'COMMERCIAL'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(245, 158, 11, 0.15)',
                    color:
                      c.tipo === 'COMMERCIAL' ? 'var(--primary)' : '#f59e0b',
                    fontWeight: 600,
                  }}
                >
                  {c.tipo}
                </span>
              </div>
            ))
          ) : (
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--muted-foreground)',
              }}
            >
              Nenhum ciclo cadastrado nesta safra ainda. Configure as fases na
              tela de safra.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
