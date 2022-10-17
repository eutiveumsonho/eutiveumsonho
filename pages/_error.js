import Custom404 from "./404";
import Custom500 from "./500";

function Error({ statusCode }) {
  if (statusCode === 404) {
    return <Custom404 />;
  }

  return <Custom500 />;
}

Error.getInitialProps = ({ res, err }) => {
  if (typeof window == "undefined") {
    const newrelic = require("newrelic");
    newrelic.noticeError(err);
  } else {
    window.newrelic.noticeError(err);
  }

  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
