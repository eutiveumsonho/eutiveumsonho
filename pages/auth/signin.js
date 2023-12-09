import {
  Box,
  Button,
  Card,
  FormField,
  Layer,
  Spinner,
  TextInput,
} from "grommet";
import { Facebook, Google } from "grommet-icons";
import {
  getCsrfToken,
  getProviders,
  getSession,
  signIn,
} from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import isEmail from "validator/lib/isEmail";
import Clouds from "../../components/clouds";
import { Logo } from "../../components/logo";
import { NEXT_AUTH_ERRORS } from "../../lib/errors";
import { getUserAgentProps } from "../../lib/user-agent";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const icon = {
  Facebook: <Facebook />,
  Google: <Google />,
};

/**
 * Sign in page. This page shows the user a sign in form.
 * The user can sign in with their email or with a third-party provider.
 * The user can also sign up seamlessly on this page.
 *
 * @param {{ providers, csrfToken }} props - The props this component gets from getServerSideProps
 */
export default function SignIn({ providers, csrfToken }) {
  const [emailSignInLoading, setEmailSignInLoading] = useState(false);
  const [email, setEmail] = useState("");
  const { query, locale, push } = useRouter();
  const { t } = useTranslation("signin");
  const [error, setError] = useState(null);

  const errorQs = query["error"];

  useEffect(() => {
    const localeQs = query["locale"];

    if (!localeQs) {
      window.location.href += `&locale=${locale}`;
    }

    if (errorQs) {
      setError(errorQs);
    }
  }, []);

  useEffect(() => {
    if (error) {
      setEmailSignInLoading(false);
    }
  }, [error]);

  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [email]);

  const handleOnSubmit = async (event) => {
    event.preventDefault();
    setEmailSignInLoading(true);
    const callbackUrl = `${window.location.origin}/${locale}/auth/verify-request`;

    const { error, ok } = await signIn("email", {
      email,
      redirect: false,
    });

    if (ok && !error) {
      push(callbackUrl);
    }

    if (error) {
      setError(error);
    }
  };

  return (
    <>
      <Head>
        <title>{t("enter")}</title>
      </Head>
      {error ? (
        <Layer position="top" modal={false}>
          <Box
            gap="medium"
            pad="medium"
            width={"100vw"}
            align="center"
            background="status-critical"
          >
            {NEXT_AUTH_ERRORS[error][locale]
              ? NEXT_AUTH_ERRORS[error][locale]
              : NEXT_AUTH_ERRORS.Default[locale]}
          </Box>
        </Layer>
      ) : null}
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

          {Object.values(providers).map((provider) => {
            if (provider.type === "email") {
              return (
                <Fragment key={provider.type}>
                  {/* https://next-auth.js.org/configuration/pages#email-sign-in */}
                  <form onSubmit={handleOnSubmit}>
                    <input
                      name="csrfToken"
                      type="hidden"
                      defaultValue={csrfToken}
                    />
                    <FormField
                      required
                      name="email"
                      validate={[
                        (value) => {
                          if (!isEmail(value ?? "")) {
                            return {
                              message: t("valid-email"),
                            };
                          }
                        },
                      ]}
                    >
                      <TextInput
                        type="email"
                        id="email"
                        name="email"
                        placeholder={t("email")}
                        onChange={(event) => {
                          setEmail(event.target.value);
                        }}
                      />
                    </FormField>
                    <Button
                      style={{
                        minWidth: "18.75rem",
                      }}
                      icon={
                        emailSignInLoading ? <Spinner size="xsmall" /> : null
                      }
                      label={emailSignInLoading ? t("sending") : t("send")}
                      type="submit"
                      fill="horizontal"
                      primary
                      onClick={() => setEmailSignInLoading(true)}
                    />
                  </form>
                  <hr />
                </Fragment>
              );
            }

            if (
              process.env.NODE_ENV === "production" ||
              process.env.NODE_ENV === "test"
            ) {
              return (
                <Button
                  key={provider.name}
                  style={{
                    width: "100%",
                  }}
                  onClick={() => {
                    if (process.env.NODE_ENV === "test") {
                      console.warn(
                        "Test mode, skipping OAuth flow. Use magic links."
                      );
                      return;
                    }

                    signIn(provider.id, {
                      callbackUrl: `${window.location.origin}/${locale}/dreams`,
                    });
                  }}
                  icon={icon[provider.name]}
                  label={`${t("enter-with")} ${provider.name}`}
                  primary
                />
              );
            }

            return null;
          })}
        </Card>
      </Box>
    </>
  );
}

export async function getServerSideProps(context) {
  const providers = await getProviders();
  const session = await getSession(context);

  if (session) {
    context.res.writeHead(302, { Location: `/${context.locale}` });
    context.res.end();

    return {
      props: {
        ...getUserAgentProps(context),
        ...(await serverSideTranslations(context.locale, ["signin", "common"])),
      },
    };
  }

  return {
    props: {
      providers,
      csrfToken: await getCsrfToken(context),
      ...getUserAgentProps(context),
      ...(await serverSideTranslations(context.locale, ["signin", "common"])),
    },
  };
}
