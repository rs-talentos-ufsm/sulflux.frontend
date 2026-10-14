import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Map as MapLibreMap,
  NavigationControl,
  Marker,
  LngLatBounds,
  type StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Satellite,
  Compass,
  Layers,
  Search,
  Maximize2,
  Minimize2,
  Undo2,
  Trash2,
  RotateCcw,
  Loader2,
  X,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import styles from './PropertyMap.module.css';

export type MapStyleKey = 'satellite' | 'liberty' | 'positron' | 'bright';

// Estilo de Satélite em Alta Resolução (ESRI World Imagery - Livre e sem chave de API)
const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution:
        'Esri, Maxar, Earthstar Geographics, USDA FSA, USGS, Aerogrid, IGN, IGP, and the GIS User Community',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const MAP_STYLES: Record<
  MapStyleKey,
  { name: string; urlOrStyle: string | StyleSpecification }
> = {
  satellite: {
    name: 'Satélite',
    urlOrStyle: SATELLITE_STYLE,
  },
  liberty: {
    name: 'Ruas & Relevo',
    urlOrStyle: 'https://tiles.openfreemap.org/styles/liberty',
  },
  positron: {
    name: 'Claro',
    urlOrStyle: 'https://tiles.openfreemap.org/styles/positron',
  },
  bright: {
    name: 'Vibrante',
    urlOrStyle: 'https://tiles.openfreemap.org/styles/bright',
  },
};

// Centro Padrão Sul do Brasil / Rio Grande do Sul (Santa Maria - UFSM)
const DEFAULT_CENTER: [number, number] = [-53.7147, -29.7207];

export interface MapMarkerItem {
  id: string;
  name: string;
  location?: string;
  area?: number | null;
  car?: string | null;
  status?: string;
  coordinates: [number, number] | { lat: number; lng: number };
}

export interface PropertyMapProps {
  mode?: 'view' | 'picker' | 'draw-polygon';
  title?: string;
  subtitle?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  height?: string | number;
  className?: string;

  // Polígono GeoJSON (para visualização de limites do CAR ou do Talhão)
  polygon?: Array<{ lat: number; lng: number }> | Array<[number, number]>;
  polygonColor?: string;

  // Marcadores múltiplos (ex: visão geral de propriedades)
  markers?: MapMarkerItem[];
  selectedMarkerId?: string | null;
  onSelectMarker?: (marker: MapMarkerItem) => void;

  // Picker de coordenadas (para cadastrar fazenda ou ponto de sede)
  pickedLocation?: [number, number] | null;
  onPickLocation?: (coords: [number, number]) => void;

  // Modo de desenho de polígono (para talhão)
  drawnVertices?: Array<[number, number]>;
  onDrawnVerticesChange?: (vertices: Array<[number, number]>) => void;

  showControls?: boolean;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  mode = 'view',
  title,
  subtitle,
  initialCenter,
  initialZoom = 13,
  height = '420px',
  className,
  polygon,
  polygonColor = '#22c55e',
  markers = [],
  selectedMarkerId,
  onSelectMarker,
  pickedLocation = null,
  onPickLocation,
  drawnVertices = [],
  onDrawnVerticesChange,
  showControls = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersMapRef = useRef<Map<string, Marker>>(new Map());
  const pickerMarkerRef = useRef<Marker | null>(null);
  const drawMarkersRef = useRef<Marker[]>([]);

  // Estados locais
  const [activeStyle, setActiveStyle] = useState<MapStyleKey>('satellite');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<[number, number] | null>(
    pickedLocation || initialCenter || null,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePopupItem, setActivePopupItem] = useState<MapMarkerItem | null>(
    null,
  );

  // Normaliza coordenadas de polígono para Array<[lng, lat]>
  const normalizedPolygonCoords = useCallback((): [number, number][] => {
    if (!polygon || polygon.length < 3) return [];
    return polygon.map((pt) => {
      if (Array.isArray(pt)) {
        return [pt[0], pt[1]] as [number, number];
      }
      return [pt.lng, pt.lat] as [number, number];
    });
  }, [polygon]);

  // Aplica polígono no mapa (Fill + Stroke)
  const renderPolygonLayer = useCallback(
    (map: MapLibreMap) => {
      const coords = normalizedPolygonCoords();
      if (coords.length < 3) {
        if (map.getLayer('property-polygon-line'))
          map.removeLayer('property-polygon-line');
        if (map.getLayer('property-polygon-fill'))
          map.removeLayer('property-polygon-fill');
        if (map.getSource('property-polygon-source'))
          map.removeSource('property-polygon-source');
        return;
      }

      // Fecha o anel se necessário
      const closedRing = [...coords];
      const first = closedRing[0];
      const last = closedRing[closedRing.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        closedRing.push(first);
      }

      const geojsonData: any = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [closedRing],
            },
            properties: {},
          },
        ],
      };

      if (map.getSource('property-polygon-source')) {
        const src = map.getSource('property-polygon-source') as any;
        src.setData(geojsonData);
      } else {
        map.addSource('property-polygon-source', {
          type: 'geojson',
          data: geojsonData,
        });

        map.addLayer({
          id: 'property-polygon-fill',
          type: 'fill',
          source: 'property-polygon-source',
          paint: {
            'fill-color': polygonColor,
            'fill-opacity': 0.28,
          },
        });

        map.addLayer({
          id: 'property-polygon-line',
          type: 'line',
          source: 'property-polygon-source',
          paint: {
            'line-color': polygonColor,
            'line-width': 3,
            'line-dasharray': [4, 2],
          },
        });
      }

      // Ajusta o enquadramento (bounds) para exibir todo o polígono
      const bounds = new LngLatBounds();
      coords.forEach((coord) => bounds.extend(coord));
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 40, maxZoom: 16, duration: 1200 });
      }
    },
    [normalizedPolygonCoords, polygonColor],
  );

  // Atualiza polígono de desenho interativo
  const renderDrawnPolygonLayer = useCallback(
    (map: MapLibreMap) => {
      if (drawnVertices.length < 2) {
        if (map.getLayer('drawn-polygon-line'))
          map.removeLayer('drawn-polygon-line');
        if (map.getLayer('drawn-polygon-fill'))
          map.removeLayer('drawn-polygon-fill');
        if (map.getSource('drawn-polygon-source'))
          map.removeSource('drawn-polygon-source');
        return;
      }

      const isClosed = drawnVertices.length >= 3;
      const ring = [...drawnVertices];
      if (isClosed) {
        ring.push(drawnVertices[0]);
      }

      const geojsonData: any = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: isClosed
              ? {
                  type: 'Polygon',
                  coordinates: [ring],
                }
              : {
                  type: 'LineString',
                  coordinates: ring,
                },
            properties: {},
          },
        ],
      };

      if (map.getSource('drawn-polygon-source')) {
        (map.getSource('drawn-polygon-source') as any).setData(geojsonData);
      } else {
        map.addSource('drawn-polygon-source', {
          type: 'geojson',
          data: geojsonData,
        });

        if (isClosed) {
          map.addLayer({
            id: 'drawn-polygon-fill',
            type: 'fill',
            source: 'drawn-polygon-source',
            paint: {
              'fill-color': '#f59e0b',
              'fill-opacity': 0.3,
            },
          });
        }

        map.addLayer({
          id: 'drawn-polygon-line',
          type: 'line',
          source: 'drawn-polygon-source',
          paint: {
            'line-color': '#f59e0b',
            'line-width': 3,
          },
        });
      }
    },
    [drawnVertices],
  );

  // Inicialização do MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const startCenter = pickedLocation || initialCenter || DEFAULT_CENTER;
    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: MAP_STYLES[activeStyle].urlOrStyle,
      center: startCenter,
      zoom: initialZoom,
      minZoom: 3,
      maxZoom: 19,
      pitch: activeStyle === 'satellite' ? 25 : 35,
      bearing: 0,
      attributionControl: false,
    });

    map.addControl(
      new NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      }),
      'top-right',
    );

    map.on('load', () => {
      renderPolygonLayer(map);
      renderDrawnPolygonLayer(map);
      map.resize();
    });

    // Clique no mapa conforme o modo
    map.on('click', (e) => {
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      setCurrentCoords(coords);

      if (mode === 'picker') {
        onPickLocation?.(coords);
      } else if (mode === 'draw-polygon') {
        const next = [...drawnVertices, coords];
        onDrawnVerticesChange?.(next);
      }
    });

    // ResizeObserver para manter o mapa responsivo
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      observer = new ResizeObserver(() => map.resize());
      observer.observe(mapContainerRef.current);
    }

    mapRef.current = map;

    return () => {
      observer?.disconnect();
      markersMapRef.current.forEach((m) => m.remove());
      markersMapRef.current.clear();
      pickerMarkerRef.current?.remove();
      drawMarkersRef.current.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Troca de Estilos (Satélite, Ruas, etc.)
  const handleStyleChange = (styleKey: MapStyleKey) => {
    setActiveStyle(styleKey);
    const map = mapRef.current;
    if (!map) return;

    map.setStyle(MAP_STYLES[styleKey].urlOrStyle);

    // Quando o novo estilo carregar, reaplica os polígonos
    map.once('style.load', () => {
      renderPolygonLayer(map);
      renderDrawnPolygonLayer(map);
      map.resize();
    });
  };

  // Re-renderiza polígono se os dados mudarem
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      renderPolygonLayer(mapRef.current);
    }
  }, [polygon, renderPolygonLayer]);

  // Re-renderiza polígono desenhado
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      renderDrawnPolygonLayer(mapRef.current);
    }
  }, [drawnVertices, renderDrawnPolygonLayer]);

  // Atualização do Marcador Picker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (mode === 'picker' && pickedLocation) {
      if (!pickerMarkerRef.current) {
        const el = document.createElement('div');
        el.className = styles.customMarker;
        el.innerHTML = `
          <div class="${styles.markerPin}" style="background: var(--primary);">
            <svg class="${styles.markerPinIcon}" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <span class="${styles.markerLabel}">Sede da Propriedade</span>
        `;

        const marker = new Marker({
          element: el,
          draggable: true,
        })
          .setLngLat(pickedLocation)
          .addTo(map);

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          const nextCoords: [number, number] = [lngLat.lng, lngLat.lat];
          setCurrentCoords(nextCoords);
          onPickLocation?.(nextCoords);
        });

        pickerMarkerRef.current = marker;
      } else {
        pickerMarkerRef.current.setLngLat(pickedLocation);
      }
    } else if (mode !== 'picker' && pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }
  }, [mode, pickedLocation, onPickLocation]);

  // Marcadores múltiplos (Propriedades cadastradas)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Limpa marcadores anteriores
    markersMapRef.current.forEach((m) => m.remove());
    markersMapRef.current.clear();

    if (markers.length === 0) return;

    const bounds = new LngLatBounds();

    markers.forEach((item) => {
      const rawCoords = item.coordinates;
      const coords: [number, number] = Array.isArray(rawCoords)
        ? rawCoords
        : [rawCoords.lng, rawCoords.lat];

      bounds.extend(coords);

      const el = document.createElement('div');
      el.className = styles.customMarker;
      const isSelected = selectedMarkerId === item.id;
      const color = isSelected ? '#10b981' : 'var(--primary)';

      el.innerHTML = `
        <div class="${styles.markerPin}" style="background: ${color};">
          <svg class="${styles.markerPinIcon}" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <span class="${styles.markerLabel}">${item.name}</span>
      `;

      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        setActivePopupItem(item);
        onSelectMarker?.(item);
        map.flyTo({ center: coords, zoom: 14.5, duration: 1000 });
      });

      const marker = new Marker({ element: el }).setLngLat(coords).addTo(map);
      markersMapRef.current.set(item.id, marker);
    });

    if (!polygon && !bounds.isEmpty() && markers.length > 1) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 15, duration: 1000 });
    }
  }, [markers, selectedMarkerId, onSelectMarker, polygon]);

  // Marcadores dos vértices desenhados
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    drawMarkersRef.current.forEach((m) => m.remove());
    drawMarkersRef.current = [];

    if (mode === 'draw-polygon') {
      drawnVertices.forEach((vertex, index) => {
        const el = document.createElement('div');
        el.style.width = '14px';
        el.style.height = '14px';
        el.style.borderRadius = '50%';
        el.style.background = '#f59e0b';
        el.style.border = '2px solid #ffffff';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        el.title = `Vértice #${index + 1}`;

        const marker = new Marker({ element: el }).setLngLat(vertex).addTo(map);
        drawMarkersRef.current.push(marker);
      });
    }
  }, [mode, drawnVertices]);

  // Busca espacial via Nominatim ou Coordenadas
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query || !mapRef.current) return;

    // Se for coordenada direta "lat, lng" ou "lng, lat"
    const coordMatch = query.match(
      /^([-+]?\d+(\.\d+)?)[,\s]+([-+]?\d+(\.\d+)?)$/,
    );
    if (coordMatch) {
      const v1 = parseFloat(coordMatch[1]);
      const v2 = parseFloat(coordMatch[3]);
      // Brasil: Lat entre -34 e +5, Lng entre -74 e -30
      const lat = v1 < 0 && v1 > -40 ? v1 : v2;
      const lng = v1 < -30 ? v1 : v2;

      mapRef.current.flyTo({ center: [lng, lat], zoom: 15, duration: 1500 });
      setCurrentCoords([lng, lat]);
      if (mode === 'picker') onPickLocation?.([lng, lat]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&countrycodes=br&limit=1`,
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        mapRef.current.flyTo({ center: [lon, lat], zoom: 14, duration: 1500 });
        setCurrentCoords([lon, lat]);
        if (mode === 'picker') onPickLocation?.([lon, lat]);
      }
    } catch (err) {
      console.warn('Falha na busca Nominatim:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Botões de desfazer / limpar no modo desenho
  const handleUndoVertex = () => {
    if (drawnVertices.length === 0) return;
    const next = drawnVertices.slice(0, -1);
    onDrawnVerticesChange?.(next);
  };

  const handleClearVertices = () => {
    onDrawnVerticesChange?.([]);
  };

  const handleRecenter = () => {
    if (!mapRef.current) return;
    const center = pickedLocation || initialCenter || DEFAULT_CENTER;
    mapRef.current.flyTo({ center, zoom: initialZoom, duration: 1000 });
  };

  return (
    <div
      className={`${styles.container} ${className || ''}`}
      style={
        isFullscreen
          ? { position: 'fixed', inset: 0, zIndex: 9999, borderRadius: 0 }
          : {}
      }
    >
      {/* Header do Mapa com Toolbar */}
      {showControls && (
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <div className={styles.iconWrapper}>
              <Satellite size={18} />
            </div>
            <div>
              <h3 className={styles.title}>
                {title ||
                  (mode === 'picker'
                    ? 'Selecionar Coordenadas no Mapa'
                    : 'Visualizador Espacial de Terras')}
              </h3>
              <p className={styles.subtitle}>
                {subtitle ||
                  (mode === 'picker'
                    ? 'Clique no mapa ou arraste o marcador para definir a localização da sede.'
                    : mode === 'draw-polygon'
                      ? 'Clique sobre o mapa para marcar os vértices do talhão.'
                      : 'Visualização por satélite e demarcações de terras com alta resolução.')}
              </p>
            </div>
          </div>

          <div className={styles.controls}>
            {/* Seletor de Camadas / Estilo */}
            <div className={styles.modeToggleGroup}>
              <button
                type="button"
                className={`${styles.modeButton} ${activeStyle === 'satellite' ? styles.modeButtonActive : ''}`}
                onClick={() => handleStyleChange('satellite')}
                title="Imagem de Satélite de Alta Resolução"
              >
                <Satellite size={14} />
                <span>Satélite</span>
              </button>
              <button
                type="button"
                className={`${styles.modeButton} ${activeStyle === 'liberty' ? styles.modeButtonActive : ''}`}
                onClick={() => handleStyleChange('liberty')}
                title="Ruas, Estradas e Topografia"
              >
                <Layers size={14} />
                <span>Ruas</span>
              </button>
              <button
                type="button"
                className={`${styles.modeButton} ${activeStyle === 'positron' ? styles.modeButtonActive : ''}`}
                onClick={() => handleStyleChange('positron')}
                title="Mapa Claro / Clean"
              >
                <Compass size={14} />
                <span>Claro</span>
              </button>
            </div>

            {/* Centralizar */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecenter}
              title="Recentrar Mapa"
            >
              <RotateCcw size={14} />
            </Button>

            {/* Tela cheia */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsFullscreen(!isFullscreen);
                setTimeout(() => mapRef.current?.resize(), 100);
              }}
              title={
                isFullscreen ? 'Sair da tela cheia' : 'Expandir para tela cheia'
              }
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </Button>
          </div>
        </div>
      )}

      {/* Canvas do Mapa */}
      <div
        className={styles.mapWrapper}
        style={{ height: isFullscreen ? '100%' : height }}
      >
        <div ref={mapContainerRef} className={styles.mapCanvas} />

        {/* Barra de Pesquisa Geográfica Flutuante */}
        {showControls && (
          <form className={styles.searchBarFloating} onSubmit={handleSearch}>
            {isSearching ? (
              <Loader2
                size={15}
                className="animate-spin text-muted-foreground"
              />
            ) : (
              <Search size={15} />
            )}
            <input
              type="text"
              placeholder="Buscar cidade, endereço ou coordenadas..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        )}

        {/* Ações do modo desenho */}
        {mode === 'draw-polygon' && (
          <div className={styles.drawActionsFloating}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0 0.5rem',
              }}
            >
              Vértices: {drawnVertices.length}
            </span>
            <button
              type="button"
              className={styles.actionButton}
              onClick={handleUndoVertex}
              disabled={drawnVertices.length === 0}
              title="Desfazer último vértice"
            >
              <Undo2 size={14} />
              <span>Desfazer</span>
            </button>
            <button
              type="button"
              className={styles.actionButton}
              onClick={handleClearVertices}
              disabled={drawnVertices.length === 0}
              title="Limpar todos os vértices"
            >
              <Trash2 size={14} />
              <span>Limpar</span>
            </button>
          </div>
        )}

        {/* Badge Flutuante de Coordenadas */}
        {currentCoords && (
          <div className={styles.coordsBadgeFloating}>
            <span className={styles.coordsDot} />
            <span>
              Lat: {currentCoords[1].toFixed(5)}, Lng:{' '}
              {currentCoords[0].toFixed(5)}
            </span>
          </div>
        )}

        {/* Popup Flutuante do Marcador Selecionado */}
        {activePopupItem && (
          <div className={styles.floatingPopup}>
            <div className={styles.popupHeader}>
              <h4 className={styles.popupTitle}>{activePopupItem.name}</h4>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setActivePopupItem(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className={styles.popupMeta}>
              {activePopupItem.location && (
                <span>📍 {activePopupItem.location}</span>
              )}
              {activePopupItem.area && (
                <span>📐 {activePopupItem.area.toFixed(1)} hectares</span>
              )}
              {activePopupItem.car && (
                <span>📄 CAR: {activePopupItem.car}</span>
              )}
            </div>
            <Button
              size="sm"
              style={{ width: '100%' }}
              onClick={() => {
                onSelectMarker?.(activePopupItem);
              }}
            >
              <span>Ver Detalhes</span>
              <ExternalLink size={14} style={{ marginLeft: '4px' }} />
            </Button>
          </div>
        )}
      </div>

      {/* Rodapé explicativo */}
      {mode === 'picker' && (
        <div className={styles.hintFooter}>
          <span>
            💡 Clique no mapa para posicionar ou arraste o marcador para ajustar
            com precisão milimétrica.
          </span>
          {pickedLocation && (
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
              Localização Selecionada ✓
            </span>
          )}
        </div>
      )}
    </div>
  );
};
