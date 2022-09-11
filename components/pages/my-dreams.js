import { Box, Button, Paragraph, Text } from "grommet";
import { Edit } from "grommet-icons";
import { useRouter } from "next/router";
import Dashboard from "../dashboard";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/pt-br";
import { truncate } from "../../lib/strings";
import VisibilityIcon from "../visbility-icon";
import { BRAND_HEX } from "../../lib/config";

dayjs.extend(LocalizedFormat);

export default function MyDreamsPage(props) {
  const { serverSession, data } = props;
  const { push } = useRouter();

  return (
    <Dashboard serverSession={serverSession}>
      <Box pad="medium">
        <div>
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
                  <VisibilityIcon
                    option={item.visibility}
                    style={{
                      marginRight: "1rem",
                    }}
                  />
                  <Paragraph>
                    <span
                      dangerouslySetInnerHTML={{
                        __html:
                          item.dream.text.length > 100
                            ? truncate(item.dream.text, 100, true)
                            : item.dream.text,
                      }}
                    />
                  </Paragraph>
                </Box>
                <Box justify="center" align="center">
                  <Text size="xsmall">
                    {dayjs(item.createdAt).locale("pt-br").format("LL")}
                  </Text>
                  <div
                    style={{
                      height: "0.2rem",
                    }}
                  />
                  <Button
                    icon={<Edit />}
                    hoverIndicator
                    onClick={() => push(`/publicar/${item._id}`)}
                  />
                </Box>
              </Box>
            );
          })}
        </div>
      </Box>
    </Dashboard>
  );
}
