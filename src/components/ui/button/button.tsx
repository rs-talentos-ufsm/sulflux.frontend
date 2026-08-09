import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import styles from './Button.module.css';

export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';

    const buttonClasses = [
      styles.button,
      styles[`variant-${variant}`],
      styles[`size-${size}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return <Comp className={buttonClasses} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';
