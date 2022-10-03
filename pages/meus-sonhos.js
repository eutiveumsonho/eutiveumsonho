import { getAuthProps } from "../lib/auth";
import { getDreams } from "../lib/db/reads";
import { logError } from "../lib/o11y";
import Dreams from "../containers/dreams";
import Head from "next/head";

export default function MyDreams(props) {
  const { serverSession, data: rawData } = props;

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
        page="meus-sonhos"
        empty={{
          label: "Adicione seu primeiro sonho",
          actionRoute: "/publicar",
          description: "Os seus sonhos serão listados aqui.",
        }}
      />
    </>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);

  if (!authProps.props.serverSession || !authProps.props.serverSession?.user) {
    const { res } = context;
    res.setHeader("location", "/auth/signin");
    res.statusCode = 302;
    res.end();
  }

  try {
    const { email } = authProps.props.serverSession.user;

    const data = await getDreams(email);

    return { props: { ...authProps.props, data: JSON.stringify(data) } };
  } catch (error) {
    logError({
      ...error,
      service: "web",
      pathname: "/meus-sonhos",
      component: "MyDreams",
    });
  }
}
