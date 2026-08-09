import * as React from 'react';
import styles from './Input.module.css';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={[styles.input, className].filter(Boolean).join(' ')}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';
