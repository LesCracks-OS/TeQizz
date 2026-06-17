package com.brandonkamga.teqizz.iam.infrastructure.security.oauth;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Factory for OAuthUserInfoExtractor implementations.
 * Moved from security.oauth to iam.infrastructure.security.oauth.
 */
@Component
public class OAuthUserInfoExtractorFactory {

    private final Map<String, OAuthUserInfoExtractor> extractorMap;

    public OAuthUserInfoExtractorFactory(List<OAuthUserInfoExtractor> extractors) {
        this.extractorMap = extractors.stream()
                .collect(Collectors.toMap(
                        extractor -> {
                            String className = extractor.getClass().getSimpleName();
                            if (className.contains("Google")) {
                                return "google";
                            } else if (className.contains("GitHub")) {
                                return "github";
                            }
                            return className.toLowerCase();
                        },
                        Function.identity()
                ));
    }

    public OAuthUserInfoExtractor getExtractor(String provider) {
        OAuthUserInfoExtractor extractor = extractorMap.get(provider.toLowerCase());
        if (extractor == null) {
            throw new IllegalArgumentException("No OAuth extractor found for provider: " + provider);
        }
        return extractor;
    }

    public boolean hasExtractor(String provider) {
        return extractorMap.containsKey(provider.toLowerCase());
    }
}
