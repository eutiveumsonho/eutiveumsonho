import Head from "next/head";
import Dream from "../../containers/dream";
import { getAuthProps } from "../../lib/auth";
import { truncate } from "../../lib/strings";
import {
  getDreamById,
  getUserByEmail,
  getUserById,
  getComments,
} from "../../lib/db/reads";
import { logError } from "../../lib/o11y";

export default function DreamPage(props) {
  const { data: rawData, comments: rawComments, ...authProps } = props;

  const data = JSON.parse(rawData);
  const comments = JSON.parse(rawComments);

  return (
    <>
      <Head>
        <title>{truncate(data.dream.text, 50, true)}</title>
      </Head>
      <Dream data={data} comments={comments} {...authProps} />
    </>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);
  const { res } = context;

  try {
    const { dreamId } = context.params;

    if (!authProps.props.serverSession) {
      const data = await getDreamById(dreamId);

      if (data.visibility === "private") {
        res.setHeader("location", "/");
        res.statusCode = 302;
        res.end();

        return { props: {} };
      }

      const user = await getUserById(data.userId);
      data.user = user;

      const comments = await getComments(dreamId);

      return {
        props: {
          ...authProps.props,
          data: JSON.stringify(data),
          comments: JSON.stringify(comments),
        },
      };
    }

    let [data, user] = await Promise.all([
      getDreamById(dreamId),
      getUserByEmail(authProps.props.serverSession.user.email),
    ]);

    const isDreamOwner = user._id.toString() === data.userId.toString();

    if (data.visibility === "private" && !isDreamOwner) {
      res.setHeader("location", "/meus-sonhos");
      res.statusCode = 302;
      res.end();

      return {
        props: {},
      };
    }

    if (data.visibility === "anonymous") {
      delete data.userId;
    } else {
      if (isDreamOwner) {
        data.user = user;
      } else {
        const user = await getUserById(data.userId);
        data.user = user;
      }
    }

    const comments = await getComments(dreamId);

    return {
      props: {
        ...authProps.props,
        data: JSON.stringify(data),
        comments: JSON.stringify(comments),
      },
    };
  } catch (error) {
    logError({
      ...error,
      service: "web",
      pathname: "/sonhos/[dreamId]",
      component: "DreamPage",
    });
  }
}