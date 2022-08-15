import { Box, Button, Card, Heading, Text } from "grommet";
import { useRouter } from "next/router";
import Clouds from "../../components/clouds";
import { Logo } from "../../components/logo";
import { NEXT_AUTH_ERRORS } from "../../lib/errors";

export default function VerifyRequest() {
  const { query } = useRouter();

  const { error: errorCode } = query;

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
        <Card
          pad="large"
          gap="medium"
          align="center"
          background="white"
          style={{
            minWidth: "24rem",
          }}
        >
          <Logo color="black" />
          <Heading
            level={2}
            style={{
              marginBottom: 0,
            }}
          >
            Algo deu errado
          </Heading>
          <Text
            style={{
              marginBottom: "1.5rem",
            }}
          >
            {NEXT_AUTH_ERRORS[errorCode]}
          </Text>
          <Button
            key={"back-to-site"}
            style={{
              width: "100%",
            }}
            onClick={() => push("/")}
            label={"Voltar à tela inicial"}
            primary
          />
        </Card>
      </Box>
    </>
  );
}
