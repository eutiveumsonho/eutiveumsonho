import { useState } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Form,
  FormField,
  Heading,
  PageContent,
  Spinner,
  TextInput,
  Notification,
  WorldMap,
  Avatar,
} from "grommet";
import { Mail } from "grommet-icons";
import { signIn, signOut, getSession } from "next-auth/react";
import isEmail from "validator/lib/isEmail";

import Layout from "../components/layout";
import { sendWaitListInviteMail } from "../lib/api";

export default function Home(props) {
  const { user } = props;
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const handleSubmit = async ({ value }) => {
    setLoading(true);
    const { success } = await sendWaitListInviteMail(value);
    setLoading(false);

    setFeedbackMessage(
      success
        ? "Cheque o seu e-mail para saber mais sobre o lançamento da plataforma."
        : "Em breve, você receberá um e-mail com mais detalhes sobre o lançamento da plataforma."
    );
  };

  const onClose = () => {
    setFeedbackMessage(null);
  };

  const renderPageHeaderActions = () => {
    if (!user) {
      return (
        <Box direction="row-responsive" gap="small">
          <Button label="Entrar" onClick={signIn} />
          <Button label="Criar conta" primary />
        </Box>
      );
    }

    return (
      <Box direction="row" gap="small">
        <Avatar src={user.image} />
        <Button label="Sair" onClick={signOut} />
      </Box>
    );
  };

  return (
    <Layout
      title="Eu tive um sonho"
      subtitle="A maior comunidade conectada por sonhos, do Brasil para o mundo."
      pageHeaderActions={renderPageHeaderActions()}
    >
      <Head>
        <title>Eu tive um sonho</title>
        <meta name="description" content="O seu repositório de sonhos." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageContent
        justify="center"
        align="center"
        flex
        style={{
          minHeight: "calc(90vh - 11.75rem)",
        }}
      >
        <Box
          style={{
            position: "absolute",
            zIndex: 0,
            overflow: "hidden",
          }}
          flex
          align="center"
          justify="center"
        >
          <WorldMap
            style={{
              height: "100%",
              width: "auto",
            }}
          />
        </Box>
        <Heading
          level={2}
          size="large"
          style={{
            zIndex: 1,
          }}
        >
          Vamos construir a maior comunidade de pessoas sonhadoras do Brasil e
          do mundo?
        </Heading>
        <Heading
          level={4}
          style={{
            zIndex: 1,
          }}
        >
          Cadastre o seu e-mail na lista de espera!
        </Heading>
        <Box
          style={{
            zIndex: 1,
          }}
        >
          <Form validate="blur" onSubmit={handleSubmit}>
            <FormField
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
                name="email"
                icon={<Mail />}
                placeholder="Seu e-mail"
              />
            </FormField>
            <div>
              <Button
                icon={loading ? <Spinner size="xsmall" /> : null}
                type="submit"
                primary
                label="Quero fazer parte"
              />
            </div>
          </Form>
        </Box>
      </PageContent>
      {feedbackMessage && (
        <Notification
          toast={{
            autoClose: false,
          }}
          title="Vamos construir a maior comunidade de pessoas sonhadoras, juntos!"
          status={"normal"}
          message={feedbackMessage}
          onClose={onClose}
        />
      )}
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      props: { user: null },
    };
  }

  return {
    props: {
      user: session.user,
    },
  };
}
