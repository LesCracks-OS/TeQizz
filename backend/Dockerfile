# syntax=docker/dockerfile:1

# ── Stage 1 : compilation ──────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B

COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -DskipTests

# ── Stage 2 : image de run Dev ─────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS dev
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=dev"]

# ── Stage 3 : image de run Prod ────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS prod
WORKDIR /app
RUN apk add --no-cache wget
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
