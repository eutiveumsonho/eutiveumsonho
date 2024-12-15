import { metrics } from "@opentelemetry/api";
import { onCLS, onLCP, onINP, onFCP, onTTFB } from "web-vitals";

const meter = metrics.getMeter("web-vitals");
const lcp = meter.createObservableGauge("lcp");
const cls = meter.createObservableGauge("cls");
const inp = meter.createObservableGauge("inp");
const ttfb = meter.createObservableGauge("ttfb");
const fcp = meter.createObservableGauge("fcp");

function sendToAnalytics(metric) {
  switch (metric.name) {
    case "LCP": {
      lcp.addCallback((result) => {
        result.observe(metric.value);
      });
      break;
    }
    case "CLS": {
      cls.addCallback((result) => {
        result.observe(metric.value);
      });
      break;
    }
    case "INP": {
      inp.addCallback((result) => {
        result.observe(metric.value);
      });
      break;
    }
    case "TTFB": {
      ttfb.addCallback((result) => {
        result.observe(metric.value);
      });
      break;
    }
    case "FCP": {
      fcp.addCallback((result) => {
        result.observe(metric.value);
      });
      break;
    }
    default: {
      console.log("unexpected metric name");
    }
  }
}

onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);
onFCP(sendToAnalytics);
