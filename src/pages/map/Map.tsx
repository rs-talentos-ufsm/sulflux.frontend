import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Map as MapIcon, Search, ArrowUpRight, Loader2 } from 'lucide-react';
import { useProperties } from '@/hooks/useProperty';
import { useMapExplorer } from '@/hooks/useMonitoring';
import { Input } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button/button';

import styles from './Map.module.css';

const LAYER_CONFIG = {
  Satélite: { fill: 'rgba(245, 158, 11, 0.25)', stroke: '#f59e0b' },
  NDVI: { fill: 'rgba(16, 185, 129, 0.35)', stroke: '#10b981' },
  Solo: { fill: 'rgba(180, 120, 70, 0.35)', stroke: '#b4784a' },
};

type LayerType = 'Satélite' | 'NDVI' | 'Solo';

// Polígonos SVG padrão para talhões quando não possuem polígono GeoJSON específico
const DEFAULT_SHAPES = [
  '70,50 180,40 210,120 150,190 60,160',
  '220,45 320,55 340,130 250,150 215,95',
  '250,165 345,150 360,230 270,255',
  '60,60 200,45 230,150 120,210 55,150',
  '240,60 350,70 345,200 250,190',
  '80,55 320,50 340,220 90,240',
];

export default function MapPage() {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>('Satélite');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedTalhaoId, setSelectedTalhaoId] = useState<string>('');
  const [search, setSearch] = useState('');

  const { data: propertiesData } = useProperties({ page: 1, limit: 50 });
  const properties = propertiesData?.data || [];

  const { data: mapData, isLoading } = useMapExplorer();
  const allTalhoes = mapData?.talhoes || [];

  const effectivePropertyId = selectedPropertyId || properties[0]?.id;

  const propertyTalhoes = useMemo(() => {
    return allTalhoes.filter((t) => {
      const matchProp = effectivePropertyId
        ? t.propertyId === effectivePropertyId
        : true;
      const matchSearch = search.trim()
        ? t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.code.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchProp && matchSearch;
    });
  }, [allTalhoes, effectivePropertyId, search]);

  const activeTalhao =
    propertyTalhoes.find((t) => t.id === selectedTalhaoId) ||
    propertyTalhoes[0];

  const currentLayerStyle = LAYER_CONFIG[selectedLayer];

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <MapIcon size={28} style={{ color: 'var(--primary)' }} />
          Mapa de Talhões
        </h1>
        <p className={styles.subtitle}>
          Visualização espacial georreferenciada com camadas de Satélite, NDVI e
          composição de solo.
        </p>
      </div>

      {isLoading ? (
        <div className={styles.centerLoading}>
          <Loader2 className="animate-spin" size={36} />
          <p>Carregando camadas espaciais e geometrias de talhões...</p>
        </div>
      ) : (
        <div className={styles.mapLayout}>
          {/* Painel lateral de filtro e seleção */}
          <div className={styles.sidebarPanel}>
            <div className={styles.filterCard}>
              <span className={styles.panelLabel}>Propriedade</span>
              <div className={styles.propertyList}>
                {properties.map((p) => {
                  const isActive = p.id === effectivePropertyId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`${styles.propertyItem} ${isActive ? styles.propertyItemActive : ''}`}
                      onClick={() => {
                        setSelectedPropertyId(p.id);
                        setSelectedTalhaoId('');
                      }}
                    >
                      <span>{p.name}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                        {p.location}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.filterCard}>
              <span className={styles.panelLabel}>Buscar Talhão</span>
              <div style={{ position: 'relative' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--muted-foreground)',
                  }}
                />
                <Input
                  placeholder="Nome ou código..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '34px' }}
                />
              </div>

              <div className={styles.talhoesList}>
                {propertyTalhoes.map((t) => {
                  const isSelected = activeTalhao?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`${styles.talhaoItem} ${isSelected ? styles.talhaoItemActive : ''}`}
                      onClick={() => setSelectedTalhaoId(t.id)}
                    >
                      <div>
                        <p className={styles.talhaoItemTitle}>{t.name}</p>
                        <p className={styles.talhaoItemCode}>{t.code}</p>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        {t.area ? `${t.area.toFixed(1)} ha` : '-- ha'}
                      </span>
                    </div>
                  );
                })}
                {propertyTalhoes.length === 0 && (
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--muted-foreground)',
                      textAlign: 'center',
                      padding: '1rem',
                    }}
                  >
                    Nenhum talhão cadastrado nesta propriedade.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Área do Mapa */}
          <div className={styles.mapViewportCard}>
            {/* Controles de Camadas */}
            <div className={styles.mapControls}>
              {(['Satélite', 'NDVI', 'Solo'] as const).map((layer) => (
                <button
                  key={layer}
                  type="button"
                  className={`${styles.layerButton} ${selectedLayer === layer ? styles.layerButtonActive : ''}`}
                  onClick={() => setSelectedLayer(layer)}
                >
                  {layer}
                </button>
              ))}
            </div>

            {/* Container Gráfico do Mapa SVG */}
            <div className={styles.svgMapContainer}>
              <svg viewBox="0 0 400 300" className={styles.svgMap}>
                <defs>
                  <pattern
                    id="satelliteGrid"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke="rgba(255,255,255,0.04)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>

                <rect width="400" height="300" fill="url(#satelliteGrid)" />

                {/* Renderização dos Talhões */}
                {propertyTalhoes.map((t, idx) => {
                  const points = DEFAULT_SHAPES[idx % DEFAULT_SHAPES.length];
                  const isSelected = activeTalhao?.id === t.id;

                  return (
                    <polygon
                      key={t.id}
                      points={points}
                      className={styles.talhaoPolygon}
                      fill={
                        isSelected
                          ? currentLayerStyle.fill
                          : 'rgba(255, 255, 255, 0.08)'
                      }
                      stroke={isSelected ? currentLayerStyle.stroke : '#64748b'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      strokeDasharray={isSelected ? undefined : '4 2'}
                      onClick={() => setSelectedTalhaoId(t.id)}
                    />
                  );
                })}
              </svg>

              {/* Card Flutuante de Detalhes do Talhão Ativo */}
              {activeTalhao && (
                <div className={styles.selectedTalhaoFloatingCard}>
                  <div className={styles.cardTopRow}>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                        {activeTalhao.name}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {activeTalhao.code} · {activeTalhao.propertyName}
                      </p>
                    </div>
                    <span className={styles.badgeReady}>
                      {activeTalhao.status}
                    </span>
                  </div>

                  <div className={styles.metaGrid}>
                    <div>
                      <span className={styles.metaItemTitle}>Área</span>
                      <span className={styles.metaItemValue}>
                        {activeTalhao.area
                          ? `${activeTalhao.area.toFixed(1)} ha`
                          : '-- ha'}
                      </span>
                    </div>
                    <div>
                      <span className={styles.metaItemTitle}>Solo</span>
                      <span className={styles.metaItemValue}>
                        {activeTalhao.soilType || 'Latossolo'}
                      </span>
                    </div>
                    <div>
                      <span className={styles.metaItemTitle}>Balanço C</span>
                      <span
                        className={styles.metaItemValue}
                        style={{ color: '#34d399' }}
                      >
                        {activeTalhao.carbonBalance}
                      </span>
                    </div>
                  </div>

                  <Button
                    asChild
                    size="sm"
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <Link
                      to={`/properties/${activeTalhao.propertyId}/fields/${activeTalhao.id}/results`}
                    >
                      Ver Resultados do Talhão
                      <ArrowUpRight size={14} style={{ marginLeft: '6px' }} />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
