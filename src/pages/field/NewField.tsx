import { useState, useMemo, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Ruler,
  Spline,
  Check,
  Info,
  Layers,
  Loader2,
  FileUp,
  DownloadCloud,
} from 'lucide-react';

import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';
import { PropertyMap } from '@/components/map/PropertyMap';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/select';
import { toast } from 'sonner';

import api from '@/api/api';
import { useProperty } from '@/hooks/useProperty';
import { useCreateField } from '@/hooks/useField';
import type { CreateFieldDTO, ShapefileImportResponseDTO } from '@lib/shared';

import styles from './NewField.module.css';

const soils = [
  'Latossolo Vermelho',
  'Latossolo Bruno',
  'Argissolo',
  'Nitossolo',
  'Cambissolo',
];

function calculateAreaHa(vertices: [number, number][]): number {
  if (vertices.length < 3) return 0;
  const avgLat = vertices.reduce((sum, v) => sum + v[1], 0) / vertices.length;
  const latRad = (avgLat * Math.PI) / 180;
  const metersPerDegLat = 111320;
  const metersPerDegLng = 111320 * Math.cos(latRad);

  let areaSqMeters = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    const xi = vertices[i][0] * metersPerDegLng;
    const yi = vertices[i][1] * metersPerDegLat;
    const xj = vertices[j][0] * metersPerDegLng;
    const yj = vertices[j][1] * metersPerDegLat;
    areaSqMeters += xi * yj - xj * yi;
  }
  return Math.abs(areaSqMeters / 2) / 10000;
}

export default function NewFieldPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Hooks da API
  const { data: property, isLoading: isPropertyLoading } = useProperty(id!);
  const { mutateAsync: createField, isPending } = useCreateField();

  // Estados locais
  const [name, setName] = useState('');
  const [soilType, setSoilType] = useState(soils[0]);
  const [drawnVertices, setDrawnVertices] = useState<Array<[number, number]>>(
    [],
  );
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialCenter = useMemo<[number, number] | undefined>(() => {
    if (drawnVertices.length > 0) {
      return drawnVertices[0];
    }
    if (
      property?.coordinates &&
      Array.isArray(property.coordinates) &&
      property.coordinates.length > 0
    ) {
      const first = property.coordinates[0];
      return [first.lng, first.lat];
    }
    return undefined;
  }, [property?.coordinates, drawnVertices]);

  const calculatedAreaHa = useMemo(
    () => calculateAreaHa(drawnVertices),
    [drawnVertices],
  );

  // Importação de arquivo Shapefile (.zip) via API ou GeoJSON local
  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      let foundCoords: Array<[number, number]> = [];
      let foundName = '';

      if (file.name.endsWith('.zip')) {
        // Converte o arquivo para Base64 e processa com a API do backend
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
        });
        reader.readAsDataURL(file);

        const base64Data = await base64Promise;

        const { data } = await api.post<ShapefileImportResponseDTO>(
          '/gis/import-shapefile',
          {
            fileBase64: base64Data,
            fileName: file.name,
          },
        );

        if (data.features && data.features.length > 0) {
          const firstFeature = data.features[0];
          foundCoords = firstFeature.coordinates.map((pt) => [pt.lng, pt.lat]);
          foundName = firstFeature.name;
        }
      } else if (
        file.name.endsWith('.geojson') ||
        file.name.endsWith('.json')
      ) {
        const text = await file.text();
        const geojson = JSON.parse(text);
        const featureCollections: any[] = Array.isArray(geojson)
          ? geojson
          : [geojson];

        for (const fc of featureCollections) {
          if (!fc?.features) continue;
          for (const f of fc.features) {
            if (!f.geometry) continue;

            if (f.geometry.type === 'Polygon') {
              const ring = f.geometry.coordinates[0];
              if (ring && ring.length >= 3) {
                foundCoords = ring.map(([lng, lat]: [number, number]) => [
                  lng,
                  lat,
                ]);
                foundName =
                  f.properties?.NOME ||
                  f.properties?.TALHAO ||
                  f.properties?.Nome ||
                  f.properties?.name ||
                  file.name.replace(/\.[^/.]+$/, '');
                break;
              }
            } else if (f.geometry.type === 'MultiPolygon') {
              const poly = f.geometry.coordinates[0];
              const ring = poly ? poly[0] : null;
              if (ring && ring.length >= 3) {
                foundCoords = ring.map(([lng, lat]: [number, number]) => [
                  lng,
                  lat,
                ]);
                foundName =
                  f.properties?.NOME ||
                  f.properties?.TALHAO ||
                  f.properties?.Nome ||
                  f.properties?.name ||
                  file.name.replace(/\.[^/.]+$/, '');
                break;
              }
            }
          }
          if (foundCoords.length > 0) break;
        }
      } else {
        toast.error(
          'Formato não suportado. Envie um arquivo .zip (Shapefile) ou .geojson',
        );
        setIsImporting(false);
        return;
      }

      if (foundCoords.length >= 3) {
        setDrawnVertices(foundCoords);
        if (foundName && !name) {
          setName(foundName);
        }
        toast.success(
          `Shapefile importado com sucesso! ${foundCoords.length} vértices carregados.`,
        );
      } else {
        toast.warning(
          'Nenhum polígono válido foi identificado no arquivo Shapefile fornecido.',
        );
      }
    } catch (err: any) {
      toast.error(
        `Erro ao processar Shapefile: ${err?.response?.data?.detail || err?.message || 'Arquivo inválido.'}`,
      );
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleSaveField() {
    if (!name.trim()) {
      toast.error('Por favor, preencha o nome do talhão.');
      return;
    }
    if (drawnVertices.length < 3) {
      toast.error(
        'O talhão precisa ter pelo menos 3 vértices marcados no mapa.',
      );
      return;
    }

    const fieldData: CreateFieldDTO = {
      name: name.trim(),
      soilType: soilType,
      propertyId: id!,
      coordinates: drawnVertices.map(([lng, lat]) => ({ x: lng, y: lat })),
    };

    try {
      await createField(fieldData);
      toast.success('Talhão criado com sucesso!');
      navigate(`/properties/${id}`);
    } catch {
      toast.error('Erro ao salvar o talhão. Tente novamente.');
    }
  }

  const estimatedArea =
    drawnVertices.length >= 3 ? `${calculatedAreaHa.toFixed(2)} ha` : '—';
  const estimatedPerimeter =
    drawnVertices.length >= 2 ? `${drawnVertices.length} vértices` : '—';

  if (isPropertyLoading) {
    return (
      <div className={styles.centerState}>
        <Loader2 className="animate-spin" size={32} />
        <p>Carregando mapa...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className={styles.centerState}>
        <p>Propriedade não encontrada.</p>
        <Button asChild variant="outline">
          <Link to="/properties">Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Demarcação de Talhão · Imagem de Satélite</h1>
        <p className={styles.subtitle}>
          Delimite o talhão diretamente no mapa de satélite da propriedade{' '}
          <strong>{property.name}</strong> ou importe um arquivo <strong>Shapefile (.zip)</strong>.
        </p>
      </div>

      <div className={styles.gridContainer}>
        {/* Mapa interativo de satélite com desenho ou exibição de shapefile */}
        <div style={{ flex: 1, minWidth: '320px' }}>
          <PropertyMap
            mode="draw-polygon"
            title={`Demarcação de Talhão · ${property.name}`}
            subtitle="Vértices desenhados ou importados via Shapefile sobre a camada de satélite."
            initialCenter={initialCenter}
            polygon={property.coordinates as any}
            polygonColor="#22c55e"
            drawnVertices={drawnVertices}
            onDrawnVerticesChange={setDrawnVertices}
            height="520px"
          />
        </div>

        {/* Formulário lateral */}
        <div className={styles.sideForm}>
          <div className={styles.formCard}>
            <h2 className={styles.cardTitle}>
              <Layers size={16} style={{ color: 'var(--primary)' }} />
              Dados do Talhão
            </h2>

            <div>
              <div className={styles.formGroup}>
                <Label className={styles.label}>Nome do talhão</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Talhão da Sede"
                />
              </div>

              <div className={styles.formGroup}>
                <Label className={styles.label}>Tipo de solo</Label>
                <Select value={soilType} onValueChange={setSoilType}>
                  <SelectTrigger className={styles.selectTrigger}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {soils.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Seção de Importação de Shapefile */}
              <div className={styles.importBox}>
                <p className={styles.importTitle}>
                  <FileUp size={14} style={{ color: 'var(--primary)' }} />
                  Importar Shapefile / GeoJSON
                </p>
                <p className={styles.importDesc}>
                  Carregue um arquivo .zip contendo o shapefile (.shp, .dbf, .shx) ou arquivo .geojson.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".zip,.geojson,.json"
                  style={{ display: 'none' }}
                  onChange={handleFileImport}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  style={{ width: '100%' }}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="animate-spin" size={14} style={{ marginRight: '6px' }} />
                      Processando Geometria...
                    </>
                  ) : (
                    <>
                      <DownloadCloud size={14} style={{ marginRight: '6px' }} />
                      Selecionar Arquivo Shapefile (.zip)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Medidas Calculadas */}
          <div className={styles.formCard}>
            <p className={styles.label}>Medidas Georreferenciadas</p>
            <div className={styles.measuresGrid}>
              <div className={styles.measureBox}>
                <Ruler
                  size={16}
                  style={{ margin: '0 auto', color: 'var(--primary)' }}
                />
                <p className={styles.measureLabel}>Área Útil</p>
                <p className={styles.measureValue}>{estimatedArea}</p>
              </div>
              <div className={styles.measureBox}>
                <Spline
                  size={16}
                  style={{ margin: '0 auto', color: 'var(--primary)' }}
                />
                <p className={styles.measureLabel}>Vértices</p>
                <p className={styles.measureValue}>{estimatedPerimeter}</p>
              </div>
            </div>

            <p className={styles.infoBox}>
              <Info
                size={14}
                style={{
                  flexShrink: 0,
                  marginTop: '2px',
                  color: 'var(--primary)',
                }}
              />
              {drawnVertices.length >= 3
                ? 'Polígono demarcado na camada de satélite. Revise os dados e confirme a gravação do talhão.'
                : 'Importe um Shapefile ou clique no mapa para demarcar os vértices do talhão.'}
            </p>
          </div>

          <div className={styles.actions}>
            <Button
              variant="outline"
              type="button"
              className={styles.btnFlex}
              onClick={() => navigate(`/properties/${id}`)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className={styles.btnFlex}
              disabled={isPending || drawnVertices.length < 3}
              onClick={handleSaveField}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Salvando...
                </>
              ) : (
                <>
                  <Check size={16} style={{ marginRight: '4px' }} />
                  Salvar Talhão
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
