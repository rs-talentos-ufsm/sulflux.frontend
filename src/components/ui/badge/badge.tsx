import * as React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const variantClass = styles[variant] || styles.default;

  return (
    <div
      className={[styles.base, variantClass, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}
