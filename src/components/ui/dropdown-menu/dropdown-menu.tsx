import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
// import { Check, ChevronRight, Circle } from 'lucide-react'
import styles from './DropdownMenu.module.css';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
// export const DropdownMenuGroup = DropdownMenuPrimitive.Group
// export const DropdownMenuPortal = DropdownMenuPrimitive.Portal
// export const DropdownMenuSub = DropdownMenuPrimitive.Sub
// export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

// export const DropdownMenuSubTrigger = React.forwardRef<
//   React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
//   React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
//     inset?: boolean
//   }
// >(({ className, inset, children, ...props }, ref) => (
//   <DropdownMenuPrimitive.SubTrigger
//     ref={ref}
//     className={[styles.subTrigger, inset && styles.inset, className].filter(Boolean).join(' ')}
//     {...props}
//   >
//     {children}
//     <ChevronRight className={styles.iconRight} />
//   </DropdownMenuPrimitive.SubTrigger>
// ))
// DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName

// export const DropdownMenuSubContent = React.forwardRef<
//   React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
//   React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
// >(({ className, ...props }, ref) => (
//   <DropdownMenuPrimitive.SubContent
//     ref={ref}
//     className={[styles.content, styles.subContent, className].filter(Boolean).join(' ')}
//     {...props}
//   />
// ))
// DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName

export const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={[styles.content, className].filter(Boolean).join(' ')}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

export const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={[styles.item, inset && styles.inset, className]
      .filter(Boolean)
      .join(' ')}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

// export const DropdownMenuCheckboxItem = React.forwardRef<
//   React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
//   React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
// >(({ className, children, checked, ...props }, ref) => (
//   <DropdownMenuPrimitive.CheckboxItem
//     ref={ref}
//     className={[styles.item, styles.checkboxRadioItem, className].filter(Boolean).join(' ')}
//     checked={checked}
//     {...props}
//   >
//     <span className={styles.itemIndicatorWrapper}>
//       <DropdownMenuPrimitive.ItemIndicator>
//         <Check className={styles.iconIndicator} />
//       </DropdownMenuPrimitive.ItemIndicator>
//     </span>
//     {children}
//   </DropdownMenuPrimitive.CheckboxItem>
// ))
// DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName

// export const DropdownMenuRadioItem = React.forwardRef<
//   React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
//   React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
// >(({ className, children, ...props }, ref) => (
//   <DropdownMenuPrimitive.RadioItem
//     ref={ref}
//     className={[styles.item, styles.checkboxRadioItem, className].filter(Boolean).join(' ')}
//     {...props}
//   >
//     <span className={styles.itemIndicatorWrapper}>
//       <DropdownMenuPrimitive.ItemIndicator>
//         <Circle className={styles.iconRadio} />
//       </DropdownMenuPrimitive.ItemIndicator>
//     </span>
//     {children}
//   </DropdownMenuPrimitive.RadioItem>
// ))
// DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

export const DropdownMenuLabel = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={[styles.label, inset && styles.inset, className]
      .filter(Boolean)
      .join(' ')}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

export const DropdownMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={[styles.separator, className].filter(Boolean).join(' ')}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

// export const DropdownMenuShortcut = ({
//   className,
//   ...props
// }: React.HTMLAttributes<HTMLSpanElement>) => {
//   return (
//     <span
//       className={[styles.shortcut, className].filter(Boolean).join(' ')}
//       {...props}
//     />
//   )
// }
// DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'
