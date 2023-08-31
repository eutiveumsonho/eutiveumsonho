import useragent from "express-useragent";

export function getUserAgentProps(context) {
  const userAgent = context.req.headers["user-agent"];
  const useragentInfo = useragent.parse(userAgent);

  let deviceType = "desktop";

  if (useragentInfo.isMobile) {
    deviceType = "mobile";
  } else if (useragentInfo.isTablet) {
    deviceType = "tablet";
  }

  return {
    deviceType,
  };
}
