import { useState } from 'react';
import {
  FileText,
  FileDown,
  Plus,
  X,
  Leaf,
  Activity,
  Scale,
  BookOpen,
  Share2,
  Loader2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button/button';
import { toast } from 'sonner';

import styles from './Reports.module.css';

type ModuleId = 'balanco' | 'vigor' | 'comparativo' | 'metodologia';

interface ModuleDef {
  id: ModuleId;
  title: string;
  subtitle: string;
  icon: typeof Leaf;
}

const AVAILABLE_MODULES: Record<ModuleId, ModuleDef> = {
  balanco: {
    id: 'balanco',
    title: 'Balanço Anual de Carbono',
    subtitle: 'NEE, GPP e Reco consolidados',
    icon: Leaf,
  },
  vigor: {
    id: 'vigor',
    title: 'Histórico de Vigor (Sentinel-2A)',
    subtitle: 'Série de NDVI e reflectância',
    icon: Activity,
  },
  comparativo: {
    id: 'comparativo',
    title: 'Comparativo de Linha de Base',
    subtitle: 'Adicionalidade vs cenário convencional',
    icon: Scale,
  },
  metodologia: {
    id: 'metodologia',
    title: 'Nota Metodológica',
    subtitle: 'Eddy Covariance + ERA5 Reanalysis',
    icon: BookOpen,
  },
};

export default function ReportsPage() {
  const [activeModules, setActiveModules] = useState<ModuleId[]>([
    'balanco',
    'comparativo',
    'metodologia',
  ]);
  const [isDownloading, setIsDownloading] = useState(false);

  const addModule = (id: ModuleId) => {
    if (!activeModules.includes(id)) {
      setActiveModules((prev) => [...prev, id]);
      toast.success(`Módulo "${AVAILABLE_MODULES[id].title}" adicionado.`);
    }
  };

  const removeModule = (id: ModuleId) => {
    setActiveModules((prev) => prev.filter((m) => m !== id));
    toast.info('Módulo removido do relatório.');
  };

  const handleDownloadPdf = async () => {
    const reportElement = document.getElementById('report-sheet-document');
    if (!reportElement) return;

    setIsDownloading(true);
    const toastId = toast.loading('Gerando arquivo PDF...');

    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('Relatorio-Tecnico-Carbono-Sulflux.pdf');
      toast.success('Download do PDF concluído com sucesso!', { id: toastId });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao processar o download do PDF.', { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link do relatório copiado para a área de transferência!');
  };

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>
            <FileText size={28} style={{ color: 'var(--primary)' }} />
            Construtor de Relatórios
          </h1>
          <p className={styles.subtitle}>
            Monte laudos ambientais e relatórios técnicos de carbono
            personalizados para certificação e conformidade.
          </p>
        </div>

        <div className={styles.actions}>
          <Button variant="outline" onClick={handleShare}>
            <Share2 size={16} style={{ marginRight: '6px' }} />
            Compartilhar
          </Button>
          <Button onClick={handleDownloadPdf} disabled={isDownloading}>
            {isDownloading ? (
              <Loader2
                size={16}
                className={styles.spin}
                style={{ marginRight: '6px' }}
              />
            ) : (
              <FileDown size={16} style={{ marginRight: '6px' }} />
            )}
            {isDownloading ? 'Gerando PDF...' : 'Baixar PDF'}
          </Button>
        </div>
      </div>

      <div className={styles.builderGrid}>
        {/* Painel lateral: Paleta de Módulos */}
        <div className={styles.paletteCard}>
          <h3 className={styles.paletteTitle}>Módulos Disponíveis</h3>

          <div className={styles.paletteList}>
            {(Object.keys(AVAILABLE_MODULES) as ModuleId[]).map((key) => {
              const mod = AVAILABLE_MODULES[key];
              const isIncluded = activeModules.includes(key);

              return (
                <div key={key} className={styles.moduleItem}>
                  <div className={styles.moduleItemLeft}>
                    <div className={styles.moduleIconBox}>
                      <mod.icon size={16} />
                    </div>
                    <div className={styles.moduleInfo}>
                      <span className={styles.moduleTitle}>{mod.title}</span>
                      <span className={styles.moduleSubtitle}>
                        {mod.subtitle}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isIncluded ? 'secondary' : 'outline'}
                    disabled={isIncluded}
                    onClick={() => addModule(key)}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visualização da Folha do Relatório */}
        <div className={styles.reportSheet} id="report-sheet-document">
          <div className={styles.reportHeaderSheet}>
            <div className={styles.reportHeaderLeft}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  textTransform: 'uppercase',
                }}
              >
                Sulflux Environmental Intelligence
              </span>
              <h2 className={styles.reportMainTitle}>
                Relatório Técnico de Adicionalidade e Balanço de Carbono
              </h2>
              <p className={styles.reportMetaText}>
                Safra 2023 / 2024 · Fazenda Santa Cecília · Município: Cruz Alta
                - RS
              </p>
            </div>
            <span className={styles.reportBadge}>Certificação Oficial</span>
          </div>

          <div className={styles.reportModulesFlow}>
            {activeModules.map((modId) => {
              const mod = AVAILABLE_MODULES[modId];

              return (
                <div key={modId} className={styles.modulePreviewCard}>
                  <div className={styles.modulePreviewHeader}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <mod.icon size={18} style={{ color: 'var(--primary)' }} />
                      <h4 style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                        {mod.title}
                      </h4>
                    </div>
                    <button
                      type="button"
                      className={styles.moduleRemoveBtn}
                      data-html2canvas-ignore="true"
                      onClick={() => removeModule(modId)}
                      title="Remover módulo"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {modId === 'balanco' && (
                    <div className={styles.metricRow}>
                      <div className={styles.metricItem}>
                        <span className={styles.metricItemLabel}>
                          GPP Bruto
                        </span>
                        <span className={styles.metricItemValue}>48.7 g C</span>
                      </div>
                      <div className={styles.metricItem}>
                        <span className={styles.metricItemLabel}>
                          Respiração (Reco)
                        </span>
                        <span className={styles.metricItemValue}>34.9 g C</span>
                      </div>
                      <div className={styles.metricItem}>
                        <span className={styles.metricItemLabel}>
                          Sequestro Líquido
                        </span>
                        <span
                          className={styles.metricItemValue}
                          style={{ color: 'var(--primary)' }}
                        >
                          +13.8 t CO₂e
                        </span>
                      </div>
                    </div>
                  )}

                  {modId === 'vigor' && (
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--muted-foreground)',
                        lineHeight: 1.5,
                      }}
                    >
                      A série temporal Sentinel-2A atesta vigor vegetativo (NDVI
                      &gt; 0,72) durante 11 semanas contínuas no talhão
                      monitorado, demonstrando acumulação consistente de
                      fitomassa aérea e radicular sob plantio direto.
                    </div>
                  )}

                  {modId === 'comparativo' && (
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--muted-foreground)',
                        lineHeight: 1.5,
                      }}
                    >
                      Comparado à linha de base regional convencional
                      (revolvimento mecânico de solo), a propriedade gerou{' '}
                      <strong>+1,82 t CO₂e/ha de adicionalidade</strong>,
                      satisfazendo os critérios de elegibilidade para mercados
                      voluntários de créditos de carbono.
                    </div>
                  )}

                  {modId === 'metodologia' && (
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--muted-foreground)',
                        lineHeight: 1.5,
                      }}
                    >
                      Medições de alta frequência amostradas a 10 Hz por
                      analisador de gás infravermelho e anemômetro sônico
                      tridimensional. Particionamento de NEE em GPP e Reco
                      ajustado pela equação de Lloyd-Taylor e reanálise ERA5.
                    </div>
                  )}
                </div>
              );
            })}

            {activeModules.length === 0 && (
              <div className={styles.emptyReportNotice}>
                <p style={{ fontWeight: 600 }}>Nenhum módulo selecionado.</p>
                <p style={{ fontSize: '0.8125rem' }}>
                  Clique nos botões &quot;+&quot; do painel à esquerda para
                  montar o seu relatório.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
