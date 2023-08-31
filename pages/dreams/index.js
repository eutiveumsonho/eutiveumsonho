import { getAuthProps } from "../../lib/auth";
import {
  getLatestPublicDreams,
  getStarsByUserEmail,
  getUserById,
} from "../../lib/db/reads";
import PublicDreams from "../../containers/public-dreams";
import { logError } from "../../lib/o11y";
import Head from "next/head";
import { logReq } from "../../lib/middleware";
import { getUserAgentProps } from "../../lib/user-agent";

export default function FindOut(props) {
  const {
    serverSession: rawServerSession,
    data: rawData,
    stars: rawStars,
  } = props;

  const serverSession = JSON.parse(rawServerSession);

  const data = JSON.parse(rawData);
  const stars = JSON.parse(rawStars);

  return (
    <>
      <Head>
        <title>Descubra</title>
      </Head>
      <PublicDreams
        serverSession={serverSession}
        data={data}
        stars={stars}
        title="Sonhos recentes"
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
    const data = await getLatestPublicDreams();
    const stars = await getStarsByUserEmail(
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
        stars: JSON.stringify(stars),
        ...getUserAgentProps(context),
      },
    };
  } catch (error) {
    logError({
      error,
      service: "web",
      pathname: "/dreams",
      component: "FindOut",
    });
  }
}
