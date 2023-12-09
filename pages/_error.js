import Invite from "../containers/invite";
import Custom404 from "./404";
import Custom500 from "./500";
import * as Sentry from "@sentry/nextjs";

function Error({ statusCode }) {
  if (statusCode === 404) {
    return <Custom404 />;
  }

  if (statusCode === 500) {
    return <Custom500 />;
  }

  return <Invite />;
}

Error.getInitialProps = async (contextData) => {
  console.error({ error: contextData?.err, res: contextData?.res });
  await Sentry.captureUnderscoreErrorException(contextData);

  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
