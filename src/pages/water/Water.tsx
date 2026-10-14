import { useState, useMemo } from 'react';
import {
  Droplets,
  CloudRain,
  Waves,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useProperties } from '@/hooks/useProperty';
import { useFields } from '@/hooks/useField';
import { useWaterAnalysis } from '@/hooks/useMonitoring';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/select';

import styles from './Water.module.css';

export default function WaterPage() {
  const [safra, setSafra] = useState('2023 / 2024');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');

  const { data: propertiesData } = useProperties({ page: 1, limit: 50 });
  const properties = propertiesData?.data || [];

  const effectivePropertyId = selectedPropertyId || properties[0]?.id;

  const { data: fieldsData } = useFields({
    page: 1,
    limit: 100,
    propertyId: effectivePropertyId,
  });
  const fields = fieldsData?.data || [];

  const effectiveFieldId = selectedFieldId || fields[0]?.id;

  const {
    data: waterData,
    isLoading,
    isError,
  } = useWaterAnalysis(effectiveFieldId, safra);

  const chartSeries = useMemo(() => waterData?.series || [], [waterData]);

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>
            <Droplets className={styles.titleIcon} size={28} />
            Análise Hídrica
          </h1>
          <p className={styles.subtitle}>
            Balanço de água no solo, estresse hídrico e eficiência do uso da
            água ao longo do ciclo produtivo.
          </p>
        </div>

        {/* Seletores de Contexto */}
        <div className={styles.selectors}>
          <div className={styles.selectorItem}>
            <label className={styles.selectorLabel}>Safra</label>
            <Select value={safra} onValueChange={setSafra}>
              <SelectTrigger style={{ width: '150px' }}>
                <SelectValue placeholder="Safra" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023 / 2024">2023 / 2024</SelectItem>
                <SelectItem value="2022 / 2023">2022 / 2023</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={styles.selectorItem}>
            <label className={styles.selectorLabel}>Propriedade</label>
            <Select
              value={effectivePropertyId}
              onValueChange={(val) => {
                setSelectedPropertyId(val);
                setSelectedFieldId('');
              }}
            >
              <SelectTrigger style={{ width: '180px' }}>
                <SelectValue placeholder="Propriedade" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={styles.selectorItem}>
            <label className={styles.selectorLabel}>Talhão</label>
            <Select
              value={effectiveFieldId}
              onValueChange={setSelectedFieldId}
              disabled={fields.length === 0}
            >
              <SelectTrigger style={{ width: '170px' }}>
                <SelectValue placeholder="Talhão" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.centerLoading}>
          <Loader2 className="animate-spin" size={36} />
          <p>Calculando balanço hídrico e umidade do solo...</p>
        </div>
      ) : isError || !waterData ? (
        <div className={styles.centerLoading}>
          <p>Nenhum dado hídrico disponível para este talhão.</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Chuva Acumulada</span>
                <div className={styles.kpiIconWrapper}>
                  <CloudRain size={16} />
                </div>
              </div>
              <p className={styles.kpiValue}>
                {waterData.kpis.chuvaAcumulada} mm
              </p>
              <p className={styles.kpiHint}>Precipitação total na safra</p>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Umidade Média</span>
                <div className={styles.kpiIconWrapper}>
                  <Waves size={16} />
                </div>
              </div>
              <p className={styles.kpiValue}>{waterData.kpis.umidadeMedia}%</p>
              <p className={styles.kpiHint}>Água disponível no solo</p>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Dias Críticos</span>
                <div className={styles.kpiIconWrapper}>
                  <AlertTriangle size={16} />
                </div>
              </div>
              <p className={styles.kpiValue} style={{ color: '#ef4444' }}>
                {waterData.kpis.diasAbaixoLimiar} dias
              </p>
              <p className={styles.kpiHint}>Abaixo do ponto de murcha</p>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Status Hídrico</span>
                <div className={styles.kpiIconWrapper}>
                  <Droplets size={16} />
                </div>
              </div>
              <p className={styles.kpiValue} style={{ color: '#0284c7' }}>
                {waterData.kpis.statusHidrico}
              </p>
              <p className={styles.kpiHint}>Condição geral do perfil</p>
            </div>
          </div>

          {/* Gráfico Balanço Hídrico */}
          <div className={styles.chartCard}>
            <div>
              <h2 className={styles.cardTitle}>
                Balanço de Umidade do Solo vs. Precipitação
              </h2>
              <p className={styles.cardSubtitle}>
                Acompanhamento mensal da água no solo em relação ao limiar
                crítico de murcha (45%).
              </p>
            </div>

            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartSeries}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <ReferenceLine
                    yAxisId="right"
                    y={45}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Limiar Crítico (45%)',
                      fill: '#ef4444',
                      fontSize: 11,
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="precipitacao"
                    name="Precipitação (mm)"
                    fill="#38bdf8"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="agua"
                    name="Água no Solo (%)"
                    stroke="#0284c7"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Histórico de Anomalias Climáticas */}
          <div className={styles.chartCard}>
            <div>
              <h3 className={styles.cardTitle}>
                Anomalias Climáticas Detectadas
              </h3>
              <p className={styles.cardSubtitle}>
                Eventos hidrológicos anômalos registrados durante o
                monitoramento
              </p>
            </div>

            <div className={styles.anomaliesList}>
              {waterData.anomalias.map((anomaly, idx) => {
                const badgeClass =
                  anomaly.level === 'alto'
                    ? styles.anomalyBadgeAlto
                    : anomaly.level === 'medio'
                      ? styles.anomalyBadgeMedio
                      : styles.anomalyBadgeBaixo;

                return (
                  <div key={idx} className={styles.anomalyCard}>
                    <span className={badgeClass}>
                      {anomaly.level.toUpperCase()}
                    </span>
                    <div className={styles.anomalyContent}>
                      <span className={styles.anomalyPeriod}>
                        {anomaly.period}
                      </span>
                      <h4 className={styles.anomalyTitle}>{anomaly.title}</h4>
                      <p className={styles.anomalyDetail}>{anomaly.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
