import { getAuthProps } from "../lib/auth";
import { logError } from "../lib/o11y";
import Head from "next/head";
import Dashboard from "../components/dashboard";
import { Box, Heading } from "grommet";
import { Heatmap } from "../components/heatmap";
import { BRAND_HEX } from "../lib/config";
import { getDreamRecords } from "../lib/db/reads";
import format from "date-fns/format";
import { DATE_FORMAT } from "../components/heatmap/constants";

export default function InsightsPage(props) {
  const { serverSession, records: rawRecords } = props;

  const records = JSON.parse(rawRecords);

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
            data={records}
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

    const results = await getDreamRecords(email);

    const records = results.reduce(
      (acc, cur) => {
        const curYear = new Date(cur.createdAt).getFullYear();
        const curDate = format(new Date(cur.createdAt), DATE_FORMAT);

        const sameYearIndex = acc.years.findIndex(
          (year) => year.year === curYear
        );
        const sameDateIndex = acc.records.findIndex(
          (record) => record.date === curDate
        );

        if (sameYearIndex > -1) {
          const sameYear = acc.years[sameYearIndex];

          acc.years[sameYearIndex] = {
            ...sameYear,
            total: sameYear.total + 1,
          };
        } else {
          acc.years.push({
            year: curYear,
            total: 1,
            range: {
              start: format(new Date(curYear, 0, 1), DATE_FORMAT),
              end: format(new Date(curYear, 11, 31), DATE_FORMAT),
            },
          });
        }

        if (sameDateIndex > -1) {
          const sameDate = acc.records[sameDateIndex];

          acc.records[sameDateIndex] = {
            ...sameDate,
            count: sameDate.count + 1,
          };
        } else {
          acc.records.push({
            date: curDate,
            count: 1,
          });
        }

        return acc;
      },
      {
        years: [],
        records: [],
      }
    );

    return { props: { ...authProps.props, records: JSON.stringify(records) } };
  } catch (error) {
    logError({
      ...error,
      service: "web",
      pathname: "/insights",
      component: "InsightsPage",
    });
  }
}
