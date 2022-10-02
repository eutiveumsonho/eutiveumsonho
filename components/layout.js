import {
  Anchor,
  Box,
  Footer,
  Heading,
  Page,
  PageContent,
  PageHeader,
  Text,
} from "grommet";
import Link from "next/link";
import { Logo } from "./logo";
import PageActions from "./page-actions";

const footerData = [
  {
    title: "Legal",
    items: [
      {
        title: "Termos e Condiçōes",
        path: "/termos-e-condicoes",
      },
      {
        title: "Política de Privacidade",
        path: "/politica-de-privacidade",
      },
      {
        title: "Política de Cookies",
        path: "/politica-de-cookies",
      },
    ],
  },
];

const FooterAnchor = ({ ...rest }) => (
  <Anchor size="small" color="white" {...rest} />
);

const FooterContent = () =>
  footerData.map((item) => (
    <Box gap="medium" key={item.title}>
      <Text weight="bold" size="medium">
        {item.title}
      </Text>
      <Box>
        {item.items.map((item) => (
          <FooterAnchor key={item.title} href={item.path}>
            {item.title}
          </FooterAnchor>
        ))}
      </Box>
    </Box>
  ));

export default function Layout(props) {
  const { children, serverSession } = props;

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
                <Link href="/">
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
                      A maior comunidade conectada por sonhos, do Brasil para o
                      mundo.
                    </Heading>
                  </a>
                </Link>
              </Box>
            }
            responsive
            actions={<PageActions serverSession={serverSession} />}
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
            style={{
              maxWidth: "99rem",
              width: "100%",
            }}
          >
            <Box direction="row-responsive" gap="xsmall">
              <Logo />
            </Box>
            <FooterContent />
          </Footer>
        </PageContent>
      </Page>
    </>
  );
}