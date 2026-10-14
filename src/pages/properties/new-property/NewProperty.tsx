import { useState, useEffect, useMemo } from 'react';
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
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { MapPlaceholder } from '@/components/utils/map-placeholder/map-placeholder';
import { UploadDialog } from '@/components/dialogs/upload-dialog/upload-dialog';
import { toast } from 'sonner';

import { type CreatePropertyDTO } from '@lib/shared';
import { useCreateProperty, useCarLookup } from '@/hooks/useProperty';

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

  // Consulta dados reais do CAR através do React Query
  const {
    data: carData,
    isLoading: isLoadingCar,
    isError: isErrorCar,
    error: carError,
  } = useCarLookup(carFromUrl, isSicar);

  // Hook real de mutação do React Query
  const { mutateAsync: createProperty, isPending: isSaving } =
    useCreateProperty();

  // Estados do formulário
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [car, setCar] = useState(carFromUrl || '');

  const [cover, setCover] = useState('satelite');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);

  // Sincroniza campos quando os dados do CAR chegam do backend
  useEffect(() => {
    if (carData) {
      setName(carData.name);
      setLocation(carData.location);
      setCar(carData.car);
    }
  }, [carData]);

  // Transforma as coordenadas reais do CAR em pontos SVG para o preview visual
  const svgPolygonPoints = useMemo(() => {
    const coords = carData?.coordinates;
    if (!coords || coords.length < 3) return undefined;

    const lats = coords.map((c) => c.lat);
    const lngs = coords.map((c) => c.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latSpan = maxLat - minLat || 0.001;
    const lngSpan = maxLng - minLng || 0.001;

    const width = 360;
    const height = 260;
    const padding = 30;

    return coords
      .map((c) => {
        const x = Math.round(
          padding + ((c.lng - minLng) / lngSpan) * (width - 2 * padding),
        );
        const y = Math.round(
          padding + ((maxLat - c.lat) / latSpan) * (height - 2 * padding),
        );
        return `${x},${y}`;
      })
      .join(' ');
  }, [carData?.coordinates]);

  async function handleCadastrar() {
    if (!name.trim() || !location.trim()) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    const propertyData: CreatePropertyDTO = {
      name: name.trim(),
      location: location.trim(),
      car: car.trim() !== '' ? car.trim().toUpperCase() : undefined,
      area: carData?.area,
      fiscalModules: carData?.fiscalModules,
      ownerName: carData?.ownerName || undefined,
      coordinates: carData?.coordinates,
    };

    try {
      const createdProperty = await createProperty(propertyData);

      toast.success('Propriedade cadastrada com sucesso!');
      navigate(`/properties/${createdProperty.id}`);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error(
          error.response.data?.detail ||
            'Já existe uma propriedade cadastrada com este número de CAR.',
        );
      } else {
        toast.error('Erro ao cadastrar. Verifique os dados e tente novamente.');
      }
    }
  }

  if (isSicar && isLoadingCar) {
    return (
      <div className={styles.container}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            gap: '12px',
          }}
        >
          <Loader2 size={32} className="animate-spin" color="var(--primary)" />
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.95rem' }}>
            Carregando dados oficiais do SICAR...
          </p>
        </div>
      </div>
    );
  }

  if (isSicar && isErrorCar) {
    return (
      <div className={styles.container}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <AlertCircle size={40} color="var(--destructive)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            Não foi possível carregar os dados deste CAR
          </h2>
          <p
            style={{
              color: 'var(--muted-foreground)',
              maxWidth: '480px',
              fontSize: '0.875rem',
            }}
          >
            {(carError as any)?.response?.data?.detail ||
              'O CAR informado não foi encontrado ou já está cadastrado em outra conta.'}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="outline"
              onClick={() => navigate('/properties/new')}
            >
              Buscar outro CAR
            </Button>
            <Button onClick={() => navigate('/properties/new/details')}>
              Cadastrar manualmente
            </Button>
          </div>
        </div>
      </div>
    );
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
          {isSicar ? 'Confirmar Dados do Imóvel' : 'Cadastro Manual'}
        </h1>
        <p className={styles.subtitle}>
          {isSicar
            ? 'Verifique os dados importados do SICAR, defina um nome e escolha a imagem de capa.'
            : 'Preencha os dados da sua propriedade e informe o número do CAR.'}
        </p>
      </div>

      <div className={styles.gridContainer}>
        {/* Coluna Esquerda: Formulário / Dados */}
        <div className={styles.card} style={{ marginTop: 0 }}>
          {isSicar && carData && (
            <div className={styles.successBadge}>
              <Check size={14} />
              CAR válido e localizado: {carData.car}
            </div>
          )}

          {/* Dados SICAR reais vindos do endpoint */}
          {isSicar && carData && (
            <dl className={styles.previewList}>
              <PreviewItem
                icon={User}
                label="Proprietário / Declarante"
                value={carData.ownerName || 'Não declarado'}
              />
              <PreviewItem
                icon={Building2}
                label="Município / UF"
                value={carData.location}
              />
              <PreviewItem
                icon={Ruler}
                label="Área do imóvel"
                value={`${carData.area.toLocaleString('pt-BR')} ha`}
              />
              <PreviewItem
                icon={MapPin}
                label="Módulos fiscais"
                value={`${carData.fiscalModules} MF`}
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
                  placeholder="RS-4305108-8C646BEA3C084EEBA1C765BB8E09FA83"
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
                : isSicar
                  ? `Perímetro do imóvel (${carData?.area?.toLocaleString('pt-BR') || '--'} ha)`
                  : 'Visualização de Satélite'
            }
            imageUrl={cover === 'custom' ? customPhoto : null}
            polygonPoints={svgPolygonPoints}
            style={{ minHeight: '260px', flex: 1 }}
          />
          <div className={styles.actionsRow}>
            <Button
              variant="outline"
              className={styles.btnFlex}
              onClick={() => navigate(-1)}
              disabled={isSaving}
            >
              <ArrowLeft size={16} style={{ marginRight: '8px' }} />
              Voltar
            </Button>
            <Button
              className={styles.btnFlex}
              onClick={handleCadastrar}
              disabled={isSaving || !name.trim() || !location.trim()}
            >
              {isSaving ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                  style={{ marginRight: '8px' }}
                />
              ) : (
                <Check size={16} style={{ marginRight: '8px' }} />
              )}
              {isSaving ? 'Cadastrando...' : 'Cadastrar'}
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
