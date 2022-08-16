import { getAuthProps } from "../lib/auth";

export default function FindOut(_props) {
  return null;
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);

  if (!authProps.props.serverSession) {
    const { res } = context;
    res.setHeader("location", "/auth/signin");
    res.statusCode = 302;
    res.end();
  }

  return { props: { ...authProps.props, data } };
}
