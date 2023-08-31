import { Button, Heading, PageContent } from "grommet";
import Head from "next/head";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import Layout from "../components/layout";
import { logWarn } from "../lib/o11y";

export default function Custom404(props) {
  const { deviceType } = props;
  const { push } = useRouter();

  logWarn({
    error_name: "404ComponentRendered",
    service: "web",
    component: "Custom404",
  });

  return (
    <Layout deviceType={deviceType}>
      <Head>
        <title>Não encontrado</title>
      </Head>
      <PageContent
        justify="center"
        align="center"
        flex
        pad="large"
        style={{
          minHeight: "70vh",
        }}
      >
        <Heading>Oooops! Página não encontrada</Heading>
        <Button
          label="Ir pra página inicial"
          style={{
            marginBottom: "2rem",
          }}
          onClick={() => push("/")}
        />

        <Image src={"/images/states/404.svg"} width={540} height={540} />
      </PageContent>
    </Layout>
  );
}
