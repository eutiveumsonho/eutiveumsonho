import { PageContent } from "grommet";
import Head from "next/head";
import Layout from "../components/layout";
import { getAuthProps } from "../lib/auth";

export default function Home(props) {
  const { serverSession } = props;

  return (
    <Layout
      title="Eu tive um sonho"
      subtitle="A maior comunidade conectada por sonhos, do Brasil para o mundo."
      serverSession={serverSession}
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
        <div
          dangerouslySetInnerHTML={{
            __html: `<a href="https://www.iubenda.com/privacy-policy/26392272" class="iubenda-embed iub-no-markup iub-body-embed" title="Política de Privacidade"></a><script type="text/javascript">(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);</script>`,
          }}
        />
      </PageContent>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  return getAuthProps(context);
}
