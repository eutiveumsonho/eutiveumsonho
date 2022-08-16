import { getAuthProps } from "../../lib/auth";

import Create from "../../components/pages/create";
import { getDreamById } from "../../lib/db/reads";

export default function Home(props) {
  return <Create {...props} />;
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);
  const { res } = context;

  if (!authProps.props.serverSession) {
    res.setHeader("location", "/auth/signin");
    res.statusCode = 302;
    res.end();
  }

  const { postId } = context.params;

  if (postId) {
    const data = await getDreamById(postId);

    // This condition must exist to guarantee privacy on the `publicar` route
    // authProps.props.serverSession.user.email !== data.userEmail

    const { dream, userEmail } = data;

    return {
      props: { ...authProps.props, data: { dream, dreamOwner: userEmail } },
    };
  }

  return { props: { ...authProps.props, data: null } };
}
