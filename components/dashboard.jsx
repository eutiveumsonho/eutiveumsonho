import React, { cloneElement, useContext } from "react";
import {
  Avatar,
  Button,
  Box,
  Nav,
  Text,
  Sidebar as SidebarBase,
  Header,
  Page,
  PageContent,
  ResponsiveContext,
} from "grommet";
import {
  Book,
  Logout,
  Magic,
  Star,
  UserSettings,
  BarChart,
  Inbox,
  User,
} from "grommet-icons";
import { BRAND_HEX } from "../lib/config";
import { Logo } from "./logo";
import PageActions from "./page-actions";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { useTranslation } from "next-i18next";

const MOBILE_SIDEBAR_WIDTH = "4.5rem";
const MOBILE_HEADER_HEIGHT = "3.95rem";
const DESKTOP_SIDEBAR_WIDTH = "15rem";
const DESKTOP_HEADER_HEIGHT = "4.688rem";

const SidebarHeader = (props) => {
  const { serverSession, size, deviceType } = props;

  const isSmall = deviceType === "mobile" || size === "small";

  return (
    <Box
      align="center"
      gap="small"
      direction="row"
      margin={{ bottom: "xxsmall" }}
      justify="center"
    >
      <Avatar src={serverSession.user.image} />
      {isSmall ? null : <Text>{serverSession.user.name}</Text>}
    </Box>
  );
};

const SidebarButton = ({ icon, label, selected, ...rest }) => (
  <Button
    gap="medium"
    justify="start"
    fill
    icon={cloneElement(icon, {
      color: selected ? "white" : undefined,
    })}
    label={label}
    plain
    {...rest}
    style={{
      ...rest.style,
      whiteSpace: "nowrap",
      height: "3rem",
      paddingLeft: "3rem",
      flex: "unset",
      background: selected ? BRAND_HEX : "transparent",
      color: selected ? "white" : "unset",
    }}
  />
);

const SidebarFooter = (props) => {
  const { size, deviceType, t } = props;
  const { pathname: rawPathname, push, locale } = useRouter();

  const account = `/${locale}/account`;
  const callback = `/${locale}`;
  const pathname = `/${locale}${rawPathname}`;

  if (deviceType === "mobile" || size === "small") {
    return (
      <Nav gap="small">
        <Button
          icon={<UserSettings />}
          hoverIndicator={pathname !== account}
          primary={pathname === account}
          onClick={() => push(account)}
        />
        <Button
          icon={<Logout />}
          hoverIndicator
          onClick={async () => {
            const data = await signOut({
              redirect: false,
              callbackUrl: callback,
            });

            push(data.url);
          }}
        />
      </Nav>
    );
  }

  return (
    <Nav>
      <SidebarButton
        icon={<UserSettings />}
        label={t("my-account")}
        selected={pathname === account}
        onClick={() => push(account)}
      />
      <SidebarButton
        icon={<Logout />}
        label={t("logout")}
        onClick={async () => {
          const data = await signOut({
            redirect: false,
            callbackUrl: callback,
          });

          push(data.url);
        }}
      />
    </Nav>
  );
};

/**
 * Navigation items are organized by
 * usage order (data from G.A.)
 */
const MainNavigation = (props) => {
  const { size, serverSession, deviceType, t } = props;
  const { pathname: rawPathname, push, locale } = useRouter();

  const dreams = `/${locale}/dreams`;
  const myDreams = `/${locale}/my-dreams`;
  const insights = `/${locale}/insights`;
  const inbox = `/${locale}/inbox`;
  const savedDreams = `/${locale}/saved-dreams`;
  const profile = `/${locale}/profile`;
  const pathname = `/${locale}${rawPathname}`;

  if (deviceType === "mobile" || size === "small") {
    return (
      <Nav gap="small">
        <Button
          icon={<Magic />}
          hoverIndicator={pathname !== dreams}
          primary={pathname === dreams}
          onClick={() => push(dreams)}
        />
        <Button
          icon={<Book />}
          hoverIndicator={pathname !== myDreams}
          primary={pathname === myDreams}
          onClick={() => push(myDreams)}
        />
        <Button
          icon={<BarChart />}
          hoverIndicator={pathname !== insights}
          primary={pathname === insights}
          onClick={() => push(insights)}
        />
        <Button
          icon={<Inbox />}
          hoverIndicator={pathname !== inbox}
          primary={pathname === inbox}
          onClick={() => push(inbox)}
          badge={
            serverSession?.inboxCount
              ? {
                  value: serverSession?.inboxCount,
                  background: {
                    color: pathname === inbox ? "#6FFFB0" : BRAND_HEX,
                  },
                }
              : 0
          }
        />
        <Button
          icon={<Star />}
          hoverIndicator={pathname !== savedDreams}
          primary={pathname === savedDreams}
          onClick={() => push(savedDreams)}
        />
        <Button
          icon={<User />}
          hoverIndicator={pathname !== profile}
          primary={pathname === profile}
          onClick={() => push(profile)}
        />
      </Nav>
    );
  }

  return (
    <Nav gap="medium" fill="vertical" responsive={false}>
      <SidebarButton
        icon={<Magic />}
        label={t("discover")}
        selected={pathname === dreams}
        onClick={() => push(dreams)}
      />
      <SidebarButton
        icon={<Book />}
        label={t("my-dreams")}
        selected={pathname === myDreams}
        onClick={() => push(myDreams)}
      />
      <SidebarButton
        icon={<BarChart />}
        label={t("insights")}
        selected={pathname === insights}
        onClick={() => push(insights)}
      />
      <SidebarButton
        icon={
          <Button
            as="span"
            plain
            icon={<Inbox color={pathname === inbox ? "white" : undefined} />}
            badge={
              serverSession?.inboxCount
                ? {
                    value: serverSession?.inboxCount,
                    background: {
                      color: pathname === inbox ? "#6FFFB0" : BRAND_HEX,
                    },
                  }
                : 0
            }
          />
        }
        label={t("inbox")}
        selected={pathname === inbox}
        onClick={() => push(inbox)}
      />
      <SidebarButton
        icon={<Star />}
        label={t("saved")}
        selected={pathname === savedDreams}
        onClick={() => push(savedDreams)}
      />
      <SidebarButton
        icon={<User />}
        label={t("profile")}
        selected={pathname === profile}
        onClick={() => push(profile)}
      />
    </Nav>
  );
};

function MobileSidebar(props) {
  const { serverSession, size, t } = props;

  return (
    <SidebarBase
      elevation="large"
      responsive={false}
      background="light-1"
      header={
        <SidebarHeader
          serverSession={serverSession}
          size={size}
          deviceType={"mobile"}
          t={t}
        />
      }
      footer={<SidebarFooter size={size} deviceType="mobile" t={t} />}
      style={{
        top: MOBILE_HEADER_HEIGHT,
        height: `calc(100vh - ${MOBILE_HEADER_HEIGHT})`,
        minHeight: `calc(100vh - ${MOBILE_HEADER_HEIGHT})`,
        position: "fixed",
        minWidth: MOBILE_SIDEBAR_WIDTH,
        maxWidth: MOBILE_SIDEBAR_WIDTH,
        borderRight: `1px solid ${BRAND_HEX}`,
        // Trick to make the box-shadow from the sidebar and header look good
        zIndex: "11",
      }}
    >
      <MainNavigation
        size={size}
        serverSession={serverSession}
        deviceType={"mobile"}
        t={t}
      />
    </SidebarBase>
  );
}

function DesktopSidebar(props) {
  const { serverSession, size, t } = props;

  return (
    <SidebarBase
      responsive={false}
      elevation="large"
      header={
        <SidebarHeader
          serverSession={serverSession}
          size={size}
          deviceType={"desktop"}
          t={t}
        />
      }
      footer={<SidebarFooter deviceType="desktop" t={t} />}
      pad={{ left: "unset", right: "unset", vertical: "large" }}
      background="light-1"
      style={{
        position: "fixed",
        top: DESKTOP_HEADER_HEIGHT,
        height: `calc(100vh - ${DESKTOP_HEADER_HEIGHT})`,
        minHeight: `calc(100vh - ${DESKTOP_HEADER_HEIGHT})`,
        minWidth: DESKTOP_SIDEBAR_WIDTH,
        maxWidth: DESKTOP_SIDEBAR_WIDTH,
        borderRight: `1px solid ${BRAND_HEX}`,
        // Trick to make the box-shadow from the sidebar and header look good
        zIndex: "11",
      }}
    >
      <MainNavigation size={size} serverSession={serverSession} t={t} />
    </SidebarBase>
  );
}

function Sidebar(props) {
  const { serverSession, size, deviceType, t } = props;

  if (deviceType === "mobile" || size === "small") {
    return (
      <MobileSidebar
        serverSession={serverSession}
        size={size}
        deviceType={deviceType}
        t={t}
      />
    );
  }

  return (
    <DesktopSidebar
      serverSession={serverSession}
      size={size}
      deviceType={deviceType}
      t={t}
    />
  );
}

export default function Dashboard(props) {
  const { serverSession, children, deviceType } = props;
  const size = useContext(ResponsiveContext);
  const { t } = useTranslation("dashboard");

  const isSmall = deviceType === "mobile" || size === "small";

  return (
    <>
      <Header
        pad="small"
        style={{
          position: "fixed",
          width: "100vw",
          borderBottom: `1px solid ${BRAND_HEX}`,
          zIndex: "10",
        }}
        background="light-1"
        elevation="large"
      >
        <Box
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            margin: "auto",
            maxWidth: "96rem",
            // Trick to make the box-shadow from the sidebar and header look good
            zIndex: "9",
          }}
        >
          <Logo noTitle />
          <PageActions serverSession={serverSession} />
        </Box>
      </Header>
      <Page background="background-front" kind="full">
        <Box direction="row" height={{ min: "100%" }}>
          <Sidebar
            serverSession={serverSession}
            size={size}
            deviceType={deviceType}
            t={t}
          />
          <PageContent
            style={{
              width: isSmall
                ? `calc(100vw - ${MOBILE_SIDEBAR_WIDTH})`
                : `calc(100vw - ${DESKTOP_SIDEBAR_WIDTH})`,
              minHeight: isSmall
                ? `calc(100vh - ${MOBILE_HEADER_HEIGHT})`
                : `calc(100vh - ${DESKTOP_HEADER_HEIGHT})`,
              minWidth: "0px",
              marginTop: isSmall ? MOBILE_HEADER_HEIGHT : DESKTOP_HEADER_HEIGHT,
              marginLeft: isSmall
                ? MOBILE_SIDEBAR_WIDTH
                : DESKTOP_SIDEBAR_WIDTH,
            }}
          >
            {children}
          </PageContent>
        </Box>
      </Page>
    </>
  );
}
