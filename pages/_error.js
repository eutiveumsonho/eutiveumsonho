import Invite from "../containers/invite";
import { logError } from "../lib/o11y";
import Custom404 from "./404";
import Custom500 from "./500";

function Error({ statusCode }) {
  if (statusCode === 404) {
    return <Custom404 />;
  }

  if (statusCode === 500) {
    return <Custom500 />;
  }

  return <Invite />;
}

Error.getInitialProps = ({ res, err }) => {
  logError({ error: err, res });

  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
