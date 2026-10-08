import { ReactNode } from "react";

interface TabContainerProps {
  children: ReactNode;
}

export function TabContainer({ children }: TabContainerProps) {
  return (
    <div className="bg-base-secondary border border-tertiary rounded-xl flex flex-col h-full w-full">
      {children}
    </div>
  );
}
