import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import styles from './Tooltip.module.css';

export const TooltipProvider = TooltipPrimitive.Provider;

export const Tooltip = TooltipPrimitive.Root;

export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={[styles.content, className].filter(Boolean).join(' ')}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
