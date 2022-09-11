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
import { Book, Magic, UserSettings } from "grommet-icons";
import { BRAND_HEX } from "../lib/config";
import { Logo } from "./logo";
import PageActions from "./page-actions";
import { useRouter } from "next/router";

const SidebarHeader = (props) => {
  const { serverSession, size } = props;

  return (
    <Box
      align="center"
      gap="small"
      direction="row"
      margin={{ bottom: "large" }}
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
    alignSelf="start"
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
    </Nav>
  );
};

const MainNavigation = (props) => {
  const { size } = props;
  const { pathname, push } = useRouter();

  if (size === "small") {
    return (
      <Nav gap="small">
        <Button
          icon={<Book />}
          hoverIndicator={pathname !== "/meus-sonhos"}
          primary={pathname === "/meus-sonhos"}
          onClick={() => push("/meus-sonhos")}
        />
        <Button
          icon={<Magic />}
          hoverIndicator={pathname !== "/descubra"}
          primary={pathname === "/descubra"}
          onClick={() => push("/descubra")}
        />
      </Nav>
    );
  }

  return (
    <Nav gap="medium" fill="vertical" responsive={false}>
      <SidebarButton
        icon={<Book />}
        label="Meus sonhos"
        selected={pathname === "/meus-sonhos"}
        onClick={() => push("/meus-sonhos")}
      />
      <SidebarButton
        icon={<Magic />}
        label="Descubra"
        selected={pathname === "/descubra"}
        onClick={() => push("/descubra")}
      />
      {/* Coming soon... */}
      {/* <SidebarButton icon={<Save />} label="Salvos" /> */}
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
        minWidth: "4.5rem",
        maxWidth: "4.5rem",
        minHeight: "calc(100vh - 3.95rem)",
        borderRight: `1px solid ${BRAND_HEX}`,
        // Trick to make the box-shadow from the sidebar and header look good
        zIndex: "1001",
      }}
    >
      <MainNavigation size={size} />
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
        minWidth: "15rem",
        maxWidth: "15rem",
        borderRight: `1px solid ${BRAND_HEX}`,
        minHeight: "calc(100vh - 4.688rem)",
        // Trick to make the box-shadow from the sidebar and header look good
        zIndex: "11",
      }}
    >
      <MainNavigation size={size} />
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
          <PageContent>{children}</PageContent>
        </Box>
      </Page>
    </>
  );
}
