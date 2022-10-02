import { getAuthProps } from "../lib/auth";
import {
  getLatestPublicDreams,
  getStarsByUserEmail,
  getUserById,
} from "../lib/db/reads";
import PublicDreams from "../containers/public-dreams";
import { logError } from "../lib/o11y";
import Head from "next/head";

export default function FindOut(props) {
  const { serverSession, data: rawData, stars: rawStars } = props;

  const data = JSON.parse(rawData);
  const stars = JSON.parse(rawStars);

  return (
    <>
      <Head>
        <title>Descubra</title>
      </Head>
      <PublicDreams serverSession={serverSession} data={data} stars={stars} />
    </>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);

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
        ...authProps.props,
        data: JSON.stringify(dreams),
        stars: JSON.stringify(stars),
      },
    };
  } catch (error) {
    logError({
      ...error,
      service: "web",
      pathname: "/descubra",
      component: "FindOut",
    });
  }
}
