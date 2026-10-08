import { ComponentType } from "react";
import { cn } from "#/utils/utils";

type ConversationTabNavProps = {
  icon: ComponentType<{ className: string }>;
  onClick(): void;
  isActive?: boolean;
};

export function ConversationTabNav({
  icon: Icon,
  onClick,
  isActive,
}: ConversationTabNavProps) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick();
      }}
      className={cn(
        "p-1 rounded-md cursor-pointer",
        "text-basic bg-base",
        isActive && "bg-base-secondary text-content",
        isActive
          ? "hover:text-content hover:bg-tertiary"
          : "hover:text-content hover:bg-base",
        isActive
          ? "focus-within:text-content focus-within:bg-tertiary"
          : "focus-within:text-content focus-within:bg-base",
      )}
    >
      <Icon className={cn("w-5 h-5 text-inherit")} />
    </button>
  );
}
