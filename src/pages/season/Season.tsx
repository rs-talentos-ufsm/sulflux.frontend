import React, { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
  CalendarDays,
  Plus,
  Trash2,
  Maximize2,
  Loader2,
  Layers,
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

import { useProperty } from '@/hooks/useProperty';
import { useField } from '@/hooks/useField';
import { useSaveSeasonCycles } from '@/hooks/useCycle';
import { toast } from 'sonner';
import {
  CycleType,
  ApplicationCategory,
  ApplicationUnit,
  type CreateFieldInputDTO,
} from '@lib/shared';

import styles from './Season.module.css';

interface ApplicationItem extends CreateFieldInputDTO {
  id: string;
}

interface PhaseState {
  id: string;
  tipo: (typeof CycleType)[keyof typeof CycleType];
  titulo: string;
  cultura: string;
  produtividade: string;
  inicio: string;
  fim: string;
  inputs: ApplicationItem[];
}

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

export default function SeasonConfigPage() {
  const { propertyId, fieldId } = useParams<{
    propertyId: string;
    fieldId: string;
  }>();

  const { data: property, isLoading: isPropertyLoading } = useProperty(
    propertyId!,
  );
  const { data: field, isLoading: isFieldLoading } = useField(fieldId!);

  const navigate = useNavigate();
  const saveSeason = useSaveSeasonCycles();

  const [safraName, setSafraName] = useState('2024 / 2025');

  // Fases dinâmicas com estado inicial
  const [phases, setPhases] = useState<PhaseState[]>([
    {
      id: 'phase-1',
      tipo: CycleType.Commercial,
      titulo: 'Safra Principal de Verão',
      cultura: 'Soja',
      produtividade: '68 sc/ha',
      inicio: '2024-10-15',
      fim: '2025-03-20',
      inputs: [
        {
          id: 'inp-1',
          product: 'NPK 04-14-08',
          category: ApplicationCategory.Fertilizer,
          date: new Date('2024-10-15'),
          quantity: 300,
          unit: ApplicationUnit.KgHa,
          notes: 'Adubação de base',
        },
        {
          id: 'inp-2',
          product: 'Inoculante Bradyrhizobium',
          category: ApplicationCategory.Inoculant,
          date: new Date('2024-10-14'),
          quantity: 100,
          unit: ApplicationUnit.MlHa,
          notes: 'Tratamento de sementes',
        },
      ],
    },
    {
      id: 'phase-2',
      tipo: CycleType.Cover,
      titulo: 'Cobertura Vegetal — Entressafra',
      cultura: 'Aveia Preta + Nabo Forrageiro',
      produtividade: 'Massa seca',
      inicio: '2025-03-10', // Data com sobreposição proposital
      fim: '2025-09-15',
      inputs: [
        {
          id: 'inp-3',
          product: 'Mix Aveia + Nabo',
          category: ApplicationCategory.Seed,
          date: new Date('2025-03-10'),
          quantity: 45,
          unit: ApplicationUnit.KgHa,
          notes: 'Semeadura a lanço',
        },
      ],
    },
  ]);

  // A data de início da safra e de cada fase ajusta a sequência cronológica automaticamente
  const sortedPhases = useMemo(() => {
    return [...phases].sort((a, b) => {
      if (!a.inicio) return 1;
      if (!b.inicio) return -1;
      return new Date(a.inicio).getTime() - new Date(b.inicio).getTime();
    });
  }, [phases]);

  // Detecção de sobreposição de períodos entre fases
  const hasOverlap = useMemo(() => {
    for (let i = 1; i < sortedPhases.length; i++) {
      const prevFim = new Date(sortedPhases[i - 1].fim).getTime();
      const currInicio = new Date(sortedPhases[i].inicio).getTime();
      if (currInicio < prevFim) {
        return true;
      }
    }
    return false;
  }, [sortedPhases]);

  const updatePhaseField = (
    id: string,
    fieldKey: keyof PhaseState,
    value: any,
  ) => {
    setPhases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [fieldKey]: value } : p)),
    );
  };

  const addApplication = (phaseId: string) => {
    const newApp: ApplicationItem = {
      id: 'app-' + Date.now(),
      product: '',
      category: ApplicationCategory.Fertilizer,
      date: new Date(),
      quantity: 100,
      unit: ApplicationUnit.KgHa,
      notes: '',
    };

    setPhases((prev) =>
      prev.map((p) => {
        if (p.id !== phaseId) return p;
        return {
          ...p,
          inputs: [...p.inputs, newApp],
        };
      }),
    );
  };

  const updateApplication = (
    phaseId: string,
    appId: string,
    fieldKey: keyof ApplicationItem,
    value: any,
  ) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id !== phaseId) return p;
        return {
          ...p,
          inputs: p.inputs.map((inp) =>
            inp.id === appId ? { ...inp, [fieldKey]: value } : inp,
          ),
        };
      }),
    );
  };

  const removeApplication = (phaseId: string, appId: string) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id !== phaseId) return p;
        return {
          ...p,
          inputs: p.inputs.filter((inp) => inp.id !== appId),
        };
      }),
    );
  };

  const addPhase = () => {
    const newPhase: PhaseState = {
      id: 'phase-' + Date.now(),
      tipo: CycleType.Cover,
      titulo: `Nova Fase / Ciclo ${phases.length + 1}`,
      cultura: '',
      produtividade: '',
      inicio: new Date().toISOString().split('T')[0],
      fim: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      inputs: [],
    };
    setPhases((prev) => [...prev, newPhase]);
  };

  const removePhase = (id: string) => {
    if (phases.length <= 1) {
      toast.warning('A safra deve conter pelo menos uma fase/ciclo.');
      return;
    }
    setPhases((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    if (!fieldId || !propertyId) return;

    if (!safraName.trim()) {
      toast.error('Informe o nome da safra.');
      return;
    }

    try {
      await saveSeason.mutateAsync({
        fieldId,
        data: {
          safra: safraName.trim(),
          permiteSobreposicao: true,
          cycles: sortedPhases.map((p, idx) => ({
            tipo: p.tipo,
            titulo: p.titulo || `Fase ${idx + 1}`,
            cultura: p.cultura || undefined,
            produtividade: p.produtividade || undefined,
            sequencia: idx + 1,
            inicio: new Date(p.inicio),
            fim: new Date(p.fim),
            inputs: p.inputs.map((inp) => ({
              product: inp.product || 'Insumo agrícola',
              category: inp.category || ApplicationCategory.Fertilizer,
              date: new Date(inp.date),
              quantity: Number(inp.quantity) || 1,
              unit: inp.unit || ApplicationUnit.KgHa,
              notes: inp.notes || undefined,
            })),
          })),
        },
      });

      toast.success('Cronograma e aplicações da safra salvos com sucesso!');
      navigate(`/properties/${propertyId}/fields/${fieldId}/results`);
    } catch {
      toast.error('Erro ao salvar o cronograma da safra.');
    }
  };

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
      <div className={styles.header}>
        <h1 className={styles.title}>Configurar Safra · {field.name}</h1>
        <p className={styles.subtitle}>
          <MapPin size={14} />
          {property.location} · {field.area ? `${field.area} ha` : ''}
        </p>
      </div>

      <div className={styles.gridContainer}>
        {/* Coluna Esquerda: Dados do Talhão */}
        <div className={styles.leftColumn}>
          <h2 className={styles.sectionTitle}>Dados do Talhão</h2>

          <div className={styles.mapCard}>
            <div className={styles.mapArea}>
              <div aria-hidden className={styles.mapPattern} />
              <svg
                className={styles.mapPolygon}
                viewBox="0 0 100 75"
                preserveAspectRatio="none"
                aria-hidden
              >
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

        {/* Coluna Direita: Cronograma de Safras e Aplicações */}
        <div className={styles.rightColumn}>
          <div className={styles.timelineHeader}>
            <div>
              <h2 className={styles.sectionTitle} style={{ marginBottom: 4 }}>
                Cronograma de Safras & Aplicações
              </h2>
              <span style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                A data de início ajusta a sequência temporal. Sobreposição de safras é permitida.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={styles.timelineBadge}>Safra:</span>
              <Input
                value={safraName}
                onChange={(e) => setSafraName(e.target.value)}
                style={{ width: '130px', height: '32px' }}
              />
            </div>
          </div>

          {/* Banner de Sobreposição Ativa */}
          {hasOverlap && (
            <div className={styles.overlapBanner}>
              <Layers size={16} />
              <span>
                Sobreposição temporal ativa: períodos concomitantes permitidos entre as fases.
              </span>
            </div>
          )}

          <div className={styles.timeline}>
            {sortedPhases.map((phase, index) => {
              const isLast = index === sortedPhases.length - 1;
              const PhaseIcon = phase.tipo === CycleType.Commercial ? Sun : Leaf;
              const nodeClass =
                phase.tipo === CycleType.Commercial
                  ? styles.nodeAmber
                  : styles.nodePrimary;

              return (
                <div key={phase.id} className={styles.phaseWrapper}>
                  {!isLast && <span aria-hidden className={styles.timelineLine} />}

                  <span className={`${styles.timelineNode} ${nodeClass}`}>
                    <PhaseIcon size={20} />
                  </span>

                  <Collapsible defaultOpen={true}>
                    <div className={styles.phaseCard}>
                      <CollapsibleTrigger className={styles.phaseTrigger}>
                        <div>
                          <p className={styles.phaseIndex}>Sequência {index + 1}</p>
                          <h3 className={styles.phaseTitle}>{phase.titulo}</h3>
                          <p className={styles.phaseSubtitle}>
                            Início: {phase.inicio} · Término: {phase.fim}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePhase(phase.id);
                            }}
                            title="Remover fase"
                          >
                            <Trash2 size={16} />
                          </Button>
                          <ChevronDown size={16} />
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className={styles.phaseContent}>
                          {/* Configurações básicas da fase */}
                          <div className={styles.phaseGrid}>
                            <Field label="Título da Fase">
                              <Input
                                value={phase.titulo}
                                onChange={(e) =>
                                  updatePhaseField(phase.id, 'titulo', e.target.value)
                                }
                              />
                            </Field>

                            <Field label="Tipo de Ciclo">
                              <Select
                                value={phase.tipo}
                                onValueChange={(val: any) =>
                                  updatePhaseField(phase.id, 'tipo', val)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={CycleType.Commercial}>
                                    Comercial (Safra Principal)
                                  </SelectItem>
                                  <SelectItem value={CycleType.Cover}>
                                    Cobertura / Entressafra
                                  </SelectItem>
                                  <SelectItem value={CycleType.Fallow}>
                                    Pousio / Repouso
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>

                            <Field label="Cultura / Mix">
                              <Input
                                value={phase.cultura}
                                placeholder="Ex: Soja, Milho, Aveia..."
                                onChange={(e) =>
                                  updatePhaseField(phase.id, 'cultura', e.target.value)
                                }
                              />
                            </Field>

                            <Field label="Produtividade Estimada">
                              <Input
                                value={phase.produtividade}
                                placeholder="Ex: 68 sc/ha"
                                onChange={(e) =>
                                  updatePhaseField(
                                    phase.id,
                                    'produtividade',
                                    e.target.value,
                                  )
                                }
                              />
                            </Field>

                            {/* Data de Início: Ajusta a sequência da safra */}
                            <Field label="Data de Início (Ajusta a Sequência)">
                              <div className={styles.inputIconWrapper}>
                                <CalendarDays size={16} className={styles.inputIcon} />
                                <Input
                                  type="date"
                                  className={styles.inputWithIcon}
                                  value={phase.inicio}
                                  onChange={(e) =>
                                    updatePhaseField(
                                      phase.id,
                                      'inicio',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </Field>

                            {/* Data de Término */}
                            <Field label="Data de Término">
                              <div className={styles.inputIconWrapper}>
                                <CalendarDays size={16} className={styles.inputIcon} />
                                <Input
                                  type="date"
                                  className={styles.inputWithIcon}
                                  value={phase.fim}
                                  onChange={(e) =>
                                    updatePhaseField(phase.id, 'fim', e.target.value)
                                  }
                                />
                              </div>
                            </Field>
                          </div>

                          {/* Seção Granular de Aplicações de Insumos */}
                          <div className={styles.applicationsSection}>
                            <div className={styles.applicationsHeader}>
                              <h4 className={styles.applicationsTitle}>
                                Aplicações de Insumos da Fase
                              </h4>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addApplication(phase.id)}
                              >
                                <Plus size={14} style={{ marginRight: '4px' }} />
                                Nova Aplicação
                              </Button>
                            </div>

                            {phase.inputs.length === 0 ? (
                              <p className={styles.emptyApplications}>
                                Nenhuma aplicação registrada nesta fase. Clique em "Nova Aplicação".
                              </p>
                            ) : (
                              phase.inputs.map((app) => (
                                <div key={app.id} className={styles.appRow}>
                                  <div>
                                    <label className={styles.fieldLabel}>
                                      O que foi colocado
                                    </label>
                                    <Input
                                      placeholder="Ex: Ureia 46%, Glifosato..."
                                      value={app.product}
                                      onChange={(e) =>
                                        updateApplication(
                                          phase.id,
                                          app.id,
                                          'product',
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>

                                  <div>
                                    <label className={styles.fieldLabel}>
                                      Categoria
                                    </label>
                                    <Select
                                      value={app.category}
                                      onValueChange={(val: any) =>
                                        updateApplication(
                                          phase.id,
                                          app.id,
                                          'category',
                                          val,
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value={ApplicationCategory.Fertilizer}>
                                          Fertilizante
                                        </SelectItem>
                                        <SelectItem value={ApplicationCategory.Defensive}>
                                          Defensivo
                                        </SelectItem>
                                        <SelectItem value={ApplicationCategory.Seed}>
                                          Semente
                                        </SelectItem>
                                        <SelectItem value={ApplicationCategory.Inoculant}>
                                          Inoculante
                                        </SelectItem>
                                        <SelectItem value={ApplicationCategory.Corrective}>
                                          Corretivo / Calcário
                                        </SelectItem>
                                        <SelectItem value={ApplicationCategory.Biological}>
                                          Biológico
                                        </SelectItem>
                                        <SelectItem value={ApplicationCategory.Other}>
                                          Outro
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <label className={styles.fieldLabel}>Dia</label>
                                    <Input
                                      type="date"
                                      value={
                                        app.date instanceof Date
                                          ? app.date.toISOString().split('T')[0]
                                          : String(app.date).split('T')[0]
                                      }
                                      onChange={(e) =>
                                        updateApplication(
                                          phase.id,
                                          app.id,
                                          'date',
                                          new Date(e.target.value),
                                        )
                                      }
                                    />
                                  </div>

                                  <div>
                                    <label className={styles.fieldLabel}>
                                      Quantidade
                                    </label>
                                    <Input
                                      type="number"
                                      step="any"
                                      placeholder="Ex: 150"
                                      value={app.quantity}
                                      onChange={(e) =>
                                        updateApplication(
                                          phase.id,
                                          app.id,
                                          'quantity',
                                          parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </div>

                                  <div>
                                    <label className={styles.fieldLabel}>
                                      Métrica
                                    </label>
                                    <Select
                                      value={app.unit}
                                      onValueChange={(val: any) =>
                                        updateApplication(
                                          phase.id,
                                          app.id,
                                          'unit',
                                          val,
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value={ApplicationUnit.KgHa}>
                                          kg/ha
                                        </SelectItem>
                                        <SelectItem value={ApplicationUnit.LHa}>
                                          l/ha
                                        </SelectItem>
                                        <SelectItem value={ApplicationUnit.GHa}>
                                          g/ha
                                        </SelectItem>
                                        <SelectItem value={ApplicationUnit.DoseHa}>
                                          dose/ha
                                        </SelectItem>
                                        <SelectItem value={ApplicationUnit.TonHa}>
                                          ton/ha
                                        </SelectItem>
                                        <SelectItem value={ApplicationUnit.ScHa}>
                                          sc/ha
                                        </SelectItem>
                                        <SelectItem value={ApplicationUnit.MlHa}>
                                          ml/ha
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div style={{ paddingTop: '18px' }}>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        removeApplication(phase.id, app.id)
                                      }
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <Button type="button" variant="outline" onClick={addPhase}>
              <Plus size={16} style={{ marginRight: '6px' }} />
              Adicionar Nova Fase na Safra
            </Button>
          </div>

          <div className={styles.btnActions}>
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate(`/properties/${propertyId}`)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saveSeason.isPending}
            >
              {saveSeason.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Salvando Cronograma...
                </>
              ) : (
                'Salvar Configurações da Safra'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
