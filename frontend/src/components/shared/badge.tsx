import { cn } from "#/utils/utils";

interface BrandBadgeProps {
  className?: string;
}

export function BrandBadge({
  children,
  className,
}: React.PropsWithChildren<BrandBadgeProps>) {
  return (
    <span
      className={cn(
        "text-sm leading-4 text-[#2A2A2A] font-semibold tracking-tighter bg-primary p-1 rounded-full",
        className,
      )}
    >
      {children}
    </span>
  );
}
