import Create from "../../components/pages/create";
import { useAuth } from "../../lib/auth";

export default function Dream(props) {
  const { serverSession } = props;

  if (serverSession) {
    return <Create serverSession={serverSession} />;
  }

  return null;
}

export async function getServerSideProps(context) {
  return useAuth(context);
}
