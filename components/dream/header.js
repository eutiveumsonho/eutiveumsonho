import { Avatar, Box, Text } from "grommet";
import VisibilityIcon from "../visbility-icon";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

import "dayjs/locale/pt-br";
import "dayjs/locale/en";
import "dayjs/locale/es";
import "dayjs/locale/fr";

dayjs.extend(LocalizedFormat);

export function DreamHeader(props) {
  const { item, locale } = props;

  return (
    <Box
      justify="center"
      align="center"
      pad={{
        top: "large",
        bottom: "small",
        left: "small",
        right: "small",
      }}
      gap="small"
    >
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
        {dayjs(item.createdAt).locale(locale).format("LL")}
      </Text>
    </Box>
  );
}
