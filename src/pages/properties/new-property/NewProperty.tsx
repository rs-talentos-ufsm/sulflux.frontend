import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Ruler,
  User,
  Building2,
  ImageIcon,
  Check,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { MapPlaceholder } from '@/components/utils/map-placeholder/map-placeholder';
import { UploadDialog } from '@/components/dialogs/upload-dialog/upload-dialog';
import { toast } from 'sonner';

// Importação do DTO atualizado
import { type CreatePropertyDTO } from '@lib/shared';
import { useCreateProperty } from '@/hooks/useProperty';

import styles from './NewProperty.module.css';

const covers = [
  { id: 'satelite', label: 'Satélite (padrão)' },
  { id: 'drone', label: 'Imagem de Drone' },
  { id: 'custom', label: 'Enviar foto' },
];

export default function NewPropertyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const carFromUrl = searchParams.get('car');
  const isSicar = !!carFromUrl;

  // Hook real de mutação do React Query
  const { mutateAsync: createProperty, isPending } = useCreateProperty();

  // Estados do formulário
  const [name, setName] = useState(isSicar ? 'Fazenda Santa Cecília' : '');
  const [location, setLocation] = useState(isSicar ? 'Cruz Alta, RS' : '');
  const [car, setCar] = useState(carFromUrl || '');

  const [cover, setCover] = useState('satelite');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);

  async function handleCadastrar() {
    if (!name.trim() || !location.trim()) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    const propertyData: CreatePropertyDTO = {
      name: name.trim(),
      location: location.trim(),
      car: car.trim() !== '' ? car.trim() : undefined,
    };

    try {
      await createProperty(propertyData);

      toast.success('Propriedade cadastrada com sucesso!');
      navigate('/properties');
    } catch (error) {
      toast.error('Erro ao cadastrar. Verifique os dados e tente novamente.');
    }
  }

  return (
    <div className={styles.container}>
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        onClick={() => navigate('/properties/new')}
        className={styles.backButton}
      >
        <ArrowLeft size={16} style={{ marginRight: '8px' }} />
        Voltar
      </Button>

      <div className={styles.header}>
        <h1 className={styles.title}>
          {isSicar ? 'Confirmar Dados' : 'Cadastro Manual'}
        </h1>
        <p className={styles.subtitle}>
          {isSicar
            ? 'Verifique os dados importados do SICAR, defina um nome e escolha a capa.'
            : 'Preencha os dados da sua propriedade e informe o número do CAR.'}
        </p>
      </div>

      <div className={styles.gridContainer}>
        {/* Coluna Esquerda: Formulário / Dados */}
        <div className={styles.card} style={{ marginTop: 0 }}>
          {isSicar && (
            <div className={styles.successBadge}>
              <Check size={14} />
              CAR válido e localizado
            </div>
          )}

          {/* Dados SICAR (Mock visual apenas se veio do buscar) */}
          {isSicar && (
            <dl className={styles.previewList}>
              <PreviewItem
                icon={User}
                label="Proprietário"
                value="João da Silva"
              />
              <PreviewItem
                icon={Building2}
                label="Município / UF"
                value={location}
              />
              <PreviewItem
                icon={Ruler}
                label="Área do imóvel"
                value="1.250 ha"
              />
              <PreviewItem
                icon={MapPin}
                label="Módulos fiscais"
                value="35,7 MF"
              />
            </dl>
          )}

          {/* Campos Manuais */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Nome de identificação</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Fazenda Boa Esperança"
            />
          </div>

          {!isSicar && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Município / UF</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Santa Maria, RS"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Número do CAR (Opcional)</label>
                <Input
                  value={car}
                  onChange={(e) => setCar(e.target.value)}
                  placeholder="RS-0000000-..."
                />
              </div>
            </>
          )}

          {/* Seleção de capa (UI) */}
          <div className={styles.formGroup}>
            <label
              className={styles.label}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ImageIcon size={14} />
              Imagem de capa
            </label>
            <div className={styles.coverGrid}>
              {covers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCover(c.id);
                    if (c.id === 'custom') setUploadOpen(true);
                  }}
                  className={`${styles.coverBtn} ${cover === c.id ? styles.coverBtnActive : ''}`}
                >
                  <span className={styles.coverPreviewBox}>
                    {c.id === 'custom' && customPhoto ? (
                      <img
                        src={customPhoto}
                        alt="Prévia"
                        className={styles.coverImage}
                      />
                    ) : (
                      <ImageIcon size={16} />
                    )}
                  </span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Mapa e Ações */}
        <div className={styles.rightColumn}>
          <MapPlaceholder
            outline="primary"
            label={
              cover === 'custom' && customPhoto
                ? 'Imagem de Drone Personalizada'
                : 'Geometria importada (SICAR)'
            }
            imageUrl={cover === 'custom' ? customPhoto : null}
            style={{ minHeight: '260px', flex: 1 }}
          />
          <div className={styles.actionsRow}>
            <Button
              variant="outline"
              className={styles.btnFlex}
              onClick={() => navigate(-1)}
              disabled={isPending}
            >
              <ArrowLeft size={16} style={{ marginRight: '8px' }} />
              Voltar
            </Button>
            <Button
              className={styles.btnFlex}
              onClick={handleCadastrar}
              disabled={isPending || !name || !location}
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
              {isPending ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </div>
        </div>
      </div>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        title="Enviar foto de capa"
        description="Selecione uma imagem da propriedade para usar como capa."
        accept="PNG, JPG ou WEBP até 10MB"
        hint="Escolha uma foto ou arraste aqui"
        onConfirm={(uploadedFiles) => {
          if (uploadedFiles && uploadedFiles.length > 0) {
            const file = uploadedFiles[0].file;

            // Gera uma URL local temporária para o navegador conseguir renderizar a imagem
            const previewUrl = URL.createObjectURL(file);

            setCustomPhoto(previewUrl);
            setCover('custom');
            toast.success('Foto de capa adicionada');
          }
        }}
      />
    </div>
  );
}

function PreviewItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className={styles.previewItem}>
      <span className={styles.previewIconBox}>
        <Icon size={16} />
      </span>
      <div>
        <dt className={styles.previewLabel}>{label}</dt>
        <dd className={styles.previewValue}>{value}</dd>
      </div>
    </div>
  );
}
