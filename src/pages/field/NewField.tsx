import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Pencil,
  Undo2,
  Trash2,
  Ruler,
  Spline,
  MousePointerClick,
  Check,
  Info,
  Layers,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';
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

// Vértices do polígono desenhado (coordenadas no viewBox 0 0 400 300)
const drawnPoints = [
  { x: 90, y: 70 },
  { x: 300, y: 55 },
  { x: 345, y: 160 },
  { x: 250, y: 245 },
  { x: 105, y: 215 },
];

export default function NewFieldPage() {
  const { id } = useParams<{ id: string }>();
  console.log('propertyId', id);
  const navigate = useNavigate();

  // Hooks da API
  const { data: property, isLoading: isPropertyLoading } = useProperty(id!);
  const { mutateAsync: createField, isPending } = useCreateField();

  // Estados locais
  const [drawing, setDrawing] = useState(false);
  const [vertices, setVertices] = useState(0);

  const [name, setName] = useState('');
  const [soilType, setSoilType] = useState(soils[0]);

  // Lógica de simulação de desenho
  const done = vertices >= drawnPoints.length;
  const visible = drawnPoints.slice(0, vertices);
  const polyPoints = visible.map((p) => `${p.x},${p.y}`).join(' ');

  function addVertex() {
    if (!drawing) setDrawing(true);
    setVertices((v) => Math.min(v + 1, drawnPoints.length));
  }

  function reset() {
    setVertices(0);
    setDrawing(false);
  }

  async function handleSaveField() {
    if (!name.trim()) {
      toast.error('Por favor, preencha o nome do talhão.');
      return;
    }
    if (visible.length < 3) {
      toast.error('O talhão precisa ter pelo menos 3 vértices.');
      return;
    }

    const fieldData: CreateFieldDTO = {
      name: name.trim(),
      soilType: soilType,
      propertyId: id!,
      coordinates: visible, // Envia as coordenadas para o backend calcular a área e perímetro
    };

    try {
      await createField(fieldData);
      toast.success('Talhão criado com sucesso!');
      navigate(`/properties/${id}`);
    } catch (error) {
      toast.error('Erro ao salvar o talhão. Tente novamente.');
    }
  }

  // Medidas estimadas apenas para visualização no front (Backend calcula o valor oficial real)
  const estimatedArea = done
    ? '112 ha'
    : vertices > 0
      ? `${vertices * 22} ha`
      : '—';
  const estimatedPerimeter = done
    ? '4,05 km'
    : vertices > 0
      ? `${(vertices * 0.8).toFixed(2)} km`
      : '—';

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
          Delimite a área do talhão diretamente sobre o mapa de satélite. O
          código, a área e o perímetro serão gerados automaticamente ao salvar.
        </p>
      </div>

      <div className={styles.gridContainer}>
        {/* Mapa de desenho */}
        <div className={styles.mapCard}>
          {/* Barra de ferramentas */}
          <div className={styles.mapToolbar}>
            <Button
              size="sm"
              variant={drawing ? 'default' : 'secondary'}
              onClick={() => setDrawing(true)}
            >
              <Pencil size={16} style={{ marginRight: '6px' }} />
              Desenhar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setVertices((v) => Math.max(v - 1, 0))}
              disabled={vertices === 0}
            >
              <Undo2 size={16} style={{ marginRight: '6px' }} />
              Desfazer
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={reset}
              disabled={vertices === 0}
            >
              <Trash2 size={16} style={{ marginRight: '6px' }} />
              Limpar
            </Button>
            <span className={styles.vertexCount}>
              <MousePointerClick size={14} />
              {vertices} vértice(s)
            </span>
          </div>

          {/* Área do mapa */}
          <button
            type="button"
            onClick={addVertex}
            aria-label="Adicionar vértice ao talhão"
            className={styles.mapArea}
          >
            <span aria-hidden className={styles.mapGradient} />
            <span aria-hidden className={styles.mapGrid} />

            <svg
              className={styles.svgOverlay}
              viewBox="0 0 400 300"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden
            >
              {visible.length >= 2 && (
                <polygon
                  points={polyPoints}
                  fill="hsl(var(--primary))"
                  fillOpacity={done ? 0.18 : 0.1}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.5"
                  strokeDasharray={done ? undefined : '8 5'}
                />
              )}
              {visible.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill="hsl(var(--primary))"
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
            </svg>

            {vertices === 0 && (
              <span className={styles.mapHint}>
                <MousePointerClick
                  size={16}
                  style={{ color: 'var(--primary)' }}
                />
                Clique no mapa para marcar os vértices
              </span>
            )}
          </button>
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
              {done
                ? 'Polígono fechado. Revise os dados e salve o talhão. O backend irá calcular a área exata.'
                : 'Continue marcando vértices até fechar o contorno da área.'}
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
              disabled={!done || isPending}
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
