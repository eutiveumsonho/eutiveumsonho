import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";

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
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      props: { serverSession: null },
    };
  }

  return {
    props: {
      serverSession: session,
    },
  };
}

export async function getServerSession(req, res) {
  return await unstable_getServerSession(req, res, authOptions);
}
