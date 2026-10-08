import { cn } from "#/utils/utils";

interface ConversationNameContextMenuIconTextProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
}

export function ConversationNameContextMenuIconText({
  icon,
  text,
  className,
}: ConversationNameContextMenuIconTextProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 hover:bg-base-tertiary rounded",
        className,
      )}
    >
      {icon}
      {text}
    </div>
  );
}
