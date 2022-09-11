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
import { useRouter } from "next/router";
import { useState } from "react";
import isEmail from "validator/lib/isEmail";
import Clouds from "../../components/clouds";
import { Logo } from "../../components/logo";
import { NEXT_AUTH_ERRORS } from "../../lib/errors";

const icon = {
  Facebook: <Facebook />,
  Google: <Google />,
};

export default function SignIn({ providers, csrfToken }) {
  const [emailSignInLoading, setEmailSignInLoading] = useState(false);
  const { query } = useRouter();

  const error = query["error"];

  return (
    <>
      {error ? (
        <Layer position="top" modal={false}>
          <Box
            gap="medium"
            pad="medium"
            width={"100vw"}
            align="center"
            background="status-critical"
          >
            {NEXT_AUTH_ERRORS[error]
              ? NEXT_AUTH_ERRORS[error]
              : NEXT_AUTH_ERRORS.Default}
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
                <>
                  {/* https://next-auth.js.org/configuration/pages#email-sign-in */}
                  <form method="post" action="/api/auth/signin/email">
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
                              message: "Insira um e-mail válido",
                            };
                          }
                        },
                      ]}
                    >
                      <TextInput
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Seu e-email"
                      />
                    </FormField>
                    <Button
                      style={{
                        minWidth: "18.75rem",
                      }}
                      icon={
                        emailSignInLoading ? <Spinner size="xsmall" /> : null
                      }
                      label={
                        emailSignInLoading
                          ? "Enviando..."
                          : "Enviar e-mail com link de login"
                      }
                      type="submit"
                      fill="horizontal"
                      primary
                      onClick={() => setEmailSignInLoading(true)}
                    />
                  </form>
                  <hr />
                </>
              );
            }

            return (
              <Button
                key={provider.name}
                style={{
                  width: "100%",
                }}
                onClick={() => signIn(provider.id)}
                icon={icon[provider.name]}
                label={`Entre com ${provider.name}`}
                primary
              />
            );
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
    context.res.writeHead(302, { Location: "/" });
    context.res.end();

    return { props: {} };
  }

  return {
    props: { providers, csrfToken: await getCsrfToken(context) },
  };
}
