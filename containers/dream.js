import dayjs from "dayjs";
import { Avatar, Box, Button, Heading, PageContent, Text } from "grommet";
import VisibilityIcon from "../components/visbility-icon";
import Layout from "../components/layout";
import Dashboard from "../components/dashboard";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/pt-br";
import { useRouter } from "next/router";
import { Return } from "grommet-icons";

dayjs.extend(LocalizedFormat);

export default function DreamContainer(props) {
  const { serverSession, data } = props;
  const { back } = useRouter();

  if (!serverSession) {
    return (
      <Layout serverSession={serverSession}>
        <PageContent justify="center" align="center" flex>
          <Dream data={data} />
        </PageContent>
      </Layout>
    );
  }

  return (
    <Dashboard serverSession={serverSession}>
      <Box pad="medium">
        <Box
          style={{
            padding: 0,
          }}
          gap="small"
          direction="row"
          align="center"
        >
          <Button icon={<Return />} hoverIndicator onClick={() => back()} />
          <Heading size="small">Retonar</Heading>
        </Box>
        <Dream data={data} />
      </Box>
    </Dashboard>
  );
}

function Dream(props) {
  const { data } = props;

  return (
    <Box key={data.createdAt} direction="column">
      <Box justify="center" align="center" pad="small" gap="small">
        <Text size="xsmall">
          {data.visibility === "anonymous" || data.visibility === "private" ? (
            <VisibilityIcon option={data.visibility} />
          ) : (
            <Box direction="column" justify="center" align="center">
              <Avatar src={data.user.image} size="small" />
              {data.user.name}
            </Box>
          )}
        </Text>
        {data.visibility === "private" ? (
          <Text size="xsmall">
            <i>Só você pode ver este sonho.</i>
          </Text>
        ) : null}
        <Text size="xsmall">
          {dayjs(data.createdAt).locale("pt-br").format("LL")}
        </Text>
      </Box>
      <Box direction="row" justify="between" align="center">
        <Box direction="row" align="center" pad="medium">
          <Text
            dangerouslySetInnerHTML={{
              __html: data.dream.html,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
