import { Box, Button, Card, Heading, Text } from "grommet";
import Head from "next/head";
import { useRouter } from "next/router";
import Clouds from "../../components/clouds";
import { Logo } from "../../components/logo";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function VerifyRequest() {
  const { push, locale } = useRouter();
  const { t } = useTranslation("verify-request");

  return (
    <>
      <Head>
        <title>{t("verify-email")}</title>
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
            {t("check-email")}
          </Heading>
          <Text
            style={{
              marginBottom: "1.5rem",
            }}
          >
            {t("sent")} 😉.
          </Text>
          <Button
            key={"back-to-site"}
            style={{
              width: "100%",
            }}
            onClick={() => push(`/${locale}`)}
            label={t("back")}
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
      ...(await serverSideTranslations(context.locale, [
        "verify-request",
        "common",
      ])),
    },
  };
}
