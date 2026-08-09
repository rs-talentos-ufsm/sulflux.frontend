import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import styles from './Label.module.css';

export const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={[styles.label, className].filter(Boolean).join(' ')}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;
