import { useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Ruler, Spline, Check, Info, Layers, Loader2 } from 'lucide-react';

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

import { useProperty } from '@/hooks/useProperty';
import { useCreateField } from '@/hooks/useField';
import type { CreateFieldDTO } from '@lib/shared';

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

  const initialCenter = useMemo<[number, number] | undefined>(() => {
    if (
      property?.coordinates &&
      Array.isArray(property.coordinates) &&
      property.coordinates.length > 0
    ) {
      const first = property.coordinates[0];
      return [first.lng, first.lat];
    }
    return undefined;
  }, [property?.coordinates]);

  const calculatedAreaHa = useMemo(
    () => calculateAreaHa(drawnVertices),
    [drawnVertices],
  );

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
    } catch (error) {
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
        <h1 className={styles.title}>Desenhar Novo Talhão</h1>
        <p className={styles.subtitle}>
          Delimite a área do talhão diretamente sobre a imagem de satélite da
          propriedade <strong>{property.name}</strong>. A área e o perímetro são
          calculados automaticamente.
        </p>
      </div>

      <div className={styles.gridContainer}>
        {/* Mapa interativo de satélite com desenho de talhão */}
        <div style={{ flex: 1, minWidth: '320px' }}>
          <PropertyMap
            mode="draw-polygon"
            title={`Demarcação de Talhão · ${property.name}`}
            subtitle="Clique no mapa de satélite para adicionar os vértices do perímetro do talhão."
            initialCenter={initialCenter}
            polygon={property.coordinates as any}
            polygonColor="#22c55e"
            drawnVertices={drawnVertices}
            onDrawnVerticesChange={setDrawnVertices}
            height="500px"
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

              {/* O campo de Código foi removido (Gerado pelo Backend) */}

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
            </div>
          </div>

          {/* Medidas (Estimadas) */}
          <div className={styles.formCard}>
            <p className={styles.label}>Medidas (Estimativa)</p>
            <div className={styles.measuresGrid}>
              <div className={styles.measureBox}>
                <Ruler
                  size={16}
                  style={{ margin: '0 auto', color: 'var(--primary)' }}
                />
                <p className={styles.measureLabel}>Área</p>
                <p className={styles.measureValue}>{estimatedArea}</p>
              </div>
              <div className={styles.measureBox}>
                <Spline
                  size={16}
                  style={{ margin: '0 auto', color: 'var(--primary)' }}
                />
                <p className={styles.measureLabel}>Perímetro</p>
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
                ? 'Polígono demarcado. Revise os dados e salve o talhão. O backend irá calcular a área e perímetro oficiais.'
                : 'Clique no mapa para marcar pelo menos 3 vértices delimitando o talhão.'}
            </p>
          </div>

          <div className={styles.actions}>
            <Button
              variant="outline"
              className={styles.btnFlex}
              asChild
              disabled={isPending}
            >
              <Link to={`/properties/${id}`}>Cancelar</Link>
            </Button>
            <Button
              className={styles.btnFlex}
              disabled={drawnVertices.length < 3 || isPending}
              onClick={handleSaveField}
            >
              {isPending ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                  style={{ marginRight: '8px' }}
                />
              ) : (
                <Check size={16} style={{ marginRight: '8px' }} />
              )}
              {isPending ? 'Salvando...' : 'Salvar Talhão'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
