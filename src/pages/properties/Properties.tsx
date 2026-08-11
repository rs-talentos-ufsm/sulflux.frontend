import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  MapPinned,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Input } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/select';
import { PropertyCard } from '@/components/cards/property-card/property-card';
import { useProperties } from '@/hooks/useProperty';
import { PropertyStatus } from '@lib/shared';

type StatusFilter =
  | 'all'
  | typeof PropertyStatus.Active
  | typeof PropertyStatus.Configure;

// Importação do CSS Modules
import styles from './Properties.module.css';

export default function PropertiesPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const {
    data: paginatedProperties,
    isLoading,
    isError,
  } = useProperties({
    query: query || undefined,
    status: status !== 'all' ? status : undefined,
    page: 1,
    limit: 50,
  });

  // Extraímos os dados da resposta padronizada
  const propertiesList = paginatedProperties?.data || [];

  // O cálculo de resumo agora reage aos dados retornados da API
  const summary = [
    {
      label: 'Propriedades',
      value: propertiesList.length,
      icon: MapPinned,
      iconClass: styles.iconPrimary,
      bgClass: styles.bgPrimary,
    },
    {
      label: 'Ativas',
      value: propertiesList.filter((p) => p.status === PropertyStatus.Active)
        .length,
      icon: CheckCircle2,
      iconClass: styles.iconPrimary,
      bgClass: styles.bgPrimary,
    },
    {
      label: 'Pendentes',
      value: propertiesList.filter((p) => p.status === PropertyStatus.Configure)
        .length,
      icon: AlertTriangle,
      iconClass: styles.iconWarning,
      bgClass: styles.bgWarning,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Minhas Propriedades</h1>
          <p className={styles.subtitle}>
            Gerencie suas terras e acompanhe o monitoramento de carbono e
            hídrico de cada talhão.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/properties/new">
            <Plus size={16} />
            Nova Propriedade
          </Link>
        </Button>
      </div>

      {/* Resumo */}
      <div className={styles.summaryGrid}>
        {summary.map((item) => (
          <div key={item.label} className={styles.summaryCard}>
            <div className={`${styles.summaryIconBox} ${item.bgClass}`}>
              <item.icon size={16} className={item.iconClass} />
            </div>
            <div className={styles.summaryContent}>
              <p className={styles.summaryValue}>{item.value}</p>
              <p className={styles.summaryLabel}>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <Input
            placeholder="Buscar por nome, cidade ou CAR..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as StatusFilter)}
        >
          <SelectTrigger className={styles.selectTrigger}>
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value={PropertyStatus.Active}>Ativas</SelectItem>
            <SelectItem value={PropertyStatus.Configure}>
              A configurar
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estados de Carregamento e Erro */}
      {isLoading && (
        <div className={styles.loadingState}>
          <p className={styles.emptyStateText}>Carregando propriedades...</p>
        </div>
      )}

      {isError && !isLoading && (
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>
            Ocorreu um erro ao buscar suas propriedades.
          </p>
        </div>
      )}

      {/* Grid de propriedades */}
      {!isLoading && !isError && (
        <div className={styles.propertiesGrid}>
          {propertiesList.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}

          {/* Card de nova propriedade */}
          <Link to="/properties/new" className={styles.newPropertyCard}>
            <div className={styles.newPropertyIconBox}>
              <Plus size={24} />
            </div>
            <div>
              <p className={styles.newPropertyTitle}>Nova Propriedade</p>
              <p className={styles.newPropertyDesc}>
                Cadastre uma nova terra pelo número CAR
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
