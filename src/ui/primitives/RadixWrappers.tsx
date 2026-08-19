import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as VisuallyHiddenPrimitive from '@radix-ui/react-visually-hidden';
import type { ReactElement, ReactNode } from 'react';
import { Button } from './Button';
import styles from './RadixWrappers.module.css';

export type TooltipProps = {
  readonly content: ReactNode;
  readonly children: ReactElement;
  readonly side?: 'top' | 'right' | 'bottom' | 'left';
};

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={320} skipDelayDuration={120}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className={styles.tooltip} side={side} sideOffset={7}>
            {content}
            <TooltipPrimitive.Arrow className={styles.tooltipArrow} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export type PopoverProps = {
  readonly trigger: ReactElement;
  readonly title: string;
  readonly children: ReactNode;
};

export function Popover({ trigger, title, children }: PopoverProps) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content className={styles.popover} sideOffset={8} collisionPadding={12}>
          <div className={styles.popoverHeading}>
            <strong>{title}</strong>
            <PopoverPrimitive.Close asChild>
              <Button variant="text">Close</Button>
            </PopoverPrimitive.Close>
          </div>
          <div className={styles.popoverBody}>{children}</div>
          <PopoverPrimitive.Arrow className={styles.popoverArrow} />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export type DialogProps = {
  readonly trigger: ReactElement;
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
  readonly confirmLabel?: string;
  readonly onConfirm?: () => void;
  readonly dismissible?: boolean;
};

export function Dialog({
  trigger,
  title,
  description,
  children,
  confirmLabel = 'Acknowledge',
  onConfirm,
  dismissible = true,
}: DialogProps) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.dialogOverlay} />
        <DialogPrimitive.Content
          className={styles.dialog}
          onEscapeKeyDown={(event) => {
            if (!dismissible) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (!dismissible) event.preventDefault();
          }}
        >
          <p className={styles.dialogKicker}>Royal chancery notice</p>
          <DialogPrimitive.Title className={styles.dialogTitle}>{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className={styles.dialogDescription}>
            {description}
          </DialogPrimitive.Description>
          <div className={styles.dialogBody}>{children}</div>
          <div className={styles.dialogActions}>
            {dismissible ? (
              <DialogPrimitive.Close asChild>
                <Button variant="text">Return to the board</Button>
              </DialogPrimitive.Close>
            ) : (
              <span className={styles.requiredDecision}>
                Resolution required · Escape will not dismiss
              </span>
            )}
            <DialogPrimitive.Close asChild>
              <Button variant="primary" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export type TabItem = {
  readonly value: string;
  readonly label: string;
  readonly content: ReactNode;
};

export type SegmentedTabsProps = {
  readonly label: string;
  readonly items: readonly [TabItem, ...TabItem[]];
  readonly defaultValue?: string;
};

export function SegmentedTabs({ label, items, defaultValue }: SegmentedTabsProps) {
  const initialValue = defaultValue ?? items[0].value;

  return (
    <TabsPrimitive.Root className={styles.tabs} defaultValue={initialValue}>
      <TabsPrimitive.List className={styles.tabList} aria-label={label}>
        {items.map((item) => (
          <TabsPrimitive.Trigger className={styles.tabTrigger} value={item.value} key={item.value}>
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content className={styles.tabContent} value={item.value} key={item.value}>
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}

export function ScrollRegion({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <ScrollAreaPrimitive.Root className={styles.scrollRoot}>
      <ScrollAreaPrimitive.Viewport
        className={styles.scrollViewport}
        aria-label={label}
        tabIndex={0}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar className={styles.scrollbar} orientation="vertical">
        <ScrollAreaPrimitive.Thumb className={styles.scrollThumb} />
      </ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

export const VisuallyHidden = VisuallyHiddenPrimitive.Root;
