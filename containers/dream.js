import dayjs from "dayjs";
import {
  Avatar,
  Box,
  Button,
  Heading,
  PageContent,
  Spinner,
  Text,
  TextArea,
} from "grommet";
import VisibilityIcon from "../components/visbility-icon";
import Layout from "../components/layout";
import Dashboard from "../components/dashboard";
import { truncate } from "../lib/strings";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { useRouter } from "next/router";
import { Return } from "grommet-icons";
import { useState } from "react";
import { createComment } from "../lib/api";
import "dayjs/locale/pt-br";

dayjs.extend(LocalizedFormat);

export default function DreamContainer(props) {
  const { serverSession, data, comments } = props;
  const { back, push } = useRouter();

  if (!serverSession) {
    return (
      <Layout serverSession={serverSession}>
        <PageContent justify="center" align="center" flex>
          <Dream data={data} />
          <Comments mustSignIn comments={comments} push={push} />
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
        <Comments
          dreamId={data._id}
          comments={comments}
          push={push}
          serverSession={serverSession}
        />
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

function Comments(props) {
  const { mustSignIn, dreamId, comments, push, serverSession } = props;
  const [value, setValue] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [eagerComments, setEagerComments] = useState(comments);

  const onChange = (event) => setValue(event.target.value);

  const onClick = async () => {
    if (mustSignIn) {
      push("/auth/sigin");
      return;
    }

    setCommenting(true);
    const { success } = await createComment({ comment: value, dreamId });

    if (success) {
      setEagerComments([
        ...eagerComments,
        {
          text: value,
          userImage: serverSession.user.image,
          userName: serverSession.user.name,
          createdAt: new Date().toISOString(),
        },
      ]);
    }

    setCommenting(false);
    setValue(undefined);
  };

  return (
    <Box
      style={{
        borderTop: "1px solid rgba(0, 0, 0, 0.33)",
      }}
      pad={{
        bottom: "xlarge",
      }}
    >
      <Heading size="small" level={2}>
        Comentários
      </Heading>
      <Box
        gap="small"
        align="end"
        pad={{
          bottom: "large",
        }}
      >
        <TextArea
          value={value}
          onChange={onChange}
          placeholder="Escreva um comentário"
        />
        <Box direction="row" gap="small">
          <Button
            icon={commenting ? <Spinner size="xsmall" /> : null}
            label={mustSignIn ? "Entre para comentar" : "Comentar"}
            disabled={!value || mustSignIn || commenting}
            onClick={onClick}
          />
        </Box>
      </Box>
      <Box
        gap="medium"
        pad={{
          bottom: "xlarge",
        }}
      >
        {eagerComments.map((comment, index) => {
          return (
            <Box
              key={truncate(comment.text, 10, false)}
              direction="column"
              justify="start"
              align="start"
              gap="small"
              pad={{
                top: "medium",
                bottom: "medium",
              }}
              style={{
                borderBottom:
                  eagerComments.length - 1 === index
                    ? "unset"
                    : "1px solid rgba(0, 0, 0, 0.33)",
              }}
            >
              <Box gap="small">
                <Box direction="row" gap="small">
                  <Avatar src={comment.userImage} size="small" />
                  <Text>
                    <b>{comment.userName}</b>
                  </Text>
                </Box>
                <Text size="xsmall">
                  {dayjs(comment.createdAt).locale("pt-br").format("LL")}
                </Text>
              </Box>
              <Text>{comment.text}</Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
