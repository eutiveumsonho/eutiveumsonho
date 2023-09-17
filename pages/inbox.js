import { getAuthProps } from "../lib/auth";
import { logError } from "../lib/o11y";
import Head from "next/head";
import Dashboard from "../components/dashboard";
import { css } from "@emotion/css";
import {
  Anchor,
  Avatar,
  Box,
  Button,
  CheckBox,
  DataTable,
  Heading,
} from "grommet";
import Empty from "../components/empty";
import { getInbox } from "../lib/db/reads";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { useRouter } from "next/router";
import { Checkmark, StatusGoodSmall, Trash } from "grommet-icons";
import { markInboxMessagesAsRead, deleteInboxMessages } from "../lib/api";
import "dayjs/locale/pt-br";
import { BRAND_HEX } from "../lib/config";
import { logReq } from "../lib/middleware";
import { getUserAgentProps } from "../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import "dayjs/locale/pt-br";
import "dayjs/locale/en";
import "dayjs/locale/es";
import "dayjs/locale/fr";

dayjs.extend(LocalizedFormat);
dayjs.extend(relativeTime);

export default function Inbox(props) {
  const { serverSession: rawServerSession, data: rawData, deviceType } = props;

  const serverSession = JSON.parse(rawServerSession);
  const data = JSON.parse(rawData);

  const { push, locale } = useRouter();
  const { t } = useTranslation("dashboard");
  const [eagerData, setEagerData] = useState(data);
  const [checked, setChecked] = useState([]);

  const empty = {
    description: `${t("no-comments")} 😉`,
    label: t("discover-dreams"),
    actionRoute: `/${locale}/dreams`,
  };

  const onCheck = (event, value) => {
    if (event.target.checked) {
      setChecked([...checked, value]);
    } else {
      setChecked(checked.filter((item) => item !== value));
    }
  };

  const onCheckAll = (event) =>
    setChecked(event.target.checked ? eagerData.map((inbox) => inbox._id) : []);

  const onClick = (path, inboxId) => {
    markInboxMessagesAsRead([inboxId]);
    push(path);
  };

  const onMarkAsRead = async () => {
    const markAllAsRead = eagerData.length === checked.length;
    await markInboxMessagesAsRead(checked, markAllAsRead);

    if (markAllAsRead) {
      setEagerData(eagerData.map((inbox) => ({ ...inbox, read: true })));
      setChecked([]);

      return;
    }

    const updated = eagerData.map((inbox) => {
      if (checked.includes(inbox._id)) {
        return { ...inbox, read: true };
      }

      return inbox;
    });

    setEagerData(updated);
    setChecked([]);
  };

  const onDelete = async () => {
    const deleteAll = eagerData.length === checked.length;

    try {
      await deleteInboxMessages(checked, deleteAll);

      if (deleteAll) {
        setChecked([]);
        setEagerData([]);

        return;
      }

      const nonDeleted = eagerData
        .map((inbox) => {
          if (checked.find((id) => inbox._id === id)) {
            return null;
          }

          return inbox;
        })
        .filter(Boolean);

      setEagerData(nonDeleted);
      setChecked([]);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      property: "read",
      header: "",
      pin: true,
      render: (inbox) => {
        return (
          <Box
            direction="row"
            justify="start"
            align="center"
            className={inbox.read ? "read" : "unread"}
          >
            {!inbox.read ? (
              <StatusGoodSmall
                size="small"
                style={{
                  position: "absolute",
                  left: "-1px",
                }}
              />
            ) : null}
            <CheckBox
              key={inbox._id}
              checked={checked.indexOf(inbox._id) !== -1}
              onChange={(e) => onCheck(e, inbox._id)}
              pad={{
                left: "small",
              }}
            />
          </Box>
        );
      },
      align: "start",
      header: (
        <>
          <Box direction="row" fill gap="small" justify="start">
            <CheckBox
              checked={checked.length === data.length}
              indeterminate={checked.length > 0 && checked.length < data.length}
              onChange={onCheckAll}
              pad={{
                left: "small",
              }}
            />
            <Button
              hoverIndicator
              icon={<Checkmark size="small" />}
              disabled={checked.length === 0}
              onClick={onMarkAsRead}
            />
            <Button
              hoverIndicator
              icon={<Trash size="small" />}
              disabled={checked.length === 0}
              onClick={onDelete}
            />
          </Box>
        </>
      ),
    },
    {
      property: "message",
      align: "start",
      size: "3/4",
      render: (inbox) => {
        const path = `/${locale}/dreams/${inbox.dreamId}${
          inbox.type === "star" ? "" : "#comment"
        }`;

        const message = (
          <>
            {inbox.userName ? inbox.userName : ""}{" "}
            {inbox.type === "star"
              ? t("saved-your-dream")
              : t("commented-your-dream")}
          </>
        );

        return (
          <Box direction="row" gap="medium" justify="start">
            <Avatar
              src={inbox.userImage}
              style={{
                backgroundSize: "100%",
              }}
              size="small"
            />
            <Anchor onClick={() => onClick(path, inbox._id)}>{message}</Anchor>
          </Box>
        );
      },
    },
    {
      property: "date",
      header: "",
      render: (inbox) => dayjs(inbox.createdAt).locale(locale).fromNow(),
      align: "end",
    },
  ];

  return (
    <>
      <Head>
        <title>{t("inbox")}</title>
      </Head>
      <Dashboard serverSession={serverSession} deviceType={deviceType}>
        <Box pad="medium">
          <Heading size="small" level={1}>
            {t("inbox")}
          </Heading>
          {eagerData.length === 0 ? <Empty empty={empty} /> : null}
          {eagerData.length > 0 ? (
            <Box
              style={{
                overflowX: "auto",
              }}
            >
              <Box
                align="center"
                style={{
                  minWidth: "40rem",
                }}
              >
                <DataTable
                  columns={columns}
                  data={eagerData}
                  size="medium"
                  className={css`
                    > tbody > tr {
                      background-color: #ededed;

                      a {
                        color: #999999;
                      }
                    }

                    > tbody > tr:has(div.unread) {
                      background-color: white;

                      a {
                        color: ${BRAND_HEX};
                      }
                    }
                  `}
                />
              </Box>
            </Box>
          ) : null}
        </Box>
      </Dashboard>
    </>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);
  logReq(context.req, context.res);

  if (!authProps.props.serverSession || !authProps.props.serverSession?.user) {
    const { res } = context;
    res.setHeader("location", `/${context.locale}/auth/signin`);
    res.statusCode = 302;
    res.end();
  }

  const data = await getInbox(authProps.props.serverSession.user.email);

  try {
    return {
      props: {
        serverSession: JSON.stringify(authProps.props.serverSession),
        data: JSON.stringify(data),
        ...getUserAgentProps(context),
        ...(await serverSideTranslations(context.locale, [
          "dashboard",
          "common",
        ])),
      },
    };
  } catch (error) {
    logError({
      error,
      service: "web",
      pathname: "/inbox",
      component: "Inbox",
    });
  }
}
