import { Box, Heading, ResponsiveContext, Text } from "grommet";
import Dashboard from "../components/dashboard";
import { useContext, useState } from "react";
import { unstarPost } from "../lib/api";
import { truncate } from "../lib/strings";
import { useRouter } from "next/router";
import { BRAND_HEX } from "../lib/config";
import Empty from "../components/empty";
import DreamFooter from "../components/dream/footer";
import { useTranslation } from "next-i18next";
import { DreamHeader } from "../components/dream/header";

export default function SavedDreams(props) {
  const { serverSession, data, title, empty, deviceType } = props;
  const { push, locale } = useRouter();
  const size = useContext(ResponsiveContext);
  const [unstarreds, setUnstarreds] = useState([]);

  return (
    <Dashboard serverSession={serverSession} deviceType={deviceType}>
      <Box pad="medium">
        <Heading size="small">{title}</Heading>
        {data.length === 0 || unstarreds.length === data.length ? (
          <Empty empty={empty} />
        ) : null}
        {data.map((item, index) => {
          return (
            <SavedDream
              key={item.createdAt}
              item={item}
              index={index}
              data={data}
              push={push}
              size={size}
              unstarreds={unstarreds}
              setUnstarreds={setUnstarreds}
              locale={locale}
            />
          );
        })}
      </Box>
    </Dashboard>
  );
}

function SavedDream(props) {
  const { item, index, data, push, size, unstarreds, setUnstarreds, locale } =
    props;
  const [eagerStarCount, setEagerStarCount] = useState(item?.starCount ?? 0);
  const [updatingStarCount, setUpdatingStarCount] = useState(false);
  const { t } = useTranslation("dashboard");

  const unstar = async () => {
    setUpdatingStarCount(true);
    await unstarPost({ dreamId: item._id });
    setEagerStarCount(eagerStarCount - 1);
    setUpdatingStarCount(false);
    setUnstarreds([...unstarreds, item._id]);
  };

  if (unstarreds.includes(item._id)) {
    return null;
  }

  return (
    <Box
      key={item.createdAt}
      direction="column"
      style={{
        borderBottom:
          index + 1 === data.length ? "unset" : `1px solid rgba(0, 0, 0, 0.33)`,
      }}
    >
      <DreamHeader item={item} locale={locale} />
      <Box
        direction="column"
        align="center"
        pad={{
          top: "medium",
          bottom: "medium",
          right: size,
          left: size,
        }}
        hoverIndicator={{
          background: "background-contrast",
          elevation: "medium",
        }}
        onClick={() => {
          push(`/${locale}/dreams/${item._id}`);
        }}
      >
        <div
          style={{
            alignSelf: "start",
          }}
          dangerouslySetInnerHTML={{
            __html:
              item.dream.html.length > 400
                ? truncate(item.dream.html, 400, true)
                : item.dream.html,
          }}
        />
        {item.dream.html.length > 400 ? (
          <Text size="small">{t("click-to-read-more")}</Text>
        ) : null}
      </Box>
      <DreamFooter
        item={item}
        commentCount={0}
        updatingStarCount={updatingStarCount}
        unstar={unstar}
        canUnstar={true}
        color={BRAND_HEX}
      />
    </Box>
  );
}
