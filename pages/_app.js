import Layout from "../components/layout";
import { grommet, Grommet } from "grommet";

function MyApp({ Component, pageProps }) {
  return (
    <Grommet theme={grommet}>
      <Layout
        title="Eu tive um sonho"
        subtitle="A maior comunidade conectada por sonhos, do Brasil para o mundo."
      >
        <Component {...pageProps} />
      </Layout>
    </Grommet>
  );
}

export default MyApp;
