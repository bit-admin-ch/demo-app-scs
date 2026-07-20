# jEAP Demo Application (Self-Contained System)

A fully self-contained demo application generated with the [jEAP Initializer](https://github.com/jeap-admin-ch).
It demonstrates a [jEAP](https://github.com/jeap-admin-ch) / Quadrel microservice built as a
Self-Contained System (SCS): a Spring Boot backend with an embedded Angular frontend, a PostgreSQL
database, S3 object storage (via LocalStack) and OAuth2/OIDC authentication provided by a bundled
OAuth mock server — no external infrastructure required.

## Modules

| Module              | Description                                                                  |
|---------------------|------------------------------------------------------------------------------|
| `my-app-web`        | Spring Boot backend (REST API, security, persistence, S3 object storage)     |
| `my-app-ui`         | Angular frontend, bundled into the backend JAR during the Maven build        |
| `oauth-mock-server` | OAuth2/OIDC mock server used for authentication during development and demos |

All dependencies are resolved from public repositories (Maven Central, npmjs.org, Docker Hub).

## Prerequisites

* Java 25 (e.g. [Eclipse Temurin](https://adoptium.net/))
* Node.js 22+ and npm (required by the Maven build of the Angular frontend)
* Docker with Docker Compose
* No Maven installation needed — the project ships with the Maven wrapper (`./mvnw`)

## Build

```bash
./mvnw install
```

This builds the Angular frontend (`npm ci` + `ng build`), runs the tests and packages everything
into executable Spring Boot JARs.

To skip the frontend unit tests: `./mvnw install -DskipTests`.

## Run everything with Docker

The quickest way to see the demo in action:

```bash
./mvnw install -DskipTests
cd docker
docker compose --profile app up --build
```

This starts:

| Service      | URL / Port                                     | Description                       |
|--------------|------------------------------------------------|-----------------------------------|
| `my-app`     | http://localhost:8080/my-app/                  | The demo application (SCS)        |
| `oauth-mock` | http://localhost:8081/oauth-context-path/      | OAuth2/OIDC mock server           |
| `postgres`   | localhost:5432                                 | PostgreSQL database               |
| `localstack` | localhost:4566                                 | S3-compatible object storage      |

Open http://localhost:8080/my-app/ — you are redirected to the OAuth mock server, where you can
log in as the pre-configured mock user (no password required). After login you land in the
person management UI of the demo application.

The Swagger UI is available at http://localhost:8080/my-app/swagger-ui.html
(authorize with client `oauth-service-client-id`, secret `secret`).

## Local development

### Running locally as an SCS

If your focus is primarily on backend development, run the application as an SCS
(the UI is bundled within the JAR file of the application):

1. Start the infrastructure (database, LocalStack S3 and the OAuth mock server):

   ```bash
   cd docker
   docker compose up
   ```

2. Build the project: `./mvnw install`
3. Start the backend with the `local` Spring profile, either via the IntelliJ run
   configuration *Application (local)* or with:

   ```bash
   ./mvnw -pl my-app-web spring-boot:run -Dspring-boot.run.profiles=local
   ```

4. Open http://localhost:8080/my-app/

Notes:
* It may happen that after the first time you start the application, the build.properties are no
  longer available because IntelliJ deletes them. Simply run `mvn install` again and it should work.
* If you want Maven to rebuild the UI, you must delete the `frontend-build` directory in the UI module.

### Local UI development

To work on the UI, start it with `ng serve` (or `npm start` in `my-app-ui`). The UI runs on
port 4200 with live reload, using the `environment.ts` config.

1. Start the infrastructure as above (`docker compose up`).
2. Start the backend with the profiles `local,local-ui` (IntelliJ run configuration
   *Application (local-ui)*).
3. Start the frontend: `cd my-app-ui && npm start`
4. Open http://localhost:4200/

## OAuth mock server

The `oauth-mock-server` module is an instance of the
[jEAP OAuth mock server](https://github.com/jeap-admin-ch) that issues OIDC tokens for
development and demo purposes. It runs on port 8081 with context path `/oauth-context-path`.

* Mock user: *Maxine Muster* (roles `demo_@person_#read`, `demo_@person_#write`)
* Registered clients: `microService` (Angular frontend) and `oauth-service-client-id` (Swagger UI),
  both with client secret `secret`
* Additional users, clients and roles can be configured in
  `oauth-mock-server/src/main/resources/application-local.yml`

All credentials in this repository are non-sensitive development defaults for the local demo setup.

## Deployment

The application and the OAuth mock server are plain Spring Boot applications shipped as Docker
images (`my-app-web/Dockerfile`, `oauth-mock-server/Dockerfile`) and can be deployed on any
platform that runs OCI containers. The images only need:

* a PostgreSQL database (see `spring.datasource.*` properties)
* an S3-compatible object storage (see `jeap.s3.client.*` properties)
* the OAuth mock server (or any OIDC-compliant identity provider, see
  `jeap.security.oauth2.resourceserver.*` properties)

`my-app-web/src/main/resources/application-docker.yml` shows a complete example configuration
for a containerized environment and is used by the Docker Compose setup.

## Tests

```bash
./mvnw verify
```

Runs the frontend unit tests, the REST API integration tests and the Playwright-based
end-to-end browser tests (`UiBrowserIT`), which drive the real Angular UI through the full
OAuth login flow against an embedded OIDC mock. Playwright downloads its own browser on first use.

## License

This project is licensed under the [Apache License 2.0](LICENSE).
