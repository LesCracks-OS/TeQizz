package com.brandonkamga.teqizz.iam.infrastructure.security.oauth;

import com.brandonkamga.teqizz.iam.domain.model.vo.ProviderType;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.ProfileJpaEntity;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.Provider;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.Role;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

/**
 * Google OAuth2 user info extractor.
 */
@Component
public class GoogleOAuthUserInfoExtractor implements OAuthUserInfoExtractor {

    @Override
    public ProviderType getProviderType() {
        return ProviderType.GOOGLE;
    }

    @Override
    public boolean supports(String provider) {
        return ProviderType.GOOGLE.name().equalsIgnoreCase(provider);
    }

    @Override
    public String extractEmail(OAuth2User oauthUser) {
        return oauthUser.getAttribute("email");
    }

    @Override
    public String extractName(OAuth2User oauthUser) {
        return oauthUser.getAttribute("name");
    }

    @Override
    public String extractProviderUserId(OAuth2User oauthUser) {
        return oauthUser.getAttribute("sub");
    }

    @Override
    public String extractUsername(OAuth2User oauthUser) {
        String email = oauthUser.getAttribute("email");
        return email != null ? email.split("@")[0] : oauthUser.getAttribute("sub");
    }

    @Override
    public String extractFirstName(OAuth2User oauthUser) {
        return oauthUser.getAttribute("given_name");
    }

    @Override
    public String extractLastName(OAuth2User oauthUser) {
        return oauthUser.getAttribute("family_name");
    }

    @Override
    public UserJpaEntity buildUser(OAuth2User oauthUser, Role role, Provider provider) {
        String email = extractEmail(oauthUser);
        String providerUserId = extractProviderUserId(oauthUser);
        String givenName = oauthUser.getAttribute("given_name");
        String familyName = oauthUser.getAttribute("family_name");
        String username = extractUsername(oauthUser);

        if (username == null && email != null) {
            username = email.split("@")[0];
        }

        UserJpaEntity user = UserJpaEntity.builder()
                .email(email)
                .username(username)
                .provider(provider)
                .providerUserId(providerUserId)
                .role(role)
                .build();

        ProfileJpaEntity profile = ProfileJpaEntity.builder()
                .user(user)
                .firstName(givenName)
                .lastName(familyName)
                .build();
        user.setProfile(profile);

        return user;
    }
}
