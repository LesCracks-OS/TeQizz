package com.brandonkamga.teqizz.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

@Order(Ordered.LOWEST_PRECEDENCE)
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String profile = resolveProfile(environment);
        String filename = ".env." + profile;

        try {
            Dotenv dotenv = Dotenv.configure()
                    .filename(filename)
                    .ignoreIfMissing()
                    .load();

            Map<String, Object> properties = new HashMap<>();
            dotenv.entries().forEach(e -> properties.put(e.getKey(), e.getValue()));

            if (!properties.isEmpty()) {
                // addLast = lowest priority: OS env vars and -D flags win over the file
                environment.getPropertySources().addLast(
                        new MapPropertySource("dotenv[" + filename + "]", properties)
                );
            }
        } catch (Exception ignored) {
        }
    }

    private String resolveProfile(ConfigurableEnvironment environment) {
        String[] active = environment.getActiveProfiles();
        if (active.length > 0) return active[0];

        String fromEnv = System.getenv("SPRING_PROFILES_ACTIVE");
        if (fromEnv != null && !fromEnv.isBlank()) return fromEnv.split(",")[0].trim();

        String fromProp = System.getProperty("spring.profiles.active");
        if (fromProp != null && !fromProp.isBlank()) return fromProp.split(",")[0].trim();

        return "dev";
    }
}
