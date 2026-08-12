import React, { useState, useEffect } from 'react';
import styles from './MapPlaceholder.module.css';

interface MapPlaceholderProps {
  className?: string;
  style?: React.CSSProperties;
  outline?: 'amber' | 'primary';
  label?: string;
  imageUrl?: string | null;
  mapComponent?: React.ReactNode;
  showPolygon?: boolean;
  children?: React.ReactNode;
}

export function MapPlaceholder({
  className = '',
  style,
  outline = 'primary',
  label = 'Visualização de Satélite',
  imageUrl,
  mapComponent,
  showPolygon = true,
  children,
}: MapPlaceholderProps) {
  const strokeColor = outline === 'amber' ? '#f59e0b' : '#22c55e';

  // Estado seguro do React para controlar erros de carregamento da imagem
  const [imageError, setImageError] = useState(false);

  // Se a URL da imagem mudar, resetamos o erro para tentar carregar a nova
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  return (
    <div className={`${styles.wrapper} ${className}`} style={style}>
      {/* FUNDO CSS ESTILIZADO */}
      <div aria-hidden className={styles.fallbackGradient} />
      <div aria-hidden className={styles.fallbackGrid} />

      {/* MAPA INTERATIVO */}
      {mapComponent && <div className={styles.mapLayer}>{mapComponent}</div>}

      {/* IMAGEM ESTÁTICA */}
      {imageUrl && !mapComponent && !imageError && (
        <img
          src={imageUrl}
          alt="Mapa da Propriedade"
          className={styles.imageLayer}
          onError={() => setImageError(true)}
        />
      )}

      {/* OVERLAY: Contorno do talhão */}
      {showPolygon && (
        <svg
          aria-hidden
          className={styles.svgOverlay}
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid meet"
        >
          <polygon
            points="90,70 300,60 340,160 260,250 110,230 70,150"
            fill={strokeColor}
            fillOpacity="0.15"
            stroke={strokeColor}
            strokeWidth="3"
            strokeDasharray="8 6"
            strokeLinejoin="round"
          />
        </svg>
      )}

      <span className={styles.label}>{label}</span>

      {children}
    </div>
  );
}
