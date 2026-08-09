import * as React from 'react';
import styles from './Skeleton.module.css';

export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={[styles.skeleton, className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
