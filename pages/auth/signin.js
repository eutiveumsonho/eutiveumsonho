import {
  Box,
  Button,
  Card,
  Form,
  FormField,
  Heading,
  Text,
  TextInput,
} from "grommet";
import { Facebook, Google } from "grommet-icons";
import {
  getCsrfToken,
  getProviders,
  getSession,
  signIn,
} from "next-auth/react";
import Clouds from "../../components/clouds";

const icon = {
  Facebook: <Facebook />,
  Google: <Google />,
};

export default function SignIn({ providers, csrfToken }) {
  return (
    <>
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
        <Card pad="large" gap="medium" align="center" background="white">
          <Heading level={2} size="small">
            Eu tive um sonho
          </Heading>
          <Box width="medium">
            <Form method="post" action="/api/auth/callback/credentials">
              <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
              <FormField
                label="Nome de usuário ou e-mail"
                name="username"
                required
              >
                <TextInput name="username" type="username" />
              </FormField>
              <FormField label="Senha" name="password" required>
                <TextInput name="password" type="password" />
              </FormField>
              <Button
                label="Entre com suas credenciais"
                type="submit"
                fill="horizontal"
                primary
              />
            </Form>
          </Box>
          <Text size="large">ou</Text>
          {Object.values(providers).map((provider) => (
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
          ))}
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

    return {};
  }

  return {
    props: { providers, csrfToken: await getCsrfToken(context) },
  };
}
