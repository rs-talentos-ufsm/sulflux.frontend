import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  LayoutDashboard,
  Map as MapIcon,
  Leaf,
  Droplets,
  BarChart3,
  FileText,
  Bot,
  Calendar,
  Settings,
  Building2,
  Tractor,
} from 'lucide-react';
import { useProperties } from '@/hooks/useProperty';
import { useFields } from '@/hooks/useField';
import { useDocumentsList } from '@/hooks/useDocuments';
import { useTenantStore } from '@/store/tenantStore';
import styles from './GlobalSearch.module.css';

interface SearchResultItem {
  id: string;
  category: 'PÁGINAS' | 'PROPRIEDADES' | 'TALHÕES' | 'DOCUMENTOS';
  title: string;
  subtitle: string;
  url: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
}

const STATIC_PAGES: Omit<SearchResultItem, 'id'>[] = [
  {
    category: 'PÁGINAS',
    title: 'Minhas Propriedades',
    subtitle: 'Painel com visão geral das fazendas e indicadores',
    url: '/properties',
    icon: LayoutDashboard,
    iconBg: 'color-mix(in srgb, var(--primary) 12%, transparent)',
    iconColor: 'var(--primary)',
  },
  {
    category: 'PÁGINAS',
    title: 'Mapa de Talhões',
    subtitle: 'Visualização geográfica de polígonos, CAR e NDVI',
    url: '/map',
    icon: MapIcon,
    iconBg: 'color-mix(in srgb, #0ea5e9 12%, transparent)',
    iconColor: '#0ea5e9',
  },
  {
    category: 'PÁGINAS',
    title: 'Análise de Carbono',
    subtitle: 'Balanço de GPP, Reco e trocas líquidas de carbono (NEE)',
    url: '/carbon',
    icon: Leaf,
    iconBg: 'color-mix(in srgb, #10b981 12%, transparent)',
    iconColor: '#10b981',
  },
  {
    category: 'PÁGINAS',
    title: 'Balanço Hídrico',
    subtitle: 'Monitoramento de água no solo, chuvas e limiares críticos',
    url: '/water',
    icon: Droplets,
    iconBg: 'color-mix(in srgb, #0284c7 12%, transparent)',
    iconColor: '#0284c7',
  },
  {
    category: 'PÁGINAS',
    title: 'Relatórios Ambientais',
    subtitle: 'Histórico, exportação de balanços e certificação',
    url: '/reports',
    icon: BarChart3,
    iconBg: 'color-mix(in srgb, #f59e0b 12%, transparent)',
    iconColor: '#f59e0b',
  },
  {
    category: 'PÁGINAS',
    title: 'Documentos da Fazenda',
    subtitle: 'CAR, outorgas, certidões e relatórios técnicos',
    url: '/documents',
    icon: FileText,
    iconBg: 'color-mix(in srgb, #8b5cf6 12%, transparent)',
    iconColor: '#8b5cf6',
  },
  {
    category: 'PÁGINAS',
    title: 'Assistente Sulflux (IA)',
    subtitle: 'Inteligência agronômica, insights e recomendações',
    url: '/assistant',
    icon: Bot,
    iconBg: 'color-mix(in srgb, #ec4899 12%, transparent)',
    iconColor: '#ec4899',
  },
  {
    category: 'PÁGINAS',
    title: 'Histórico de Safras',
    subtitle: 'Ciclos de plantio, insumos aplicados e produtividade',
    url: '/season',
    icon: Calendar,
    iconBg: 'color-mix(in srgb, #14b8a6 12%, transparent)',
    iconColor: '#14b8a6',
  },
  {
    category: 'PÁGINAS',
    title: 'Configurações da Conta',
    subtitle: 'Perfil, preferências, temas e dados cadastrais',
    url: '/settings',
    icon: Settings,
    iconBg: 'color-mix(in srgb, var(--primary) 12%, transparent)',
    iconColor: 'var(--primary)',
  },
];

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const setActiveProperty = useTenantStore((s) => s.setActiveProperty);

  // Consultas dinâmicas ao backend
  const { data: propertiesData } = useProperties({ page: 1, limit: 50 });
  const { data: fieldsData } = useFields({ page: 1, limit: 50 });
  const { data: documentsData } = useDocumentsList();

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Atalho global: Ctrl + K ou Cmd + K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtro de resultados
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResultItem[] = [];

    // 1. Páginas
    STATIC_PAGES.forEach((page, idx) => {
      if (
        page.title.toLowerCase().includes(q) ||
        page.subtitle.toLowerCase().includes(q)
      ) {
        results.push({ ...page, id: `page-${idx}` });
      }
    });

    // 2. Propriedades / Fazendas
    const properties = propertiesData?.data || [];
    properties.forEach((prop) => {
      if (
        prop.name.toLowerCase().includes(q) ||
        prop.location.toLowerCase().includes(q) ||
        (prop.car && prop.car.toLowerCase().includes(q))
      ) {
        results.push({
          id: `prop-${prop.id}`,
          category: 'PROPRIEDADES',
          title: prop.name,
          subtitle: `${prop.location} • CAR: ${prop.car || 'Sem registro'} • Status: ${prop.status === 'ACTIVE' ? 'Ativa' : 'Configurando'}`,
          url: '/properties',
          icon: Building2,
          iconBg: 'color-mix(in srgb, #10b981 14%, transparent)',
          iconColor: '#10b981',
          onClick: () => {
            setActiveProperty(prop.id);
          },
        });
      }
    });

    // 3. Talhões
    const fields = fieldsData?.data || [];
    fields.forEach((field) => {
      if (
        field.name.toLowerCase().includes(q) ||
        field.code.toLowerCase().includes(q) ||
        (field.soilType && field.soilType.toLowerCase().includes(q))
      ) {
        results.push({
          id: `field-${field.id}`,
          category: 'TALHÕES',
          title: `${field.name} (${field.code})`,
          subtitle: `Área: ${field.area || '—'} ha • Solo: ${field.soilType || 'N/I'} • Status: ${field.status}`,
          url: '/map',
          icon: Tractor,
          iconBg: 'color-mix(in srgb, #0284c7 14%, transparent)',
          iconColor: '#0284c7',
        });
      }
    });

    // 4. Documentos
    const docs = Array.isArray(documentsData) ? documentsData : [];
    docs.forEach((doc) => {
      if (
        doc.name.toLowerCase().includes(q) ||
        doc.folder.toLowerCase().includes(q)
      ) {
        results.push({
          id: `doc-${doc.id}`,
          category: 'DOCUMENTOS',
          title: doc.name,
          subtitle: `Pasta: ${doc.folder} • Tamanho: ${doc.size} • Formato: ${doc.type.toUpperCase()}`,
          url: '/documents',
          icon: FileText,
          iconBg: 'color-mix(in srgb, #8b5cf6 14%, transparent)',
          iconColor: '#8b5cf6',
        });
      }
    });

    return results;
  }, [query, propertiesData, fieldsData, documentsData, setActiveProperty]);

  // Agrupa resultados por categoria
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResultItem[]> = {};
    searchResults.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [searchResults]);

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(
        (prev) => (prev - 1 + searchResults.length) % searchResults.length,
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = searchResults[activeIndex];
      if (selected) {
        if (selected.onClick) selected.onClick();
        navigate(selected.url);
        setIsOpen(false);
        setQuery('');
      }
    }
  };

  const handleSelectItem = (item: SearchResultItem) => {
    if (item.onClick) item.onClick();
    navigate(item.url);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar páginas, fazendas, talhões... (Ctrl + K)"
          className={styles.searchInput}
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className={styles.clearButton}
            title="Limpar busca"
          >
            <X style={{ width: '0.75rem', height: '0.75rem' }} />
          </button>
        ) : (
          <span className={styles.shortcutBadge}>
            <kbd>Ctrl</kbd> <kbd>K</kbd>
          </span>
        )}
      </div>

      {isOpen && query.trim() !== '' && (
        <div className={styles.resultsDropdown}>
          {searchResults.length === 0 ? (
            <div className={styles.emptyState}>
              <Search
                style={{
                  width: '1.75rem',
                  height: '1.75rem',
                  color: 'var(--muted-foreground)',
                  opacity: 0.5,
                }}
              />
              <span className={styles.emptyTitle}>
                Nenhum resultado encontrado
              </span>
              <p className={styles.emptyDesc}>
                Não encontramos correspondências para &quot;{query}&quot;. Tente
                buscar por nome de fazenda, talhão ou módulo.
              </p>
            </div>
          ) : (
            <>
              {Object.entries(groupedResults).map(([category, items]) => (
                <div key={category} className={styles.categorySection}>
                  <div className={styles.categoryHeader}>
                    <span>{category}</span>
                    <span className={styles.categoryBadge}>{items.length}</span>
                  </div>

                  {items.map((item) => {
                    const globalIdx = searchResults.findIndex(
                      (r) => r.id === item.id,
                    );
                    const isItemActive = globalIdx === activeIndex;

                    const IconComp = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        className={`${styles.resultItem} ${
                          isItemActive ? styles.resultItemActive : ''
                        }`}
                      >
                        <div
                          className={styles.itemIconWrapper}
                          style={{
                            backgroundColor: item.iconBg,
                            color: item.iconColor,
                          }}
                        >
                          <IconComp style={{ width: '1rem', height: '1rem' }} />
                        </div>

                        <div className={styles.itemContent}>
                          <span className={styles.itemTitle}>{item.title}</span>
                          <span className={styles.itemSubtitle}>
                            {item.subtitle}
                          </span>
                        </div>

                        <span className={styles.itemTag}>{category}</span>
                      </button>
                    );
                  })}
                </div>
              ))}

              <div className={styles.footerHint}>
                <div className={styles.keyboardShortcutGroup}>
                  <kbd className={styles.kbd}>↑</kbd>
                  <kbd className={styles.kbd}>↓</kbd>
                  <span>navegar</span>
                </div>
                <div className={styles.keyboardShortcutGroup}>
                  <kbd className={styles.kbd}>↵</kbd>
                  <span>selecionar</span>
                </div>
                <div className={styles.keyboardShortcutGroup}>
                  <kbd className={styles.kbd}>esc</kbd>
                  <span>fechar</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
