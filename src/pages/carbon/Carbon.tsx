import { useState, useMemo } from 'react';
import { Leaf, Sun, Wind, Zap, TrendingDown, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
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
import { useCarbonAnalysis } from '@/hooks/useMonitoring';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/select';

import styles from './Carbon.module.css';

export default function CarbonPage() {
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
    data: carbonData,
    isLoading,
    isError,
  } = useCarbonAnalysis(effectiveFieldId, safra);

  const chartSeries = useMemo(() => carbonData?.series || [], [carbonData]);

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>
            <Leaf className={styles.titleIcon} size={28} />
            Análise de Carbono
          </h1>
          <p className={styles.subtitle}>
            Fluxos de carbono do ecossistema medidos por torres de Eddy
            Covariance e extrapolados por sensoriamento remoto multiespectral.
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
          <p>Calculando balanço de fluxos Eddy Covariance...</p>
        </div>
      ) : isError || !carbonData ? (
        <div className={styles.centerLoading}>
          <p>Nenhum dado de monitoramento disponível para este talhão.</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>GPP Total</span>
                <div className={styles.kpiIconWrapper}>
                  <Sun size={16} />
                </div>
              </div>
              <p className={styles.kpiValue}>{carbonData.kpis.gppTotal} g C</p>
              <p className={styles.kpiHint}>Fotossíntese Bruta Acumulada</p>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Reco Total</span>
                <div className={styles.kpiIconWrapper}>
                  <Wind size={16} />
                </div>
              </div>
              <p className={styles.kpiValue}>{carbonData.kpis.recoTotal} g C</p>
              <p className={styles.kpiHint}>Respiração Ecossistêmica</p>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>NEE Total</span>
                <div className={styles.kpiIconWrapper}>
                  <TrendingDown size={16} />
                </div>
              </div>
              <p className={styles.kpiValue}>{carbonData.kpis.neeTotal} g C</p>
              <p className={styles.kpiHint}>Troca Líquida do Ecossistema</p>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Sequestro Líquido</span>
                <div className={styles.kpiIconWrapper}>
                  <Zap size={16} />
                </div>
              </div>
              <p
                className={styles.kpiValue}
                style={{ color: 'var(--primary)' }}
              >
                {carbonData.kpis.sequestroLiquido}
              </p>
              <p className={styles.kpiHint}>Saldo positivo para crédito de C</p>
            </div>
          </div>

          {/* Gráfico Eddy Covariance */}
          <div className={styles.chartCard}>
            <div>
              <h2 className={styles.cardTitle}>
                Dinâmica de Fluxos de Carbono (gCO₂ m⁻² dia⁻¹)
              </h2>
              <p className={styles.cardSubtitle}>
                Valores negativos de NEE indicam absorção líquida de carbono
                pela vegetação (sumidouro).
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
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="gpp"
                    name="GPP (Produção Bruta)"
                    fill="#10b981"
                    stroke="#10b981"
                    fillOpacity={0.2}
                  />
                  <Line
                    type="monotone"
                    dataKey="reco"
                    name="Reco (Respiração)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nee"
                    name="NEE (Balanço Líquido)"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grade de Calor e Insights */}
          <div className={styles.gridAndInsights}>
            <div className={styles.chartCard}>
              <div>
                <h3 className={styles.cardTitle}>
                  Grade de Sequestro Espacial (Sentinel-2A, 10m)
                </h3>
                <p className={styles.cardSubtitle}>
                  Variação da taxa fotossintética dentro do talhão
                </p>
              </div>

              <div className={styles.heatmapGrid}>
                {carbonData.gridHeatmap.flatMap((row, rIdx) =>
                  row.map((val, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={styles.heatmapCell}
                      style={{
                        backgroundColor: `rgba(16, 185, 129, ${Math.max(0.15, val)})`,
                      }}
                      title={`Pixel (${rIdx + 1}, ${cIdx + 1}): ${(val * 100).toFixed(0)}% vigor`}
                    />
                  )),
                )}
              </div>

              <div className={styles.heatmapLegend}>
                <span>Menor absorção</span>
                <div className={styles.legendBar} />
                <span>Maior sequestro</span>
              </div>
            </div>

            {/* Insights Agronômicos */}
            <div className={styles.chartCard}>
              <div>
                <h3 className={styles.cardTitle}>Insights Agronômicos</h3>
                <p className={styles.cardSubtitle}>
                  Diagnóstico gerado para o talhão {carbonData.fieldName}
                </p>
              </div>

              <div className={styles.insightsList}>
                {carbonData.insights.map((insight, idx) => {
                  const toneClass =
                    insight.tone === 'warn'
                      ? styles.insightWarn
                      : insight.tone === 'good'
                        ? styles.insightGood
                        : styles.insightInfo;

                  return (
                    <div
                      key={idx}
                      className={`${styles.insightCard} ${toneClass}`}
                    >
                      <h4 className={styles.insightTitle}>{insight.title}</h4>
                      <p className={styles.insightText}>{insight.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
