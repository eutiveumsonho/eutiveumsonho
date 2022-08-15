import React from "react";
import { Avatar, Button, Box, Nav, Text, Sidebar, Header, Page } from "grommet";
import { Magic, Save, Chat } from "grommet-icons";
import { BRAND_HEX } from "../lib/config";
import { Logo } from "./logo";
import PageActions from "./page-actions";
import { useRouter } from "next/router";

const SidebarHeader = (props) => {
  const { serverSession } = props;

  return (
    <Box
      align="center"
      gap="small"
      direction="row"
      margin={{ bottom: "large" }}
    >
      <Avatar src={serverSession.user.image} />
      <Text>{serverSession.user.name ?? serverSession.user.email}</Text>
    </Box>
  );
};

const SidebarButton = ({ icon, label, ...rest }) => (
  <Box pad="small">
    <Button
      gap="medium"
      alignSelf="start"
      fill
      icon={icon}
      label={label}
      {...rest}
    />
  </Box>
);

const SidebarFooter = () => (
  <Nav>
    {/* <SidebarButton icon={<Chat />} label="Fale conosco" /> */}
    {/* <SidebarButton icon={<Help />} label="Ajuda" /> */}
  </Nav>
);

const MainNavigation = () => {
  const { pathname } = useRouter();

  return (
    <Nav gap="small" fill>
      <SidebarButton
        icon={<Magic />}
        label="Descubra"
        primary={pathname === "/descubra"}
      />
      {/* Coming soon... */}
      {/* <SidebarButton icon={<Save />} label="Salvos" /> */}
      {/* <SidebarButton icon={<StatusInfoSmall />} label="Inbox" /> */}
      {/* <SidebarButton icon={<Split />} label="Perfil" /> */}
    </Nav>
  );
};

export default function Dashboard(props) {
  const { serverSession } = props;

  return (
    <>
      <Header
        pad="small"
        style={{
          borderBottom: `1px solid ${BRAND_HEX}`,
        }}
        background="light-1"
      >
        <Box
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            margin: "auto",
            maxWidth: "96rem",
          }}
        >
          <Logo noTitle />
          <PageActions serverSession={serverSession} />
        </Box>
      </Header>
      <Page background="background-front" kind="full">
        <Box direction="row" height={{ min: "100%" }}>
          <Sidebar
            responsive
            header={<SidebarHeader serverSession={serverSession} />}
            footer={<SidebarFooter />}
            pad={{ left: "medium", right: "large", vertical: "large" }}
            background="light-1"
            style={{
              borderRight: `1px solid ${BRAND_HEX}`,
              minHeight: "calc(100vh - 4.688rem)",
            }}
          >
            <MainNavigation />
          </Sidebar>
        </Box>
      </Page>
    </>
  );
}
