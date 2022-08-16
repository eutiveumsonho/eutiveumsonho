import { getAuthProps } from "../lib/auth";
import { getDreams } from "../lib/db/reads";
import MyDreamsPage from "../components/pages/my-dreams";

export default function MyDreams(props) {
  const { serverSession, data: rawData } = props;

  const data = JSON.parse(rawData);

  return <MyDreamsPage serverSession={serverSession} data={data} />;
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);

  if (!authProps.props.serverSession) {
    const { res } = context;
    res.setHeader("location", "/auth/signin");
    res.statusCode = 302;
    res.end();
  }

  const { email } = authProps.props.serverSession.user;

  const data = await getDreams(email);

  return { props: { ...authProps.props, data: JSON.stringify(data) } };
}
