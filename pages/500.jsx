import { Button, Heading, PageContent } from "grommet";
import Head from "next/head";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import Layout from "../components/layout";

export default function Custom500(props) {
  const { deviceType } = props;
  const { reload } = useRouter();

  console.error({
    error_name: "500ComponentRendered",
    service: "web",
    component: "Custom500",
  });

  return (
    <Layout deviceType={deviceType}>
      <Head>
        <title>Erro</title>
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
        <Heading>
          Oooops! Ocorreu um erro, e nós fomos notificados 😉! Sinta-se a
          vontade para recarregar a página e tentar novamente!
        </Heading>
        <Button
          label="Recarregar a página"
          style={{
            marginBottom: "2rem",
          }}
          onClick={() => reload()}
        />

        <Image src={"/images/states/500.svg"} width={600} height={400} />
      </PageContent>
    </Layout>
  );
}
