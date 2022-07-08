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
} from "grommet";
import { Mail } from "grommet-icons";
import isEmail from "validator/lib/isEmail";
import { sendWaitListInviteMail } from "../api/api";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async ({ value }) => {
    setLoading(true);
    const { success } = await sendWaitListInviteMail(value);
    setLoading(false);

    if (success) {
    }
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
        <Heading level={1} size="large">
          Vamos construir a maior comunidade de pessoas sonhadoras do Brasil e
          do mundo?
        </Heading>
        <Heading level={4}>Cadastre o seu email na lista de espera!</Heading>
        <Box>
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
    </>
  );
}
