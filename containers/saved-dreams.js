import { Avatar, Box, Heading, ResponsiveContext, Text } from "grommet";
import Dashboard from "../components/dashboard";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import VisibilityIcon from "../components/visbility-icon";
import { useContext, useState } from "react";
import { unstarDream } from "../lib/api";
import { truncate } from "../lib/strings";
import { useRouter } from "next/router";
import { BRAND_HEX } from "../lib/config";
import Empty from "../components/empty";
import "dayjs/locale/pt-br";
import DreamFooter from "../components/dream/footer";

dayjs.extend(LocalizedFormat);

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

  const unstar = async () => {
    setUpdatingStarCount(true);
    await unstarDream({ dreamId: item._id });
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
      <Box justify="center" align="center" pad="small" gap="small">
        <Text size="xsmall">
          {item.visibility === "anonymous" ? (
            <VisibilityIcon option="anonymous" />
          ) : (
            <Box direction="column" justify="center" align="center">
              <Avatar src={item.user.image} size="small" />
              {item.user.name}
            </Box>
          )}
        </Text>
        <Text size="xsmall">
          {dayjs(item.createdAt).locale("pt-br").format("LL")}
        </Text>
      </Box>
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
          <Text size="small">Clique para ler mais</Text>
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
