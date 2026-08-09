import * as React from 'react';
import styles from './Textarea.module.css';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={[styles.textarea, className].filter(Boolean).join(' ')}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';
