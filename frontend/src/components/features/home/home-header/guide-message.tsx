import { useTranslation } from "react-i18next";

export function GuideMessage() {
  const { t } = useTranslation();

  return (
    <div className="w-fit flex flex-col md:flex-row items-start md:items-center justify-center gap-1 rounded-[12px] bg-base-tertiary leading-5 text-content text-[15px] font-normal m-1 md:h-9.5 px-4 pb-1 md:px-[15px] md:py-0">
      <span className="">{t("HOME$GUIDE_MESSAGE_TITLE")} </span>
      <a
        href="https://gentle-fist.dev/usage/getting-started"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="underline">{t("COMMON$CLICK_HERE")}</span>
      </a>
    </div>
  );
}
