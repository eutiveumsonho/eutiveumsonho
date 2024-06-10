import { useRouter } from "next/router";
import { TermsAndConditionsEn } from "./en";
import { TermsAndConditionsPt } from "./pt";
import { TermsAndConditionsEs } from "./es";

/**
 * TODO: Evaluate if it's best to break these components into
 * JSONs so we can have a single components pointing to the translations.
 */
const termsAndConditionsMap = {
  en: <TermsAndConditionsEn />,
  pt: <TermsAndConditionsPt />,
  es: <TermsAndConditionsEs />,
};

export function TermsAndConditions() {
  const { locale } = useRouter();

  return termsAndConditionsMap[locale] ?? <TermsAndConditionsEn />;
}
