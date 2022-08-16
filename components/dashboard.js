import React from "react";
import {
  Avatar,
  Button,
  Box,
  Nav,
  Text,
  Sidebar,
  Header,
  Page,
  PageContent,
  Tip,
} from "grommet";
import { Book, Magic } from "grommet-icons";
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
      justify="center"
    >
      <Avatar
        src={
          serverSession.user.image
            ? serverSession.user.image
            : `https://avatars.dicebear.com/v2/jdenticon/${serverSession.user.email}.svg`
        }
      />
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
        icon={<Book />}
        label="Meus sonhos"
        primary={pathname === "/meus-sonhos"}
      />
      <Tip
        plain
        content={
          <Box
            pad="small"
            gap="small"
            width={{ max: "small" }}
            round="small"
            background="background-front"
            responsive={false}
          >
            <Text weight="bold">Descubra</Text>
            <Text size="small">Em breve...</Text>
          </Box>
        }
        dropProps={{ align: { left: "right" } }}
      >
        <Button
          icon={
            <SidebarButton
              icon={<Magic />}
              label="Descubra"
              disabled
              primary={pathname === "/descubra"}
            />
          }
        />
      </Tip>
      {/* Coming soon... */}
      {/* <SidebarButton icon={<Save />} label="Salvos" /> */}
      {/* <SidebarButton icon={<StatusInfoSmall />} label="Inbox" /> */}
      {/* <SidebarButton icon={<Split />} label="Perfil" /> */}
    </Nav>
  );
};

export default function Dashboard(props) {
  const { serverSession, children } = props;

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
            pad={{ left: "unset", right: "unset", vertical: "large" }}
            background="light-1"
            style={{
              borderRight: `1px solid ${BRAND_HEX}`,
              minHeight: "calc(100vh - 4.688rem)",
            }}
          >
            <MainNavigation />
          </Sidebar>
          <PageContent>{children}</PageContent>
        </Box>
      </Page>
    </>
  );
}
