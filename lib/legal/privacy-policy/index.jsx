import { useRouter } from "next/router";
import { PrivacyPolicyEn } from "./en";
import { PrivacyPolicyPt } from "./pt";
import { PrivacyPolicyEs } from "./es";

/**
 * TODO: Evaluate if it's best to break these components into
 * JSONs so we can have a single components pointing to the translations.
 */
const privacyPolicyMap = {
  en: <PrivacyPolicyEn />,
  pt: <PrivacyPolicyPt />,
  es: <PrivacyPolicyEs />,
};

export function PrivacyPolicy() {
  const { locale } = useRouter();

  return privacyPolicyMap[locale] ?? <PrivacyPolicyEn />;
}
