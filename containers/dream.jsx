import dayjs from "dayjs";
import {
  Avatar,
  Box,
  Button,
  Heading,
  Layer,
  PageContent,
  Spinner,
  Text,
  TextArea,
} from "grommet";
import VisibilityIcon from "../components/visbility-icon";
import Layout from "../components/layout";
import Dashboard from "../components/dashboard";
import PostInsightsGraph from "../components/post-insights-graph";
import { truncate } from "../lib/strings";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { useRouter } from "next/router";
import { Return, Trash } from "grommet-icons";
import { useState } from "react";
import { createComment, deleteComment } from "../lib/api";
import Tip from "../components/tip";
import { useTranslation } from "next-i18next";
import "dayjs/locale/pt-br";
import "dayjs/locale/en";
import "dayjs/locale/es";
import "dayjs/locale/fr";

dayjs.extend(LocalizedFormat);

export default function DreamContainer(props) {
  const { serverSession, data, comments, insights, deviceType } = props;
  const { back, push } = useRouter();
  const { t } = useTranslation("dashboard");

  if (!serverSession) {
    return (
      <Layout serverSession={serverSession} deviceType={deviceType}>
        <PageContent justify="center" align="center" flex>
          <Dream data={data} insights={insights} publicView />
          <Comments mustSignIn comments={comments} push={push} />
        </PageContent>
      </Layout>
    );
  }

  return (
    <Dashboard serverSession={serverSession} deviceType={deviceType}>
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
          <Heading size="small">{t("back")}</Heading>
        </Box>
        <Dream data={data} insights={insights} />
        <Comments
          postId={data._id}
          comments={comments}
          push={push}
          serverSession={serverSession}
        />
      </Box>
    </Dashboard>
  );
}

function Dream(props) {
  const { data, insights, publicView } = props;
  const { locale } = useRouter();
  const { t } = useTranslation("dashboard");

  return (
    <Box
      key={data.createdAt}
      direction="column"
      style={{
        maxWidth: publicView ? "43rem" : "unset",
      }}
    >
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
            <i>{t("only-you-can-see")}.</i>
          </Text>
        ) : null}
        <Text size="xsmall">
          {dayjs(data.createdAt).locale(locale).format("LL")}
        </Text>
      </Box>
      <Box direction="row" justify="between" align="center">
        <Box direction="row" align="center" pad="medium">
          <div
            dangerouslySetInnerHTML={{
              __html: data.dream.html,
            }}
          />
        </Box>
      </Box>
      {insights && <PostInsightsGraph insights={insights} />}
    </Box>
  );
}

function Comments(props) {
  const { mustSignIn, postId, comments, push, serverSession } = props;
  const [value, setValue] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [eagerComments, setEagerComments] = useState(comments);
  const [open, setOpen] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState();
  const [deleting, setDeleting] = useState(false);
  const { locale } = useRouter();
  const { t } = useTranslation("dashboard");

  const onChange = (event) => setValue(event.target.value);

  const onClick = async () => {
    if (mustSignIn) {
      push(`/${locale}/auth/signin`);
      return;
    }

    setCommenting(true);
    const { success } = await createComment({
      comment: value,
      dreamId: postId,
    });

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

  const onOpen = (commentId) => {
    setOpen(true);
    setCommentIdToDelete(commentId);
  };

  const onClose = () => {
    setOpen(false);
    setCommentIdToDelete(undefined);
  };

  const delComment = async () => {
    setDeleting(true);
    await deleteComment(commentIdToDelete, postId);
    setDeleting(false);

    setEagerComments(
      eagerComments.filter((comment) => comment._id !== commentIdToDelete)
    );

    onClose();
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
        {t("comments")}
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
          placeholder={t("write-a-comment")}
          maxLength={3000}
          id="comment"
        />
        <Box direction="row" gap="small">
          <Button
            icon={commenting ? <Spinner size="xsmall" /> : null}
            label={mustSignIn ? t("sign-in-to-comment") : t("comment")}
            disabled={!value || commenting}
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
          const isCommentOwner =
            serverSession?.user?.email === comment.userEmail;

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
              <Box
                gap="small"
                style={{
                  minWidth: "100%",
                }}
              >
                <Box
                  direction="row"
                  gap="small"
                  justify={isCommentOwner ? "between" : "start"}
                  align="center"
                >
                  <Box direction="row" gap="small">
                    <Avatar src={comment.userImage} size="small" />
                    <Text>
                      <b>{comment.userName}</b>
                    </Text>
                  </Box>
                  {isCommentOwner ? (
                    <Box>
                      <Tip content={t("delete-comment")}>
                        <Button
                          icon={<Trash />}
                          hoverIndicator
                          onClick={() => onOpen(comment._id)}
                        />
                      </Tip>
                      {open ? (
                        <Layer
                          id="comment-deletion-modal"
                          position="center"
                          onClickOutside={onClose}
                          onEsc={onClose}
                        >
                          <Box pad="medium" gap="small" width="medium">
                            <Heading level={3} margin="none">
                              {t("confirm")}
                            </Heading>
                            <Text>{t("confirm-comment-deletion")}</Text>
                            <Box
                              as="footer"
                              gap="small"
                              direction="row"
                              align="center"
                              justify="end"
                              pad={{ top: "medium", bottom: "small" }}
                            >
                              <Button
                                icon={
                                  deleting ? <Spinner size="xsmall" /> : null
                                }
                                label={
                                  <Text color="white">
                                    {deleting ? (
                                      <strong>{t("deleting")}</strong>
                                    ) : (
                                      <strong>{t("yes-delete")}</strong>
                                    )}
                                  </Text>
                                }
                                onClick={delComment}
                                primary
                                disabled={deleting}
                                color="status-critical"
                              />
                            </Box>
                          </Box>
                        </Layer>
                      ) : null}
                    </Box>
                  ) : null}
                </Box>
                <Text size="xsmall">
                  {dayjs(comment.createdAt).locale(locale).format("LL")}
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
