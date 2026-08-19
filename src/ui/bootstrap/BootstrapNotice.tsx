export type BootstrapNoticeProps = {
  readonly children: string;
};

export function BootstrapNotice({ children }: BootstrapNoticeProps) {
  return <p>{children}</p>;
}
