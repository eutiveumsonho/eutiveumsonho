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
} from "grommet-icons";
import { BRAND_HEX } from "../lib/config";
import { Logo } from "./logo";
import PageActions from "./page-actions";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";

const MOBILE_SIDEBAR_WIDTH = "4.5rem";
const MOBILE_HEADER_HEIGHT = "3.95rem";
const DESKTOP_SIDEBAR_WIDTH = "15rem";
const DESKTOP_HEADER_HEIGHT = "4.688rem";

const SidebarHeader = (props) => {
  const { serverSession, size } = props;

  return (
    <Box
      align="center"
      gap="small"
      direction="row"
      margin={{ bottom: "xxsmall" }}
      justify="center"
    >
      <Avatar src={serverSession.user.image} />
      {size === "small" ? null : <Text>{serverSession.user.name}</Text>}
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
  const { size } = props;
  const { pathname, push } = useRouter();

  if (size === "small") {
    return (
      <Nav gap="small">
        <Button
          icon={<UserSettings />}
          hoverIndicator={pathname !== "/minha-conta"}
          primary={pathname === "/minha-conta"}
          onClick={() => push("/minha-conta")}
        />
        <Button
          icon={<Logout />}
          hoverIndicator
          onClick={async () => {
            const data = await signOut({
              redirect: false,
              callbackUrl: "/",
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
        label="Minha conta"
        selected={pathname === "/minha-conta"}
        onClick={() => push("/minha-conta")}
      />
      <SidebarButton
        icon={<Logout />}
        label="Sair"
        onClick={async () => {
          const data = await signOut({
            redirect: false,
            callbackUrl: "/",
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
  const { size, serverSession } = props;
  const { pathname, push } = useRouter();

  if (size === "small") {
    return (
      <Nav gap="small">
        <Button
          icon={<Magic />}
          hoverIndicator={pathname !== "/descubra"}
          primary={pathname === "/descubra"}
          onClick={() => push("/descubra")}
        />
        <Button
          icon={<Book />}
          hoverIndicator={pathname !== "/meus-sonhos"}
          primary={pathname === "/meus-sonhos"}
          onClick={() => push("/meus-sonhos")}
        />
        <Button
          icon={<BarChart />}
          hoverIndicator={pathname !== "/insights"}
          primary={pathname === "/insights"}
          onClick={() => push("/insights")}
        />
        <Button
          icon={<Inbox />}
          hoverIndicator={pathname !== "/inbox"}
          primary={pathname === "/inbox"}
          onClick={() => push("/inbox")}
          badge={
            serverSession?.inboxCount
              ? {
                  value: serverSession?.inboxCount,
                  background: {
                    color: pathname === "/inbox" ? "#6FFFB0" : BRAND_HEX,
                  },
                }
              : 0
          }
        />
        <Button
          icon={<Star />}
          hoverIndicator={pathname !== "/sonhos-salvos"}
          primary={pathname === "/sonhos-salvos"}
          onClick={() => push("/sonhos-salvos")}
        />
        {/* Coming soon... */}
      </Nav>
    );
  }

  return (
    <Nav gap="medium" fill="vertical" responsive={false}>
      <SidebarButton
        icon={<Magic />}
        label="Descubra"
        selected={pathname === "/descubra"}
        onClick={() => push("/descubra")}
      />
      <SidebarButton
        icon={<Book />}
        label="Meus sonhos"
        selected={pathname === "/meus-sonhos"}
        onClick={() => push("/meus-sonhos")}
      />
      <SidebarButton
        icon={<BarChart />}
        label="Insights"
        selected={pathname === "/insights"}
        onClick={() => push("/insights")}
      />
      <SidebarButton
        icon={
          <Button
            plain
            icon={<Inbox color={pathname === "/inbox" ? "white" : undefined} />}
            badge={
              serverSession?.inboxCount
                ? {
                    value: serverSession?.inboxCount,
                    background: {
                      color: pathname === "/inbox" ? "#6FFFB0" : BRAND_HEX,
                    },
                  }
                : 0
            }
          />
        }
        label="Inbox"
        selected={pathname === "/inbox"}
        onClick={() => push("/inbox")}
      />
      <SidebarButton
        icon={<Star />}
        label="Salvos"
        selected={pathname === "/sonhos-salvos"}
        onClick={() => push("/sonhos-salvos")}
      />
      {/* Coming soon... */}
      {/* <SidebarButton icon={<StatusInfoSmall />} label="Inbox" /> */}
    </Nav>
  );
};

function MobileSidebar(props) {
  const { serverSession, size } = props;

  return (
    <SidebarBase
      elevation="large"
      responsive={false}
      background="light-1"
      header={<SidebarHeader serverSession={serverSession} size={size} />}
      footer={<SidebarFooter size={size} />}
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
      <MainNavigation size={size} serverSession={serverSession} />
    </SidebarBase>
  );
}

function DesktopSidebar(props) {
  const { serverSession, size } = props;

  return (
    <SidebarBase
      responsive={false}
      elevation="large"
      header={<SidebarHeader serverSession={serverSession} size={size} />}
      footer={<SidebarFooter />}
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
      <MainNavigation size={size} serverSession={serverSession} />
    </SidebarBase>
  );
}

function Sidebar(props) {
  const { serverSession, size } = props;

  if (size === "small") {
    return <MobileSidebar serverSession={serverSession} size={size} />;
  }

  return <DesktopSidebar serverSession={serverSession} size={size} />;
}

export default function Dashboard(props) {
  const { serverSession, children } = props;
  const size = useContext(ResponsiveContext);

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
          <Sidebar serverSession={serverSession} size={size} />
          <PageContent
            style={{
              width:
                size === "small"
                  ? `calc(100vw - ${MOBILE_SIDEBAR_WIDTH})`
                  : `calc(100vw - ${DESKTOP_SIDEBAR_WIDTH})`,
              minHeight:
                size === "small"
                  ? `calc(100vh - ${MOBILE_HEADER_HEIGHT})`
                  : `calc(100vh - ${DESKTOP_HEADER_HEIGHT})`,
              minWidth: "0px",
              marginTop:
                size === "small" ? MOBILE_HEADER_HEIGHT : DESKTOP_HEADER_HEIGHT,
              marginLeft:
                size === "small" ? MOBILE_SIDEBAR_WIDTH : DESKTOP_SIDEBAR_WIDTH,
            }}
          >
            {children}
          </PageContent>
        </Box>
      </Page>
    </>
  );
}
