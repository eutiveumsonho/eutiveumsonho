import { Box, Button, Paragraph, Text } from "grommet";
import { Edit } from "grommet-icons";
import { useRouter } from "next/router";
import Dashboard from "../dashboard";

export default function MyDreamsPage(props) {
  const { serverSession, data } = props;
  const { push } = useRouter();

  return (
    <Dashboard serverSession={serverSession}>
      <Box pad="medium">
        <div>
          {data.map((item) => {
            console.log({ item });

            return (
              <Box direction="row" justify="between">
                <Paragraph>{item.dream.text}</Paragraph>
                <Box>
                  <Text size="xsmall">{item.createdAt}</Text>
                  <Button
                    icon={<Edit />}
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
