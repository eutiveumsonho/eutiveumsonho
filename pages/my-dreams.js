import { getAuthProps } from "../lib/auth";
import { getDreams } from "../lib/db/reads";
import { logError } from "../lib/o11y";
import Dreams from "../containers/dreams";
import Head from "next/head";
import { logReq } from "../lib/middleware";
import { getUserAgentProps } from "../lib/user-agent";

export default function MyDreams(props) {
  const { serverSession: rawServerSession, data: rawData } = props;

  const serverSession = JSON.parse(rawServerSession);
  const data = JSON.parse(rawData);

  return (
    <>
      <Head>
        <title>Meus sonhos</title>
      </Head>
      <Dreams
        serverSession={serverSession}
        data={data}
        title="Meus sonhos"
        page="my-dreams"
        empty={{
          label: "Adicione seu primeiro sonho",
          actionRoute: "/publish",
          description: "Os seus sonhos serão listados aqui 📚",
        }}
      />
    </>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);
  logReq(context.req, context.res);

  if (!authProps.props.serverSession || !authProps.props.serverSession?.user) {
    const { res } = context;
    res.setHeader("location", "/auth/signin");
    res.statusCode = 302;
    res.end();
  }

  try {
    const { email } = authProps.props.serverSession.user;

    const data = await getDreams(email);

    return {
      props: {
        serverSession: JSON.stringify(authProps.props.serverSession),
        data: JSON.stringify(data),
        ...getUserAgentProps(context),
      },
    };
  } catch (error) {
    logError({
      error,
      service: "web",
      pathname: "/my-dreams",
      component: "MyDreams",
    });
  }
}
