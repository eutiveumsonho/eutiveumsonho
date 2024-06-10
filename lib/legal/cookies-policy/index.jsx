import { useRouter } from "next/router";
import { CookiesPolicyEn } from "./en";
import { CookiesPolicyPt } from "./pt";
import { CookiesPolicyEs } from "./es";

/**
 * TODO: Evaluate if it's best to break these components into
 * JSONs so we can have a single components pointing to the translations.
 */
const cookiePolicyMap = {
  en: <CookiesPolicyEn />,
  pt: <CookiesPolicyPt />,
  es: <CookiesPolicyEs />,
};

export function CookiesPolicy() {
  const { locale } = useRouter();

  return cookiePolicyMap[locale] ?? <CookiesPolicyEn />;
}
