import * as React from 'react';
// import { Slot } from '@radix-ui/react-slot'
import {
  ChevronRight,
  // MoreHorizontal,
} from 'lucide-react';
import styles from './Breadcrumb.module.css';

export const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'nav'> & {
    separator?: React.ReactNode;
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = 'Breadcrumb';

export const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<'ol'>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={[styles.list, className].filter(Boolean).join(' ')}
    {...props}
  />
));
BreadcrumbList.displayName = 'BreadcrumbList';

export const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={[styles.item, className].filter(Boolean).join(' ')}
    {...props}
  />
));
BreadcrumbItem.displayName = 'BreadcrumbItem';

// export const BreadcrumbLink = React.forwardRef<
//   HTMLAnchorElement,
//   React.ComponentPropsWithoutRef<'a'> & {
//     asChild?: boolean
//   }
// >(({ asChild, className, ...props }, ref) => {
//   const Comp = asChild ? Slot : 'a'

//   return (
//     <Comp
//       ref={ref}
//       className={[styles.link, className].filter(Boolean).join(' ')}
//       {...props}
//     />
//   )
// })
// BreadcrumbLink.displayName = 'BreadcrumbLink'

export const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={[styles.page, className].filter(Boolean).join(' ')}
    {...props}
  />
));
BreadcrumbPage.displayName = 'BreadcrumbPage';

export const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={[styles.separator, className].filter(Boolean).join(' ')}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

// export const BreadcrumbEllipsis = ({
//   className,
//   ...props
// }: React.ComponentProps<'span'>) => (
//   <span
//     role="presentation"
//     aria-hidden="true"
//     className={[styles.ellipsis, className].filter(Boolean).join(' ')}
//     {...props}
//   >
//     <MoreHorizontal className={styles.ellipsisIcon} />
//     <span className={styles.srOnly}>More</span>
//   </span>
// )
// BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis'
