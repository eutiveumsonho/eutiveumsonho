import honey, { logError } from "../../lib/o11y";

function sendEvent(metric) {
  const evnt = honey.newEvent();
  evnt.add(metric);
  evnt.send();
}

export default function handler(req, res) {
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
    logError({ ...error, from_api: true });
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: error.message }),
    };
  }
}
