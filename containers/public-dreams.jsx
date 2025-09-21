import { Box, Heading, ResponsiveContext, Spinner, Text } from "grommet";
import Dashboard from "../components/dashboard";
import Search from "../components/search";
import { useContext, useEffect, useState } from "react";
import { searchPosts, starPost, unstarPost } from "../lib/api";
import { truncate } from "../lib/strings";
import { useRouter } from "next/router";
import { BRAND_HEX } from "../lib/config";
import DreamFooter from "../components/dream/footer";
import { useTranslation } from "next-i18next";
import { DreamHeader } from "../components/dream/header";
import Pagination from "../components/pagination";

export default function PublicDreams(props) {
  const { serverSession, data, stars, pagination, title, deviceType } = props;
  const [selectedTags, setSelectedTags] = useState([]);
  const [searching, setSearching] = useState(false);
  const [dreams, setDreams] = useState([]);
  const { push } = useRouter();
  const size = useContext(ResponsiveContext);
  const { t } = useTranslation("dashboard");

  useEffect(() => {
    if (!selectedTags || selectedTags.length === 0) {
      setDreams([]);
      return;
    }

    search(selectedTags);
  }, [selectedTags]);

  const search = async (query) => {
    setSearching(true);
    const result = await searchPosts(query);
    setSearching(false);

    setDreams(result);
  };

  return (
    <Dashboard serverSession={serverSession} deviceType={deviceType}>
      <Box pad="medium">
        <Heading size="small">
          <Box direction="row" gap="small" align="center">
            {t("search")} {searching ? <Spinner /> : null}
          </Box>
        </Heading>
        <Search
          suggestions={[]}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />
        {dreams.map((item, index) => {
          return (
            <PublicDream
              key={item.createdAt}
              item={item}
              index={index}
              data={data}
              push={push}
              size={size}
              starred={stars.find((star) => star.dreamId === item._id)}
            />
          );
        })}
      </Box>
      <Box pad="medium">
        <div>
          <Heading size="small">{title}</Heading>
          {data.map((item, index) => {
            return (
              <PublicDream
                key={item.createdAt}
                item={item}
                index={index}
                data={data}
                push={push}
                size={size}
                starred={stars.find((star) => star.dreamId === item._id)}
              />
            );
          })}
        </div>
        {pagination && <Pagination pagination={pagination} />}
      </Box>
    </Dashboard>
  );
}

function PublicDream(props) {
  const { item, index, data, push, size } = props;
  const [eagerStarCount, setEagerStarCount] = useState(item?.starCount ?? 0);
  const [starred, setStarred] = useState(props.starred);
  const [updatingStarCount, setUpdatingStarCount] = useState(false);
  const { locale } = useRouter();
  const { t } = useTranslation("dashboard");

  const star = async () => {
    setUpdatingStarCount(true);
    await starPost({ dreamId: item._id });
    setStarred(true);
    setEagerStarCount(eagerStarCount + 1);
    setUpdatingStarCount(false);
  };

  const unstar = async () => {
    setUpdatingStarCount(true);
    await unstarPost({ dreamId: item._id });
    setStarred(false);
    setEagerStarCount(eagerStarCount - 1);
    setUpdatingStarCount(false);
  };

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
              item.dream.html?.length > 400
                ? truncate(item.dream.html, 400, true)
                : item.dream.html,
          }}
        />
        {item.dream.html?.length > 400 ? (
          <Text size="small">{t("click-to-read-more")}</Text>
        ) : null}
      </Box>
      <DreamFooter
        commentCount={item?.commentCount ?? 0}
        starCount={eagerStarCount}
        updatingStarCount={updatingStarCount}
        unstar={unstar}
        item={item}
        star={star}
        canUnstar={starred}
        color={starred ? BRAND_HEX : "dark-2"}
      />
    </Box>
  );
}
