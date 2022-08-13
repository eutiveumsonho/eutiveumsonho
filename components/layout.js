import {
  Anchor,
  Box,
  Footer,
  Page,
  PageContent,
  PageHeader,
  Text,
} from "grommet";
import Image from "next/image";
import Link from "next/link";
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
  const { title, subtitle, children, serverSession } = props;

  return (
    <>
      <Page>
        <PageContent>
          <PageHeader
            title={title}
            subtitle={subtitle}
            responsive
            actions={<PageActions serverSession={serverSession} />}
          />
        </PageContent>
        {children}
        <PageContent
          background={{ fill: "horizontal", color: "white" }}
          style={{
            position: "absolute",
            display: "flex",
            width: "100vw",
            alignItems: "center",
          }}
        >
          <Footer
            background="dark-1"
            pad="xlarge"
            style={{
              position: "absolute",
              width: "calc(100% + 3rem)",
              maxWidth: "99rem",
            }}
          >
            <Box direction="row-responsive" gap="xsmall">
              <Link href="/">
                <Box align="center" gap="medium">
                  <Image src="/purple-cloud.svg" height={50} width={50} />
                  <a
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    <Text alignSelf="center" color="brand" weight="bold">
                      Eu tive um sonho
                    </Text>
                  </a>
                </Box>
              </Link>
            </Box>
            <FooterContent />
          </Footer>
        </PageContent>
      </Page>
    </>
  );
}
