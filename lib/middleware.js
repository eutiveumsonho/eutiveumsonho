import { log } from "./o11y";

export function withTracing(handler) {
  return (req, res) => {
    logReq(req, res);
    return handler(req, res);
  };
}

export function logReq(req, res) {
  const time = Date.now();
  const timeStr = new Date(time).toISOString();

  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded
    ? forwarded.split(/, /)[0]
    : req.connection.remoteAddress;

  log({
    req: {
      pathname: req.url,
      method: req.method,
      headers: (({ cookie, ...headers }) => headers)(req.headers),
      ip,
    },
    res: {
      statusCode: res.statusCode,
    },
    time: timeStr,
    service: "api",
  });
}
