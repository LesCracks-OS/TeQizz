package com.brandonkamga.teqizz.iam.infrastructure.security.oauth;

import com.brandonkamga.teqizz.iam.domain.model.vo.ProviderType;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.Provider;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.Role;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.security.oauth2.core.user.OAuth2User;

/**
 * Strategy interface for extracting user information from OAuth2 providers.
 */
public interface OAuthUserInfoExtractor {

    ProviderType getProviderType();

    boolean supports(String provider);

    String extractEmail(OAuth2User oauthUser);

    String extractName(OAuth2User oauthUser);

    String extractProviderUserId(OAuth2User oauthUser);

    String extractUsername(OAuth2User oauthUser);

    UserJpaEntity buildUser(OAuth2User oauthUser, Role role, Provider provider);

    default String extractFirstName(OAuth2User oauthUser) {
        return null;
    }

    default String extractLastName(OAuth2User oauthUser) {
        return null;
    }
}
