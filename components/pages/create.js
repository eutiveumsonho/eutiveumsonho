import { useState } from "react";
import Head from "next/head";
import { Box, Button, PageContent, Spinner, Avatar } from "grommet";
import { signOut } from "next-auth/react";

import Layout from "../layout";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("../editor"), {
  ssr: false,
  loading: () => <Spinner message="Carregando editor de texto..." />,
});

export default function Create(props) {
  const { user } = props;
  const [html, setHtml] = useState();

  return (
    <Layout
      title="Eu tive um sonho"
      subtitle={`Olá${user.name ? `, ${user.name}` : "!"}`}
      pageHeaderActions={
        <Box direction="row" gap="small">
          <Avatar src={user.image} />
          <Button label="Sair" onClick={signOut} />
        </Box>
      }
    >
      <Head>
        <title>Eu tive um sonho</title>
        <meta name="description" content="O seu repositório de sonhos." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageContent
        style={{
          minHeight: "calc(90vh - 11.75rem)",
        }}
      >
        <Editor
          placeholder="Eu tive um sonho..."
          onChange={setHtml}
          // See https://github.com/zenoamaro/react-quill/issues/311
          defaultValue={html}
          style={{
            width: "100%",
          }}
        />
      </PageContent>
    </Layout>
  );
}
