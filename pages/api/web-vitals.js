import { withTracing } from "../../lib/middleware";
import honey, { logError } from "../../lib/o11y";

function sendEvent(metric) {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const evnt = honey.newEvent();
  evnt.add(metric);
  evnt.send();
}

function handler(req, res) {
  const metric = req.body;
  const allowedList = [
    "FCP",
    "LCP",
    "CLS",
    "layout-shift",
    "FID",
    "TTFB",
    "root",
  ];

  try {
    if (allowedList.includes(metric.span_event)) {
      sendEvent(metric);
    }
    res.status(200);
    res.end();
  } catch (error) {
    logError({
      error,
      service: "api",
      pathname: "/api/web-vitals",
      method: "post",
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: error.message }),
    };
  }
}

export default withTracing(handler);
