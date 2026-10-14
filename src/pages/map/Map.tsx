import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Map as MapIcon, Search, ArrowUpRight, Loader2 } from 'lucide-react';
import { useProperties } from '@/hooks/useProperty';
import { useMapExplorer } from '@/hooks/useMonitoring';
import { PropertyMap } from '@/components/map/PropertyMap';
import { Input } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button/button';

import styles from './Map.module.css';

export default function MapPage() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedTalhaoId, setSelectedTalhaoId] = useState<string>('');
  const [search, setSearch] = useState('');

  const { data: propertiesData } = useProperties({ page: 1, limit: 50 });
  const properties = propertiesData?.data || [];

  const { data: mapData, isLoading } = useMapExplorer();
  const allTalhoes = mapData?.talhoes || [];

  const effectivePropertyId = selectedPropertyId || properties[0]?.id;
  const currentProperty = properties.find((p) => p.id === effectivePropertyId);

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

          {/* Área do Mapa com PropertyMap Satélite */}
          <div
            className={styles.mapViewportCard}
            style={{ padding: 0, overflow: 'hidden', position: 'relative' }}
          >
            <PropertyMap
              title={
                currentProperty
                  ? `Mapa Espacial · ${currentProperty.name}`
                  : 'Mapa de Propriedades e Talhões'
              }
              subtitle={
                currentProperty
                  ? `${currentProperty.location} · ${propertyTalhoes.length} talhão(ões) mapeado(s)`
                  : 'Selecione uma propriedade para visualizar o perímetro e os talhões no satélite.'
              }
              polygon={currentProperty?.coordinates as any}
              polygonColor="#22c55e"
              initialCenter={
                currentProperty?.coordinates &&
                Array.isArray(currentProperty.coordinates) &&
                currentProperty.coordinates.length > 0
                  ? [
                      currentProperty.coordinates[0].lng,
                      currentProperty.coordinates[0].lat,
                    ]
                  : undefined
              }
              markers={propertyTalhoes
                .filter(
                  (t: any) =>
                    t.coordinates &&
                    (Array.isArray(t.coordinates) ||
                      (t.coordinates.lat && t.coordinates.lng)),
                )
                .map((t: any) => ({
                  id: t.id,
                  name: t.name,
                  location: t.code,
                  area: t.area,
                  status: t.status,
                  coordinates: Array.isArray(t.coordinates)
                    ? [t.coordinates[0].lng, t.coordinates[0].lat]
                    : [t.coordinates.lng, t.coordinates.lat],
                }))}
              selectedMarkerId={activeTalhao?.id}
              onSelectMarker={(item) => setSelectedTalhaoId(item.id)}
              height="620px"
            />

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
      )}
    </div>
  );
}
