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
        "text-[#A8A8A8] bg-[#2A2A2A]",
        isActive && "bg-[#25272D] text-white",
        isActive
          ? "hover:text-white hover:bg-tertiary"
          : "hover:text-white hover:bg-[#2A2A2A]",
        isActive
          ? "focus-within:text-white focus-within:bg-tertiary"
          : "focus-within:text-white focus-within:bg-[#2A2A2A]",
      )}
    >
      <Icon className={cn("w-5 h-5 text-inherit")} />
    </button>
  );
}
