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
import { sendWaitListInviteMail } from "../api/api";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const handleSubmit = async ({ value }) => {
    setLoading(true);
    const { success } = await sendWaitListInviteMail(value);
    setLoading(false);

    setFeedbackMessage(
      success
        ? "Vamos construir a maior comunidade de pessoas sonhadoras, juntos! Cheque o seu email para saber mais sobre o lancamento da plataforma"
        : "Vamos construir a maior comunidade de pessoas sonhadoras, juntos! Em breve, voce recebera um email com mais detalhes sobre a plataforma"
    );
  };

  const onClose = () => {
    setFeedbackMessage(null);
  };

  return (
    <>
      <Head>
        <title>Eu tive um sonho</title>
        <meta name="description" content="O seu repositorio de sonhos." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageContent
        justify="center"
        style={{
          minHeight: "calc(90vh - 11.75rem)",
        }}
      >
        <Box
          style={{
            position: "absolute",
            zIndex: 0,
          }}
          align="center"
          justify="center"
        >
          <WorldMap />
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
          Cadastre o seu email na lista de espera!
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
                      message: "Insira um email valido",
                    };
                  }
                },
              ]}
            >
              <TextInput name="email" icon={<Mail />} placeholder="Seu email" />
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
          status={"normal"}
          title={feedbackMessage}
          onClose={onClose}
        />
      )}
    </>
  );
}
