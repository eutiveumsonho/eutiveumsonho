import { getAuthProps } from "../lib/auth";
import { getDreams } from "../lib/db/reads";
import { logError } from "../lib/o11y";
import Head from "next/head";

export default function InsightsPage(props) {
  const { serverSession } = props;

  return (
    <>
      <Head>
        <title>Insights</title>
      </Head>
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
      pathname: "/insights",
      component: "InsightsPage",
    });
  }
}
