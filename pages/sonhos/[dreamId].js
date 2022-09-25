import Dream from "../../containers/dream";
import { getAuthProps } from "../../lib/auth";

import { getDreamById, getUserByEmail, getUserById } from "../../lib/db/reads";
import { logError } from "../../lib/o11y";

export default function DreamPage(props) {
  const { data: rawData, ...authProps } = props;

  const data = JSON.parse(rawData);

  return <Dream data={data} {...authProps} />;
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);
  const { res } = context;

  if (!authProps.props.serverSession) {
    res.setHeader("location", "/auth/signin");
    res.statusCode = 302;
    res.end();
  }

  try {
    const { dreamId } = context.params;

    if (dreamId) {
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
          props: { ...authProps.props, data: null },
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

      return {
        props: { ...authProps.props, data: JSON.stringify(data) },
      };
    }

    return { props: { ...authProps.props, data: null } };
  } catch (error) {
    logError({
      ...error,
      service: "web",
      pathname: "/sonhos/[dreamId]",
      component: "DreamPage",
    });
  }
}
