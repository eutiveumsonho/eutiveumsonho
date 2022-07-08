import { Footer, Page, PageContent, PageHeader } from "grommet";

export default function Layout(props) {
  const { title, subtitle, footer = null, children } = props;

  return (
    <Page>
      <PageContent>
        <PageHeader title={title} subtitle={subtitle} responsive />
      </PageContent>
      {children}
      <PageContent background={{ fill: "horizontal", color: "white" }}>
        {footer ? <Footer pad={{ vertical: "small" }}>{footer}</Footer> : null}
      </PageContent>
    </Page>
  );
}
