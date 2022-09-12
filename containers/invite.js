import Head from "next/head";
import { Box, Button, Heading, PageContent, WorldMap } from "grommet";
import Layout from "../components/layout";
import { useRouter } from "next/router";

export default function Invite() {
  const { push } = useRouter();

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
        <Box
          style={{
            zIndex: 1,
          }}
        >
          <div>
            <Button
              primary
              label="Quero fazer parte"
              onClick={() => push("/auth/signin")}
            />
          </div>
        </Box>
      </PageContent>
    </Layout>
  );
}
