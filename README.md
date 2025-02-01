<div align="right">

[![codecov](https://codecov.io/gh/eutiveumsonho/eutiveumsonho/branch/main/graph/badge.svg?token=E0233QY1CP)](https://codecov.io/gh/eutiveumsonho/eutiveumsonho)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)

</div>

<p align="center">
  <img alt="Eu tive um sonho" src="https://raw.githubusercontent.com/eutiveumsonho/.github/main/profile/assets/logo-512x512.png" height="192" width="192" />
  <h3 align="center">Eu tive um sonho</h3>
  <p align="center">Source code from eutiveumsonho.com, the largest community made by dreamers, for dreamers, powered by AI</p>
</p>

---

## About

Eu tive um sonho is a social network designed for dreamers to preserve and exchange their dreams within the worldwide dreaming community.

### How does it work?

- To start using Eu tive um sonho, creating an account via email or Google account is required.
- Members have the option to publish their dreams publicly, anonymously, or store them as private entries.
- It's possible to bookmark favorite published dreams.
- Members can leave comments on both their own dreams and those of others.
- Dreams can receive comments from our dream interpreter AI, Sonia, if the member consents.
- Any comments made on a member's dreams will appear in their inbox.
- Members can access a page that offers insights into their dreams, including dream frequency and the most frequently used words in their dreams.

## Development instructions

First of all, clone this repository.

Make sure you've got Docker and Docker Compose installed on your machine, as we use it to run an OpenTelemetry Collector setup to collect traces, metrics and logs.

The following services are spawned by the `docker-compose.yml` file:

| Service    | Description         | Port                          |
| ---------- | ------------------- | ----------------------------- |
| Jaeger     | Distributed tracing | [16686](http://0.0.0.0:16686) |
| Zipkin     | Distributed tracing | [9411](http://0.0.0.0:9411)   |
| Prometheus | Metrics             | [9090](http://0.0.0.0:9090)   |

Make sure you've got either an Ollama API available or a local instance running. You'll need both a URL of the API and an API key to run the project, as well as llama3.2:latest model available.

Also make sure you've got a MongoDB instance available or a local instance running. You'll need a connection string to run the project.

Create a `.env.local` file based on the [`.env.example`](.env.example) file.

Install dependencies:

```sh
pnpm i
```

Run the development server:

```sh
pnpm dev
```

Access the project in your local machine at http://localhost:3000. 