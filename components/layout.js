import { Box, Footer, Page, PageContent, PageHeader } from "grommet";
import PageActions from "./page-actions";

export default function Layout(props) {
  const { title, subtitle, footer = null, children, serverSession } = props;

  return (
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
      <PageContent background={{ fill: "horizontal", color: "white" }}>
        {footer ? <Footer pad={{ vertical: "small" }}>{footer}</Footer> : null}
      </PageContent>
    </Page>
  );
}
