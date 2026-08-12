import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  MapPin,
  Ruler,
  Layers,
  User,
  Plus,
  History,
  Map as MapIcon,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button/button';
import { MapPlaceholder } from '@/components/utils/map-placeholder/map-placeholder';
// import { TalhaoCard } from "./talhao-card" // Assumindo que este componente existe e foi migrado

// Hooks da API
import { useProperty } from '@/hooks/useProperty';
import { PropertyStatus } from '@lib/shared';
// import { useTalhoes } from "@/hooks/useTalhoes" // TODO: Descomentar quando existir

import styles from './Property.module.css';

export default function PropertyPage() {
  // Captura o ID da URL
  const { id } = useParams<{ id: string }>();
  console.log('Property ID from URL:', id); // Para depuração

  // 1. Busca os dados reais da propriedade
  const { data: property, isLoading, isError } = useProperty(id!);

  // 2. TODO: Busca os talhões atrelados a esta propriedade
  // const { data: talhoesData, isLoading: isLoadingTalhoes } = useTalhoes({ propertyId: id })

  // Mock temporário enquanto o useTalhoes não existe
  const mockTalhoes: any[] = []; // Substitua por talhoesData?.data || [] futuramente
  const counts = {
    total: mockTalhoes.length,
    pronto: mockTalhoes.filter((t) => t.status === 'pronto').length,
    processando: mockTalhoes.filter((t) => t.status === 'processando').length,
    aguardando: mockTalhoes.filter((t) => t.status === 'aguardando').length,
  };

  // Estados de carregamento e erro
  if (isLoading) {
    return (
      <div className={styles.centerState}>
        <Loader2 className="animate-spin" size={32} />
        <p>Carregando propriedade...</p>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className={styles.centerState}>
        <p>Erro ao carregar os dados da propriedade.</p>
        <Button asChild variant="outline">
          <Link to="/properties">Voltar para propriedades</Link>
        </Button>
      </div>
    );
  }

  const isAtiva = property.status === PropertyStatus.Active;

  return (
    <div className={styles.container}>
      {/* Cabeçalho da propriedade */}
      <div className={styles.headerGrid}>
        <div className={styles.infoCard}>
          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{property.name}</h1>
              <span
                className={`${styles.statusBadge} ${isAtiva ? styles.statusAtiva : styles.statusConfigurar}`}
              >
                {isAtiva ? 'Ativa' : 'A configurar'}
              </span>
            </div>

            <p className={styles.carText}>
              CAR: {property.car || 'Não informado'}
            </p>

            <dl className={styles.dlGrid}>
              <InfoItem
                icon={MapPin}
                label="Localização"
                value={property.location}
              />
              <InfoItem
                icon={Ruler}
                label="Área Total"
                value={/* property.area || */ '-- ha'}
              />
              <InfoItem
                icon={Layers}
                label="Talhões"
                value={String(counts.total)}
              />
              <InfoItem
                icon={User}
                label="Proprietário"
                value={property.owner.name || '--'}
              />
            </dl>
          </div>

          <div className={styles.actionButtons}>
            <Button asChild>
              <Link to={`/properties/${property.id}/fields/new`}>
                <Plus size={16} style={{ marginRight: '8px' }} />
                Novo Talhão
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/properties/${property.id}/monitoring`}>
                <History size={16} style={{ marginRight: '8px' }} />
                Histórico de Monitoramento
              </Link>
            </Button>
          </div>
        </div>

        {/* Mapa da propriedade */}
        <MapPlaceholder
          outline="primary"
          label="Contorno da Propriedade"
          style={{ minHeight: '220px' }}
          // imageUrl={property.coverImage} // Quando a capa for implementada
        />
      </div>

      {/* Talhões */}
      <div className={styles.talhoesHeader}>
        <div>
          <h2 className={styles.talhoesTitle}>
            <MapIcon size={20} style={{ color: 'var(--primary)' }} />
            Talhões da Propriedade
          </h2>
          <p className={styles.talhoesSubtitle}>
            {counts.total} talhão(ões) · {counts.pronto} concluído(s) ·{' '}
            {counts.processando} processando · {counts.aguardando} aguardando
          </p>
        </div>
      </div>

      <div className={styles.talhoesGrid}>
        {/* Renderiza a lista de talhões */}
        {/* mockTalhoes.map((talhao) => (
          <TalhaoCard key={talhao.id} propertyId={property.id} talhao={talhao} />
        )) */}

        {/* Card de novo talhão */}
        <Link
          to={`/properties/${property.id}/fields/new`}
          className={styles.newTalhaoCard}
        >
          <div className={styles.newTalhaoIcon}>
            <Plus size={24} />
          </div>
          <div>
            <p className={styles.newTalhaoTitle}>Novo Talhão</p>
            <p className={styles.newTalhaoDesc}>
              Desenhe a área diretamente no mapa
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className={styles.infoLabel}>
        <Icon size={12} />
        {label}
      </dt>
      <dd className={styles.infoValue}>{value}</dd>
    </div>
  );
}
