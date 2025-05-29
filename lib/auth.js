import { getServerSession as nextAuthGetServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { getInboxCount, getUserByEmail } from "../lib/db/reads";
import { updateUser } from "../lib/db/writes";

/**
 * Must be used on every authenticated page
 *
 * @example
 * export default function Page(props) {
 *   const { serverSession } = props;
 *
 *   if (serverSession?.user) {
 *     return <Authenticated serverSession={serverSession} />;
 *   }
 *
 *   return <NotAuthenticated/>;
 * }
 *
 * export async function getServerSideProps(context) {
 *    return getAuthProps(context);
 * }
 */
export async function getAuthProps(context) {
  // See https://github.com/nextauthjs/next-auth/pull/4116
  // and https://github.com/nextauthjs/next-auth/pull/4116/files#diff-4bf6ba46d8704808e8fb66e2c10fc4baf950c7e3b4f9b60dab652b1eb8e54149
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      props: { serverSession: null },
    };
  }

  const inboxCount = await getInboxCount(session.user.email);

  if (!session.user?.name || !session.user?.image || !session.user?.settings || !session.user?.username) {
    const userData = await getUserByEmail(session.user.email);

    let remainingUserData = {};

    if (!userData?.name) {
      remainingUserData = {
        name: "",
      };
    }

    if (!userData?.settings) {
      remainingUserData = {
        ...remainingUserData,
        settings: {
          aiCommentsOnPrivatePosts: false,
        },
      };
    }

    if (!userData?.image) {
      remainingUserData = {
        ...remainingUserData,
        image: `https://avatars.dicebear.com/v2/jdenticon/${session.user.email}.svg`,
      };
    }

    if (!userData?.username) {
      remainingUserData = {
        ...remainingUserData,
        username: null, // Will be set later during onboarding
        profileVisibility: "private",
      };
    }

    await updateUser(userData._id, remainingUserData);

    return {
      props: {
        serverSession: {
          ...session,
          user: {
            ...session.user,
            ...remainingUserData,
          },
          inboxCount,
        },
      },
    };
  }

  return {
    props: {
      serverSession: { ...session, inboxCount },
    },
  };
}

export async function getServerSession(req, res) {
  return await nextAuthGetServerSession(req, res, authOptions);
}
