import { getAuthProps } from "../lib/auth";
import { logError } from "../lib/o11y";
import Head from "next/head";
import Empty from "../components/empty";
import Dashboard from "../components/dashboard";
import { Box, Distribution, Heading, Text } from "grommet";
import { Heatmap } from "../components/heatmap";
import { BRAND_HEX } from "../lib/config";
import { getDreamRecords } from "../lib/db/reads";
import format from "date-fns/format";
import { DATE_FORMAT } from "../components/heatmap/constants";
import Tip from "../components/tip";

export default function InsightsPage(props) {
  const { serverSession, data: rawData } = props;

  const data = JSON.parse(rawData);

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
          {data?.heatmap?.years?.length > 0 &&
          data?.heatmap?.records?.length > 0 ? (
            <>
              <Heading size="small" level={2}>
                A sua frequência de sonhos
              </Heading>
              <Heatmap
                data={data.heatmap}
                blockSize={14}
                blockMargin={8}
                color={BRAND_HEX}
                fontSize={14}
              />

              {data?.wordFrequencyDistribution ? (
                <>
                  <Heading size="small" level={2}>
                    As palavras mais frequentes em seus sonhos
                  </Heading>
                  <Distribution
                    basis="medium"
                    fill
                    values={data?.wordFrequencyDistribution}
                  >
                    {(value) => (
                      <Tip content={`${value.word}: ${value.frequency}`}>
                        <Box pad="xsmall" background={BRAND_HEX} fill>
                          <Text
                            size="xsmall"
                            style={{
                              overflowWrap: "break-word",
                            }}
                          >
                            {value.word}: {value.frequency}
                          </Text>
                        </Box>
                      </Tip>
                    )}
                  </Distribution>
                  <Box
                    style={{
                      height: "5rem",
                    }}
                  />
                </>
              ) : null}
            </>
          ) : (
            <Empty
              empty={{
                label: "Adicione seu primeiro sonho",
                description: "Os insights dos seus sonhos aparecerão aqui 💡",
                actionRoute: "/publicar",
              }}
            />
          )}
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

    const { heatmap, wordFrequencyDistribution } = results.reduce(
      (acc, cur) => {
        // heatmap data handling
        const curYear = new Date(cur.createdAt).getFullYear();
        const curDate = format(new Date(cur.createdAt), DATE_FORMAT);

        const sameYearIndex = acc.heatmap.years.findIndex(
          (year) => year.year === curYear
        );
        const sameDateIndex = acc.heatmap.records.findIndex(
          (record) => record.date === curDate
        );

        if (sameYearIndex > -1) {
          const sameYear = acc.heatmap.years[sameYearIndex];

          acc.heatmap.years[sameYearIndex] = {
            ...sameYear,
            total: sameYear.total + 1,
          };
        } else {
          acc.heatmap.years.push({
            year: curYear,
            total: 1,
            range: {
              start: format(new Date(curYear, 0, 1), DATE_FORMAT),
              end: format(new Date(curYear, 11, 31), DATE_FORMAT),
            },
          });
        }

        if (sameDateIndex > -1) {
          const sameDate = acc.heatmap.records[sameDateIndex];

          acc.heatmap.records[sameDateIndex] = {
            ...sameDate,
            count: sameDate.count + 1,
          };
        } else {
          acc.heatmap.records.push({
            date: curDate,
            count: 1,
          });
        }

        // wordFrequency data handling
        const topRelevantFreqObjs = cur.wordFrequency.slice(0, 9);

        for (const topRelevantFreqObj of topRelevantFreqObjs) {
          const freqObjIndex = acc.wordFrequencyDistribution.findIndex(
            (freqObj) => freqObj.word === topRelevantFreqObj.word
          );

          if (freqObjIndex > -1) {
            const freqObj = acc.wordFrequencyDistribution[freqObjIndex];
            acc.wordFrequencyDistribution[freqObjIndex] = {
              ...freqObj,
              frequency: freqObj.frequency + topRelevantFreqObj.frequency,
            };
          } else {
            acc.wordFrequencyDistribution.push(topRelevantFreqObj);
          }
        }

        return acc;
      },
      {
        heatmap: { years: [], records: [] },
        wordFrequencyDistribution: [],
      }
    );

    const sortedWordFrequencyDistribution = wordFrequencyDistribution.sort(
      function (a, b) {
        return a.frequency > b.frequency
          ? -1
          : b.frequency > a.frequency
          ? 1
          : 0;
      }
    );

    const cumulativeFrequency = sortedWordFrequencyDistribution.reduce(
      (acc, cur) => acc + cur.frequency,
      0
    );

    const wordFrequencyDistributionData = sortedWordFrequencyDistribution.map(
      (freqObj) => {
        const value = (freqObj.frequency / cumulativeFrequency) * 100;

        return {
          ...freqObj,
          value,
        };
      }
    );

    return {
      props: {
        ...authProps.props,
        data: JSON.stringify({
          heatmap,
          wordFrequencyDistribution: wordFrequencyDistributionData.slice(0, 14),
        }),
      },
    };
  } catch (error) {
    logError({
      ...error,
      service: "web",
      pathname: "/insights",
      component: "InsightsPage",
    });
  }
}
