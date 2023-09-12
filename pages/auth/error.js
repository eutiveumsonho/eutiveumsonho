import { Box, Button, Card, Heading, Text } from "grommet";
import Head from "next/head";
import { useRouter } from "next/router";
import Clouds from "../../components/clouds";
import { Logo } from "../../components/logo";
import { NEXT_AUTH_ERRORS, _NEXT_AUTH_ERRORS } from "../../lib/errors";
import { logError } from "../../lib/o11y";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Error() {
  const { query, push, locale } = useRouter();
  const { t } = useTranslation("errors");

  const { error: errorCode } = query;

  logError({
    service: "web",
    pathname: "/auth/error",
    component: "VerifyRequest",
    error_message: _NEXT_AUTH_ERRORS[errorCode],
  });

  return (
    <>
      <Head>
        <title>{t("errored")}</title>
      </Head>
      <Clouds />
      <Box
        pad="large"
        align="center"
        gap="medium"
        width="large"
        justify="center"
        style={{
          display: "flex",
          height: "90vh",
          margin: "auto",
        }}
      >
        <Card
          pad="large"
          gap="medium"
          align="center"
          background="white"
          style={{
            minWidth: "24rem",
          }}
        >
          <Logo />
          <Heading
            level={2}
            style={{
              marginBottom: 0,
            }}
          >
            {t("errored")}
          </Heading>
          <Text
            style={{
              marginBottom: "1.5rem",
            }}
          >
            {NEXT_AUTH_ERRORS[errorCode][locale]}
          </Text>
          <Button
            key={"back-to-site"}
            style={{
              width: "100%",
            }}
            onClick={() => push(`/${locale}`)}
            label={t("back-to-site")}
            primary
          />
        </Card>
      </Box>
    </>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["errors"])),
    },
  };
}
