import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { RasterAsset } from '../../assets/raster/contracts';
import styles from './Button.module.css';
import { RasterIcon } from './RasterIcon';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: ButtonVariant;
  readonly children: ReactNode;
};

export function Button({ variant = 'secondary', className, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

export type IconActionButtonProps = Omit<ButtonProps, 'children' | 'aria-label'> & {
  readonly asset: RasterAsset;
  readonly label: string;
  readonly compact?: boolean;
};

export function IconActionButton({
  asset,
  label,
  compact = false,
  className,
  ...props
}: IconActionButtonProps) {
  return (
    <Button
      className={[styles.iconAction, compact ? styles.compact : undefined, className]
        .filter(Boolean)
        .join(' ')}
      aria-label={compact ? label : undefined}
      data-icon-only={compact || undefined}
      {...props}
    >
      <RasterIcon asset={asset} alt="" loading="eager" />
      {compact ? <span className="pl-sr-only">{label}</span> : <span>{label}</span>}
    </Button>
  );
}
