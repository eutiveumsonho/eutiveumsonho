import { getAuthProps } from "../lib/auth";
import { logError } from "../lib/o11y";
import Head from "next/head";
import SavedDreams from "../containers/saved-dreams";
import { getStarredDreams, getUserById } from "../lib/db/reads";
import { logReq } from "../lib/middleware";

export default function Saved(props) {
  const { serverSession: rawServerSession, data: rawData } = props;

  const serverSession = JSON.parse(rawServerSession);
  const data = JSON.parse(rawData);

  return (
    <>
      <Head>
        <title>Sonhos salvos</title>
      </Head>
      <SavedDreams
        serverSession={serverSession}
        data={data}
        title="Sonhos salvos"
        page="sonhos-salvos"
        empty={{
          label: "Descubra sonhos",
          actionRoute: "/descubra",
          description:
            "Os sonhos que você salvar (clicando na ⭐), serão listados aqui",
        }}
      />
    </>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);
  logReq(context.req, context.res);

  if (!authProps.props.serverSession) {
    const { res } = context;
    res.setHeader("location", "/auth/signin");
    res.statusCode = 302;
    res.end();
  }

  try {
    const data = await getStarredDreams(
      authProps.props.serverSession.user.email
    );

    const dreams = [];

    for (let dream of data) {
      if (dream.visibility === "anonymous") {
        delete dream.userId;
        dreams.push(dream);
        continue;
      }

      const user = await getUserById(dream.userId);
      dream.user = user;
      dreams.push(dream);
    }

    return {
      props: {
        serverSession: JSON.stringify(authProps.props.serverSession),
        data: JSON.stringify(dreams),
      },
    };
  } catch (error) {
    logError({
      error,
      service: "web",
      pathname: "/sonhos-salvos",
      component: "SavedDreams",
    });
  }
}
