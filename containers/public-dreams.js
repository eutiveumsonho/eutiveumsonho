import { Avatar, Box, Heading, Paragraph, Spinner, Text } from "grommet";
import Dashboard from "../components/dashboard";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { BRAND_HEX } from "../lib/config";
import VisibilityIcon from "../components/visbility-icon";
import Search from "../components/search";
import { useEffect, useState } from "react";
import { searchDreams } from "../lib/api";
import "dayjs/locale/pt-br";

dayjs.extend(LocalizedFormat);

export default function PublicDreams(props) {
  const { serverSession, data } = props;
  const [selectedTags, setSelectedTags] = useState([]);
  const [searching, setSearching] = useState(false);
  const [dreams, setDreams] = useState([]);

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
        {dreams.map((item) => {
          return (
            <Box
              key={item.createdAt}
              direction="row"
              justify="between"
              style={{
                borderBottom: `1px solid ${BRAND_HEX}`,
              }}
            >
              <Box direction="row" justify="center" align="center">
                <Paragraph>{item.dream.text}</Paragraph>
              </Box>
              <Box justify="center" align="center">
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
            </Box>
          );
        })}
      </Box>
      <Box pad="medium">
        <div>
          <Heading size="small">Sonhos recentes</Heading>
          {data.map((item) => {
            return (
              <Box
                key={item.createdAt}
                direction="row"
                justify="between"
                style={{
                  borderBottom: `1px solid ${BRAND_HEX}`,
                }}
              >
                <Box direction="row" justify="center" align="center">
                  <Paragraph>{item.dream.text}</Paragraph>
                </Box>
                <Box justify="center" align="center">
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
              </Box>
            );
          })}
        </div>
      </Box>
    </Dashboard>
  );
}
