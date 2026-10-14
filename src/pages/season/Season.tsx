import React, { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronDown,
  MapPin,
  Ruler,
  FileCheck2,
  Hash,
  Building2,
  BadgeCheck,
  Sun,
  Leaf,
  Snowflake,
  Sprout,
  CalendarDays,
  Plus,
  Maximize2,
  X,
  Loader2,
} from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/select';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { InsumoTags } from '@/components/utils/insumo-tags/insumo-tags';

import { useProperty } from '@/hooks/useProperty';
import { useField } from '@/hooks/useField';
import { useSaveSeasonCycles } from '@/hooks/useCycle';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CycleType } from '@lib/shared';

import styles from './Season.module.css';

// --- Subcomponentes ---

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

interface PhaseProps {
  index: number;
  icon: React.ElementType;
  iconClass: string;
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
  isLast?: boolean;
  children: React.ReactNode;
}

function Phase({
  index,
  icon: Icon,
  iconClass,
  title,
  subtitle,
  defaultOpen,
  isLast,
  children,
}: PhaseProps) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div className={styles.phaseWrapper}>
      {/* Linha da timeline */}
      {!isLast && <span aria-hidden className={styles.timelineLine} />}

      {/* Nó da timeline */}
      <span className={`${styles.timelineNode} ${iconClass}`}>
        <Icon size={20} />
      </span>

      <Collapsible open={open} onOpenChange={setOpen}>
        <div className={styles.phaseCard}>
          <CollapsibleTrigger className={styles.phaseTrigger}>
            <div>
              <p className={styles.phaseIndex}>Fase {index}</p>
              <h3 className={styles.phaseTitle}>{title}</h3>
              <p className={styles.phaseSubtitle}>{subtitle}</p>
            </div>
            <ChevronDown
              size={16}
              className="transition-transform"
              style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className={styles.phaseContent}>{children}</div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}

// --- Página Principal ---
export default function SeasonConfigPage() {
  const { propertyId, fieldId } = useParams<{
    propertyId: string;
    fieldId: string;
  }>();

  // Buscando dados reais do backend
  const { data: property, isLoading: isPropertyLoading } = useProperty(
    propertyId!,
  );
  const { data: field, isLoading: isFieldLoading } = useField(fieldId!);

  const navigate = useNavigate();
  const saveSeason = useSaveSeasonCycles();

  // Fases adicionais criadas pelo usuário
  const [extraPhases, setExtraPhases] = useState<number[]>([]);
  const phaseSeq = useRef(0);

  function addPhase() {
    phaseSeq.current += 1;
    const id = phaseSeq.current;
    setExtraPhases((prev) => [...prev, id]);
  }

  function removePhase(id: number) {
    setExtraPhases((prev) => prev.filter((p) => p !== id));
  }

  const handleSave = async () => {
    if (!fieldId || !propertyId) return;

    try {
      await saveSeason.mutateAsync({
        fieldId,
        data: {
          safra: '2023 / 2024',
          cycles: [
            {
              tipo: CycleType.Commercial,
              titulo: 'Cultura Comercial — Safra Verão',
              cultura: 'Soja convencional',
              produtividade: '68 sc/ha',
              inicio: new Date('2023-10-15'),
              fim: new Date('2024-03-20'),
              inputs: [
                {
                  category: 'Fertilizante',
                  product: 'NPK 04-14-08',
                  quantity: '300 kg/ha',
                  date: new Date('2023-10-15'),
                },
                {
                  category: 'Defensivo',
                  product: 'Inoculante Bradyrhizobium',
                  quantity: '100 ml/saco',
                  date: new Date('2023-10-14'),
                },
              ],
            },
            {
              tipo: CycleType.Cover,
              titulo: 'Cobertura Vegetal — Entressafra',
              cultura: 'Aveia Preta + Nabo Forrageiro',
              inicio: new Date('2024-04-05'),
              fim: new Date('2024-09-10'),
              inputs: [
                {
                  category: 'Semente',
                  product: 'Mix Aveia + Nabo',
                  quantity: '45 kg/ha',
                  date: new Date('2024-04-05'),
                },
              ],
            },
          ],
        },
      });

      toast.success('Cronograma e fases da safra salvos com sucesso!');
      navigate(`/properties/${propertyId}/fields/${fieldId}/results`);
    } catch {
      toast.error('Erro ao salvar o cronograma da safra.');
    }
  };

  // Estados de Loading
  if (isPropertyLoading || isFieldLoading) {
    return (
      <div className={styles.centerState}>
        <Loader2 className="animate-spin" size={32} />
        <p>Carregando dados para configuração...</p>
      </div>
    );
  }

  if (!property || !field) {
    return (
      <div className={styles.centerState}>
        <p>Propriedade ou Talhão não encontrados.</p>
        <Button asChild variant="outline">
          <Link to="/properties">Voltar para propriedades</Link>
        </Button>
      </div>
    );
  }

  const metadata = [
    { icon: Hash, label: 'ID Área', value: field.code },
    {
      icon: Ruler,
      label: 'Área Útil',
      value: field.area ? `${field.area} ha` : '--',
    },
    {
      icon: FileCheck2,
      label: 'Registro CAR',
      value: property.car || 'Não informado',
    },
    { icon: Building2, label: 'Município', value: property.location },
  ];

  return (
    <div className={styles.container}>
      {/* Voltar
      <Button asChild variant="ghost" size="sm" className={styles.backButton}>
        <Link to={`/properties/${property.id}`}>
          <ArrowLeft size={16} style={{ marginRight: '8px' }} />
          Voltar para {property.name}
        </Link>
      </Button> */}

      <div className={styles.header}>
        <h1 className={styles.title}>Configurar Safra · {field.name}</h1>
        <p className={styles.subtitle}>
          <MapPin size={14} />
          {property.location} · {field.area ? `${field.area} ha` : ''}
        </p>
      </div>

      <div className={styles.gridContainer}>
        {/* Coluna Esquerda: Mapa + Metadados */}
        <div className={styles.leftColumn}>
          <h2 className={styles.sectionTitle}>Dados do Talhão</h2>

          {/* Mapa satélite */}
          <div className={styles.mapCard}>
            <div className={styles.mapArea}>
              <div aria-hidden className={styles.mapPattern} />
              <svg
                className={styles.mapPolygon}
                viewBox="0 0 100 75"
                preserveAspectRatio="none"
                aria-hidden
              >
                {/* O ideal aqui é puxar field.coordinates e desenhar */}
                <polygon
                  points="22,18 68,12 82,40 58,64 26,56 16,34"
                  fill="rgba(234,179,8,0.12)"
                  stroke="#eab308"
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                />
              </svg>
              <div className={styles.mapBadge}>Talhão {field.code}</div>
              <Button
                size="icon"
                variant="secondary"
                className={styles.mapBtn}
                aria-label="Expandir mapa"
              >
                <Maximize2 size={16} />
              </Button>
            </div>
          </div>

          {/* Metadados */}
          <div className={styles.metaCard}>
            {metadata.map((m) => (
              <div key={m.label} className={styles.metaItem}>
                <m.icon size={16} className="text-muted-foreground" />
                <span className={styles.metaLabel}>{m.label}</span>
                <span className={styles.metaValue}>{m.value}</span>
              </div>
            ))}
            <div className={styles.metaItem}>
              <BadgeCheck size={16} className="text-primary" />
              <span className={styles.metaLabel}>Status</span>
              <span className={styles.statusBadge}>Cadastro Validado</span>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Cronograma */}
        <div className={styles.rightColumn}>
          <div className={styles.timelineHeader}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              Cronograma 23/24
            </h2>
            <span className={styles.timelineBadge}>Safra 2023 / 2024</span>
          </div>

          <div className={styles.timeline}>
            {/* Fase 1 - Safra de Verão */}
            <Phase
              index={1}
              icon={Sun}
              iconClass={styles.nodeAmber}
              title="Safra de Verão"
              subtitle="Cultura principal e insumos aplicados"
              defaultOpen
            >
              <div className={styles.phaseGrid}>
                <Field label="Cultura Principal">
                  <Select defaultValue="soja">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soja">Soja</SelectItem>
                      <SelectItem value="milho">Milho</SelectItem>
                      <SelectItem value="feijao">Feijão</SelectItem>
                      <SelectItem value="arroz">Arroz</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Produtividade (sc/ha)">
                  <Input type="number" placeholder="Ex: 65" />
                </Field>
                <Field label="Data de Plantio">
                  <div className={styles.inputIconWrapper}>
                    <CalendarDays size={16} className={styles.inputIcon} />
                    <Input type="date" className={styles.inputWithIcon} />
                  </div>
                </Field>
                <Field label="Data de Colheita">
                  <div className={styles.inputIconWrapper}>
                    <CalendarDays size={16} className={styles.inputIcon} />
                    <Input type="date" className={styles.inputWithIcon} />
                  </div>
                </Field>
              </div>
              <div className={styles.tagsBox}>
                <InsumoTags
                  initial={['KCL', 'Glifosato']}
                  suggestions={['Ureia', 'MAP', 'Calcário', 'Fungicida']}
                />
              </div>
            </Phase>

            {/* Fase 2 - Entressafra Manejo */}
            <Phase
              index={2}
              icon={Leaf}
              iconClass={styles.nodePrimary}
              title="Entressafra Manejo"
              subtitle="Composição do mix de cobertura"
            >
              <div className={styles.phaseGrid}>
                <Field label="Data de Início">
                  <div className={styles.inputIconWrapper}>
                    <CalendarDays size={16} className={styles.inputIcon} />
                    <Input type="date" className={styles.inputWithIcon} />
                  </div>
                </Field>
                <Field label="Data de Término">
                  <div className={styles.inputIconWrapper}>
                    <CalendarDays size={16} className={styles.inputIcon} />
                    <Input type="date" className={styles.inputWithIcon} />
                  </div>
                </Field>
              </div>
              <div className={styles.tagsBox}>
                <InsumoTags
                  label="Composição do Mix"
                  initial={['Aveia Preta', 'Nabo Forrageiro']}
                  suggestions={['Ervilhaca', 'Centeio', 'Azevém']}
                />
              </div>
            </Phase>

            {/* Fase 3 - Cultura de Inverno */}
            <Phase
              index={3}
              icon={Snowflake}
              iconClass={styles.nodeBlue}
              title="Cultura de Inverno"
              subtitle="Cultura e produtividade da safra de inverno"
            >
              <div className={styles.phaseGrid}>
                <Field label="Cultura de Inverno">
                  <Select defaultValue="trigo">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trigo">Trigo</SelectItem>
                      <SelectItem value="cevada">Cevada</SelectItem>
                      <SelectItem value="aveia">Aveia</SelectItem>
                      <SelectItem value="canola">Canola</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Produtividade (sc/ha)">
                  <Input type="number" placeholder="Ex: 48" />
                </Field>
                <Field label="Data de Plantio">
                  <div className={styles.inputIconWrapper}>
                    <CalendarDays size={16} className={styles.inputIcon} />
                    <Input type="date" className={styles.inputWithIcon} />
                  </div>
                </Field>
                <Field label="Data de Colheita">
                  <div className={styles.inputIconWrapper}>
                    <CalendarDays size={16} className={styles.inputIcon} />
                    <Input type="date" className={styles.inputWithIcon} />
                  </div>
                </Field>
              </div>
              <div className={styles.tagsBox}>
                <InsumoTags suggestions={['Ureia', 'Fungicida', 'Herbicida']} />
              </div>
            </Phase>

            {/* Fase 4 - Entressafra */}
            <Phase
              index={4}
              icon={Sprout}
              iconClass={styles.nodeLime}
              title="Entressafra"
              subtitle="Cobertura de solo antes da próxima safra"
              isLast={extraPhases.length === 0}
            >
              <div className={styles.phaseGrid}>
                <Field label="Data de Início">
                  <div className={styles.inputIconWrapper}>
                    <CalendarDays size={16} className={styles.inputIcon} />
                    <Input type="date" className={styles.inputWithIcon} />
                  </div>
                </Field>
                <Field label="Data de Término">
                  <div className={styles.inputIconWrapper}>
                    <CalendarDays size={16} className={styles.inputIcon} />
                    <Input type="date" className={styles.inputWithIcon} />
                  </div>
                </Field>
              </div>
              <div className={styles.tagsBox}>
                <InsumoTags
                  label="Composição do Mix"
                  suggestions={['Aveia Preta', 'Nabo Forrageiro', 'Ervilhaca']}
                />
              </div>
            </Phase>

            {/* Fases Posteriores (Criadas Dinamicamente) */}
            {extraPhases.map((id, i) => (
              <Phase
                key={id}
                index={5 + i}
                icon={Sprout}
                iconClass={styles.nodeTeal}
                title="Fase Adicional"
                subtitle="Manejo complementar do cronograma"
                defaultOpen
                isLast={i === extraPhases.length - 1}
              >
                <div className={styles.phaseGrid}>
                  <Field label="Descrição da Fase">
                    <Input placeholder="Ex: Pousio de recuperação" />
                  </Field>
                  <Field label="Cultura / Cobertura">
                    <Input placeholder="Ex: Braquiária" />
                  </Field>
                  <Field label="Data de Início">
                    <div className={styles.inputIconWrapper}>
                      <CalendarDays size={16} className={styles.inputIcon} />
                      <Input type="date" className={styles.inputWithIcon} />
                    </div>
                  </Field>
                  <Field label="Data de Término">
                    <div className={styles.inputIconWrapper}>
                      <CalendarDays size={16} className={styles.inputIcon} />
                      <Input type="date" className={styles.inputWithIcon} />
                    </div>
                  </Field>
                </div>
                <div className={styles.tagsBox}>
                  <InsumoTags
                    label="Composição do Mix"
                    suggestions={[
                      'Aveia Preta',
                      'Nabo Forrageiro',
                      'Ervilhaca',
                    ]}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removePhase(id)}
                  >
                    <X size={16} style={{ marginRight: '6px' }} />
                    Remover fase
                  </Button>
                </div>
              </Phase>
            ))}

            {/* Adicionar Nova Fase */}
            <div className={styles.phaseWrapper} style={{ paddingBottom: 0 }}>
              <span className={`${styles.timelineNode} ${styles.nodeDashed}`}>
                <Plus size={20} />
              </span>
              <Button
                variant="outline"
                className="w-full"
                style={{ borderStyle: 'dashed' }}
                onClick={addPhase}
              >
                <Plus size={16} style={{ marginRight: '8px' }} />
                Adicionar Fase Posterior
              </Button>
            </div>

            {/* Ações Finais */}
            <div className={styles.btnActions}>
              <Button variant="ghost" asChild>
                <Link to={`/properties/${property.id}`}>Cancelar</Link>
              </Button>
              <Button onClick={handleSave} disabled={saveSeason.isPending}>
                {saveSeason.isPending && (
                  <Loader2
                    className="animate-spin"
                    size={16}
                    style={{ marginRight: '6px' }}
                  />
                )}
                Salvar Cronograma
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
