import { Box, Footer, Page, PageContent, PageHeader } from "grommet";

export default function Layout(props) {
  const { title, subtitle, footer = null, children, pageHeaderActions } = props;

  return (
    <Page>
      <PageContent>
        <PageHeader
          title={title}
          subtitle={subtitle}
          responsive
          actions={
            pageHeaderActions ? (
              <Box direction="row" gap="small" align="center">
                {pageHeaderActions}
              </Box>
            ) : null
          }
        />
      </PageContent>
      {children}
      <PageContent background={{ fill: "horizontal", color: "white" }}>
        {footer ? <Footer pad={{ vertical: "small" }}>{footer}</Footer> : null}
      </PageContent>
    </Page>
  );
}
