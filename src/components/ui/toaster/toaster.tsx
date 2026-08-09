import * as React from 'react';
import { Toaster as Sonner } from 'sonner';
import styles from './Toaster.module.css';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      toastOptions={{
        classNames: {
          toast: styles.toast,
          description: styles.description,
          actionButton: styles.actionButton,
          cancelButton: styles.cancelButton,
        },
      }}
      {...props}
    />
  );
};
