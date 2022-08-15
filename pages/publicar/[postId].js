import { getAuthProps } from "../../lib/auth";

import Create from "../../components/pages/create";
import { getDreamById } from "../../lib/db/reads";

export default function Home(props) {
  return <Create {...props} />;
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);
  const { res, req } = context;

  if (!authProps.props.serverSession) {
    res.setHeader("location", "/auth/signin");
    res.statusCode = 302;
    res.end();
  }

  const { postId } = context.params;

  console.log({ postIdFromFrontend: postId });

  if (postId) {
    const response = await getDreamById(postId);

    console.log({ response });

    // This condition must exist to guarantee privacy on the `publicar` route
    // authProps.props.serverSession.user.email !== response.userEmail

    if (!response) {
      return {
        props: { ...authProps.props, data: null },
      };
    }

    const { dream, userEmail } = response;

    return {
      props: { ...authProps.props, data: { dream, dreamOwner: userEmail } },
    };
  }

  return { props: { ...authProps.props, data: null } };
}
