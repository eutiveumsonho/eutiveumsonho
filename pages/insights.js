import { getAuthProps } from "../lib/auth";
import { logError } from "../lib/o11y";
import Head from "next/head";
import Dashboard from "../components/dashboard";
import { Box, Heading, Text } from "grommet";
import { Heatmap } from "../components/heatmap";
import { BRAND_HEX } from "../lib/config";

export default function InsightsPage(props) {
  const { serverSession } = props;

  const data = {
    years: [
      {
        year: "2022",
        total: 14,
        range: {
          start: "2022-01-01",
          end: "2022-06-01",
        },
      },
    ],
    contributions: [
      {
        date: "2022-01-01",
        count: 1,
        color: "#7E4CDB",
        intensity: 1,
      },
      {
        date: "2022-01-01",
        count: 1,
        color: "#7E4CDB",
        intensity: 1,
      },
      {
        date: "2022-02-01",
        count: 1,
        color: "#7E4CDB",
        intensity: 1,
      },
      {
        date: "2022-03-01",
        count: 1,
        color: "#7E4CDB",
        intensity: 1,
      },
      {
        date: "2022-04-01",
        count: 1,
        color: "#7E4CDB",
        intensity: 1,
      },
      {
        date: "2022-05-01",
        count: 1,
        color: "#7E4CDB",
        intensity: 1,
      },
      {
        date: "2022-05-02",
        count: 1,
        color: "#7E4CDB",
        intensity: 1,
      },
      {
        date: "2022-05-05",
        count: 1,
        color: "#7E4CDB",
        intensity: 1,
      },
      {
        date: "2022-05-08",
        count: 1,
        color: "#7E4CDB",
        intensity: 1,
      },
      {
        date: "2022-05-11",
        count: 1,
        color: "#7E4CDB",
        intensity: 1,
      },
      {
        date: "2022-05-14",
        count: 1,
        color: "#7E4CDB",
        intensity: 1,
      },
      {
        date: "2022-05-20",
        count: 1,
        color: "#7E4CDB",
        intensity: 1,
      },
    ],
  };

  return (
    <>
      <Head>
        <title>Insights</title>
      </Head>
      <Dashboard serverSession={serverSession}>
        <Box pad="medium">
          <Heading size="small" level={1}>
            Insights
          </Heading>
          <Heading size="small" level={2}>
            A sua frequência de sonhos
          </Heading>
          <Heatmap
            data={data}
            blockSize={14}
            blockMargin={8}
            color={BRAND_HEX}
            fontSize={14}
          />
        </Box>
      </Dashboard>
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

    return { props: { ...authProps.props } };
  } catch (error) {
    logError({
      ...error,
      service: "web",
      pathname: "/insights",
      component: "InsightsPage",
    });
  }
}
