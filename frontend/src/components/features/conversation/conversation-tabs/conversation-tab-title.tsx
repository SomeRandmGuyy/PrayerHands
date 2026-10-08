type ConversationTabTitleProps = {
  title: string;
};

export function ConversationTabTitle({ title }: ConversationTabTitleProps) {
  return (
    <div className="flex flex-row items-center justify-between border-b border-tertiary py-2 px-3">
      <span className="text-xs font-medium text-content">{title}</span>
    </div>
  );
}
