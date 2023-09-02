import {
  Anchor,
  Box,
  Footer,
  Heading,
  Page,
  PageContent,
  PageHeader,
  ResponsiveContext,
  Text,
} from "grommet";
import { Github, Instagram } from "grommet-icons";
import Link from "next/link";
import { useContext } from "react";
import { Logo } from "./logo";
import PageActions from "./page-actions";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

const FooterAnchor = (props) => {
  return <Anchor size="small" color="white" {...props} />;
};

const footerIconsMap = {
  icon__Github: <Github />,
  icon__Instagram: <Instagram />,
};

const FooterContent = (props) => {
  const { size } = props;
  const { t } = useTranslation("footer");
  const { locale } = useRouter();
  const iconPrefix = "icon__";

  return (
    <Box
      direction={size === "small" ? "column" : "row"}
      gap="large"
      justify={"end"}
      align={size === "small" ? "center" : "flex-start"}
      fill
    >
      {[
        {
          title: t("legal"),
          items: [
            {
              title: t("terms"),
              path: `/${locale}/terms-and-conditions`,
              props: {},
            },
            {
              title: t("privacy"),
              path: `/${locale}/privacy-policy`,
              props: {},
            },
            {
              title: t("cookies"),
              path: `/${locale}/cookies-policy`,
              props: {},
            },
          ],
        },
        {
          title: t("social"),
          items: [
            {
              title: "icon__Github",
              path: "https://github.com/eutiveumsonho/eutiveumsonho",
              props: { target: "_blank" },
            },
            {
              title: "icon__Instagram",
              path: "https://www.instagram.com/_eutiveumsonho/",
              props: { target: "_blank" },
            },
          ],
        },
      ].map((item) => (
        <Box gap="medium" key={item.title}>
          <Text
            weight="bold"
            size="medium"
            alignSelf={size === "small" ? "center" : "start"}
          >
            {item.title}
          </Text>
          <Box align={size === "small" ? "center" : "flex-start"}>
            {item.items.map((item) => (
              <FooterAnchor key={item.title} href={item.path} {...item.props}>
                {item.title.includes(iconPrefix)
                  ? footerIconsMap[item.title]
                  : item.title}
              </FooterAnchor>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default function Layout(props) {
  const { children, serverSession, deviceType } = props;
  const size = useContext(ResponsiveContext);
  const router = useRouter();
  const { t } = useTranslation("layout");

  const isSmall = deviceType === "mobile" || size === "small";

  return (
    <>
      <Page
        style={{
          minHeight: "100vh",
        }}
      >
        <PageContent>
          <PageHeader
            title={
              <Box
                style={{
                  maxWidth: "24rem",
                }}
              >
                <Link
                  href={`${router.locale}/`}
                  legacyBehavior
                  locale={router.locale}
                >
                  <a
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    <Heading level={1} style={{ marginBottom: "unset" }}>
                      Eu tive um sonho
                    </Heading>
                    <Heading level={4} style={{ marginTop: "unset" }}>
                      {t("tagline")}
                    </Heading>
                  </a>
                </Link>
              </Box>
            }
            responsive
            actions={
              <PageActions
                serverSession={serverSession}
                deviceType={deviceType}
              />
            }
          />
        </PageContent>
        {children}
        <PageContent
          background={{ fill: "horizontal", color: "white" }}
          style={{
            display: "flex",
            width: "100vw",
            alignItems: "center",
            paddingLeft: "unset",
            paddingRight: "unset",
          }}
        >
          <Footer
            background="dark-1"
            pad="xlarge"
            gap="xlarge"
            style={{
              maxWidth: "99rem",
              width: "100%",
            }}
            direction={isSmall ? "column" : "row"}
          >
            <Box direction="row-responsive" gap="xsmall">
              <Logo />
            </Box>
            <FooterContent size={size} />
          </Footer>
        </PageContent>
      </Page>
    </>
  );
}
