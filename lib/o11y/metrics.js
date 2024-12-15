import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { Resource } from "@opentelemetry/resources";
import otel from "@opentelemetry/api";

// Define your resource, e.g., service name, environment.
const resource = new Resource({
  "service.name": `eutiveumsonho-${process.env.NODE_ENV}`,
});

// Create a metric reader with OTLP exporter configured to send metrics to a local collector.
const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter(),
  exportIntervalMillis: 10000, // Export metrics every 10 seconds.
});

// Initialize a MeterProvider with the above configurations.
const myServiceMeterProvider = new MeterProvider({
  resource,
  readers: [metricReader],
});

// Set the initialized MeterProvider as global to enable metric collection across the app.
otel.metrics.setGlobalMeterProvider(myServiceMeterProvider);
