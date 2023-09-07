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
import { logReq } from "../lib/middleware";
import { getUserAgentProps } from "../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

export default function InsightsPage(props) {
  const { serverSession: rawServerSession, data: rawData, deviceType } = props;

  const serverSession = JSON.parse(rawServerSession);
  const data = JSON.parse(rawData);

  const { t } = useTranslation(["dashboard", "heatmap"]);
  const { locale } = useRouter();

  const heatmapI18n = {
    loading: t("heatmap:loading"),
    lastYear: t("heatmap:last-year"),
    soFar: t("heatmap:so-far"),
    error: t("heatmap:error"),
    records: {
      plural: t("heatmap:records-plural"),
      singular: t("heatmap:records-singular"),
    },
    on: t("heatmap:on"),
    locale,
  };

  return (
    <>
      <Head>
        <title>{t("insights")}</title>
      </Head>
      <Dashboard serverSession={serverSession} deviceType={deviceType}>
        <Box pad="medium">
          <Heading size="small" level={1}>
            {t("insights")}
          </Heading>
          {data?.heatmap?.years?.length > 0 &&
          data?.heatmap?.records?.length > 0 ? (
            <>
              <Heading size="small" level={2}>
                {t("your-dream-frequency")}
              </Heading>
              <Heatmap
                data={data.heatmap}
                blockSize={14}
                blockMargin={8}
                color={BRAND_HEX}
                fontSize={14}
                i18n={heatmapI18n}
              />

              {data?.wordFrequencyDistribution ? (
                <>
                  <Heading size="small" level={2}>
                    {t("most-frequent-words")}
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
                label: t("add-first-dream"),
                description: `${t("insights-listed-here")} 💡`,
                actionRoute: `/${locale}/publish`,
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
  logReq(context.req, context.res);

  if (!authProps.props.serverSession || !authProps.props.serverSession?.user) {
    const { res } = context;
    res.setHeader("location", `/${context.locale}/auth/signin`);
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
        const topRelevantFreqObjs = cur.wordFrequency;

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
        serverSession: JSON.stringify(authProps.props.serverSession),
        data: JSON.stringify({
          heatmap,
          wordFrequencyDistribution: wordFrequencyDistributionData.slice(0, 14),
        }),
        ...getUserAgentProps(context),
        ...(await serverSideTranslations(context.locale, "dashboard")),
      },
    };
  } catch (error) {
    logError({
      error,
      service: "web",
      pathname: "/insights",
      component: "InsightsPage",
    });
  }
}
