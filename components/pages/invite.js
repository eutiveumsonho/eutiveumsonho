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
} from "grommet";
import { Mail } from "grommet-icons";
import isEmail from "validator/lib/isEmail";

import Layout from "../layout";
import { sendWaitListInviteMail } from "../../lib/api";

export default function Invite() {
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

  return (
    <Layout>
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
          paddingBottom: "3rem",
          paddingTop: "3rem",
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
