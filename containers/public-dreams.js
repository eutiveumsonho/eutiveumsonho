import {
  Avatar,
  Box,
  Button,
  Heading,
  Paragraph,
  ResponsiveContext,
  Spinner,
  Text,
} from "grommet";
import Dashboard from "../components/dashboard";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { BRAND_HEX } from "../lib/config";
import VisibilityIcon from "../components/visbility-icon";
import Search from "../components/search";
import { useContext, useEffect, useState } from "react";
import { searchDreams } from "../lib/api";
import "dayjs/locale/pt-br";
import { truncate } from "../lib/strings";
import { useRouter } from "next/router";
import { Chat, Tip } from "grommet-icons";

dayjs.extend(LocalizedFormat);

export default function PublicDreams(props) {
  const { serverSession, data } = props;
  const [selectedTags, setSelectedTags] = useState([]);
  const [searching, setSearching] = useState(false);
  const [dreams, setDreams] = useState([]);
  const { push } = useRouter();
  const size = useContext(ResponsiveContext);

  useEffect(() => {
    if (!selectedTags || selectedTags.length === 0) {
      setDreams([]);
      return;
    }

    search(selectedTags);
  }, [selectedTags]);

  const search = async (query) => {
    setSearching(true);
    const result = await searchDreams(query);
    setSearching(false);

    setDreams(result);
  };

  return (
    <Dashboard serverSession={serverSession}>
      <Box pad="medium">
        <Heading size="small">
          <Box direction="row" gap="small" align="center">
            Pesquisar {searching ? <Spinner /> : null}
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
              item={item}
              index={index}
              data={data}
              push={push}
              size={size}
            />
          );
        })}
      </Box>
      <Box pad="medium">
        <div>
          <Heading size="small">Sonhos recentes</Heading>
          {data.map((item, index) => {
            return (
              <PublicDream
                item={item}
                index={index}
                data={data}
                push={push}
                size={size}
              />
            );
          })}
        </div>
      </Box>
    </Dashboard>
  );
}

function PublicDream(props) {
  const { item, index, data, push, size } = props;

  return (
    <Box
      key={item.createdAt}
      direction="column"
      style={{
        borderBottom:
          index + 1 === data.length ? "unset" : `1px solid rgba(0, 0, 0, 0.33)`,
      }}
      hoverIndicator={{
        background: "background-contrast",
        elevation: "medium",
      }}
      onClick={() => {
        push(`/sonhos/${item._id}`);
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
      >
        <Text
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
      <Box pad="medium" direction="row" gap="small">
        <Button plain icon={<Tip />} badge={item?.commentCount ?? 0} />
      </Box>
    </Box>
  );
}
