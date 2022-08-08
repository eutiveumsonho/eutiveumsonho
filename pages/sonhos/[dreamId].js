import Create from "../../components/pages/create";
import { getA, getAuthPropsuthProps } from "../../lib/auth";
import { getDreamById } from "../../lib/db/reads";

export default function Dream(props) {
  const { serverSession, data } = props;

  if (serverSession && data) {
    return <Create serverSession={serverSession} data={data} />;
  }

  return null;
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);

  const { dreamId } = context.params;

  if (dreamId) {
    const response = await getDreamById(dreamId);

    if (!response) {
      // render not found
    }

    if (authProps.props.serverSession.user.email === response.userEmail) {
      const { dream, userEmail } = response;

      return {
        props: { ...authProps.props, data: { dream, dreamOwner: userEmail } },
      };
    }
  }

  return { props: { ...authProps.props, data: null } };
}
