import { getAuthProps } from "../lib/auth";
import { getDreams } from "../lib/db/reads";
import MyDreamsPage from "../containers/my-dreams";
import { logError } from "../lib/o11y";
import Head from "next/head";

export default function MyDreams(props) {
  const { serverSession, data: rawData } = props;

  const data = JSON.parse(rawData);

  return (
    <>
      <Head>
        <title>Meus sonhos</title>
      </Head>
      <MyDreamsPage serverSession={serverSession} data={data} />
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
