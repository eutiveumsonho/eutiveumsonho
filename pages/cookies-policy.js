import { PageContent } from "grommet";
import Head from "next/head";
import Layout from "../components/layout";
import { getAuthProps } from "../lib/auth";
import { logReq } from "../lib/middleware";
import { getUserAgentProps } from "../lib/user-agent";

export default function Home(props) {
  const { serverSession: rawServerSession, deviceType } = props;

  const serverSession = JSON.parse(rawServerSession);

  return (
    <Layout serverSession={serverSession} deviceType={deviceType}>
      <Head>
        <title>Política de Cookies</title>
        <meta
          name="description"
          content="Política de Cookies de eutiveumsonho"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageContent
        justify="center"
        align="center"
        flex
        style={{
          minHeight: "100vh",
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: `<a href="https://www.iubenda.com/privacy-policy/26392272/cookie-policy" class="iubenda-embed iub-no-markup iub-body-embed" title="Política de Cookies"></a><script type="text/javascript">(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);</script>`,
          }}
        />
      </PageContent>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);
  logReq(context.req, context.res);

  if (authProps.props.serverSession) {
    return {
      props: {
        ...getUserAgentProps(context),
      },
    };
  }

  return {
    props: {
      serverSession: JSON.stringify(authProps.props.serverSession),
      ...getUserAgentProps(context),
    },
  };
}