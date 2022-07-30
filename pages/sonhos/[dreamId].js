import { getSession } from "next-auth/react";

import Create from "../../components/pages/create";

export default function Dream(props) {
  const { user } = props;

  if (user) {
    return <Create user={user} />;
  }

  return null;
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      props: { user: null },
    };
  }

  return {
    props: {
      user: session.user,
    },
  };
}
