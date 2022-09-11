import { Avatar, Box, Button, Paragraph, Text } from "grommet";
import Dashboard from "../dashboard";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { BRAND_HEX } from "../../lib/config";
import VisibilityIcon from "../visbility-icon";
import "dayjs/locale/pt-br";

dayjs.extend(LocalizedFormat);

export default function PublicDreams(props) {
  const { serverSession, data } = props;

  return (
    <Dashboard serverSession={serverSession}>
      <Box pad="medium">
        <div>
          {data.map((item, index) => {
            return (
              <Box
                key={index}
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
