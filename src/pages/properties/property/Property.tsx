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
import { FieldCard } from '@/components/cards/field-card/field-card';

// Hooks da API
import { useProperty } from '@/hooks/useProperty';
import { PropertyStatus, FieldStatus } from '@lib/shared';
import { useFields } from '@/hooks/useField';

import styles from './Property.module.css';

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();

  const { data: property, isLoading, isError } = useProperty(id!);
  const { data: fieldsData, isLoading: isLoadingFields } = useFields({
    page: 1,
    limit: 100,
  });

  const fields = fieldsData?.data || [];

  const counts = {
    total: fields.length,
    pronto: fields.filter((f) => f.status === FieldStatus.Ready).length,
    processando: fields.filter((f) => f.status === FieldStatus.Processing)
      .length,
    aguardando: fields.filter((f) => f.status === FieldStatus.Waiting).length,
  };

  // Estados de carregamento e erro
  if (isLoading || isLoadingFields) {
    return (
      <div className={styles.centerState}>
        <Loader2 className="animate-spin" size={32} />
        <p>Carregando dados da propriedade...</p>
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
                value={property.owner?.name || '--'}
              />
            </dl>
          </div>

          <div className={styles.actionButtons}>
            <Button asChild>
              <Link to={`/properties/${property.id}/fields-new`}>
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
      <div className={styles.fieldsHeader}>
        <div>
          <h2 className={styles.fieldsTitle}>
            <MapIcon size={20} style={{ color: 'var(--primary)' }} />
            Talhões da Propriedade
          </h2>
          <p className={styles.fieldsSubtitle}>
            {counts.total} talhão(ões) · {counts.pronto} concluído(s) ·{' '}
            {counts.processando} processando · {counts.aguardando} aguardando
          </p>
        </div>
      </div>

      <div className={styles.fieldsGrid}>
        {fields.map((field) => (
          <FieldCard key={field.id} propertyId={property.id} field={field} />
        ))}

        {/* Card de novo talhão */}
        <Link
          to={`/properties/${property.id}/fields-new`}
          className={styles.newFieldCard}
        >
          <div className={styles.newFieldIcon}>
            <Plus size={24} />
          </div>
          <div>
            <p className={styles.newFieldTitle}>Novo Talhão</p>
            <p className={styles.newFieldDesc}>
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
