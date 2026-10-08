import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { TooltipButton } from "./tooltip-button";
import PlusIcon from "#/icons/u-plus.svg?react";

interface NewProjectButtonProps {
  disabled?: boolean;
}

export function NewProjectButton({ disabled = false }: NewProjectButtonProps) {
  const { t } = useTranslation();

  const startNewProject = t(I18nKey.CONVERSATION$START_NEW);

  return (
    <TooltipButton
      tooltip={startNewProject}
      ariaLabel={startNewProject}
      navLinkTo="/"
      testId="new-project-button"
      disabled={disabled}
    >
      <PlusIcon width={24} height={24} color="#1c1917" />
    </TooltipButton>
  );
}
