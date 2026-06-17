package com.brandonkamga.teqizz.iam.infrastructure.config;

import com.brandonkamga.teqizz.iam.infrastructure.security.jwt.JwtService;
import com.brandonkamga.teqizz.iam.infrastructure.security.oauth.OAuthUserInfoExtractorFactory;
import com.brandonkamga.teqizz.iam.domain.model.vo.ProviderType;
import com.brandonkamga.teqizz.iam.domain.model.vo.RoleType;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.Provider;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.Role;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.UserJpaEntity;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.entity.ProfileJpaEntity;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.ProviderRepository;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.RoleRepository;
import com.brandonkamga.teqizz.iam.infrastructure.persistence.repository.UserJpaRepository;
import com.brandonkamga.teqizz.iam.infrastructure.security.oauth.OAuthUserInfoExtractor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles successful OAuth2 authentication.
 * Uses UserJpaRepository and IAM persistence entities.
 */
@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserJpaRepository userRepository;
    private final RoleRepository roleRepository;
    private final ProviderRepository providerRepository;
    private final OAuthUserInfoExtractorFactory extractorFactory;
    private final JwtService jwtService;
    private final String frontendUrl;

    public OAuth2LoginSuccessHandler(
            UserJpaRepository userRepository,
            RoleRepository roleRepository,
            ProviderRepository providerRepository,
            OAuthUserInfoExtractorFactory extractorFactory,
            JwtService jwtService,
            @Value("${app.frontend.url}") String frontendUrl) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.providerRepository = providerRepository;
        this.extractorFactory = extractorFactory;
        this.jwtService = jwtService;
        this.frontendUrl = frontendUrl;
    }

    @Override
    @Transactional
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) {

        try {
            OAuth2User oauthUser = extractOAuthUser(authentication);
            String provider = extractProvider(authentication);
            processOAuthPostLogin(oauthUser, provider);
            String token = jwtService.generateToken(authentication);
            sendRedirect(response, token);
        } catch (Exception e) {
            sendFailureRedirect(response);
        }
    }

    protected void sendFailureRedirect(HttpServletResponse response) {
        try {
            response.sendRedirect(frontendUrl + "/login?error=oauth_failed");
        } catch (Exception e) {
            throw new RuntimeException("Failed to redirect after OAuth error", e);
        }
    }

    private void processOAuthPostLogin(OAuth2User oauthUser, String provider) {
        OAuthUserInfoExtractor extractor = extractorFactory.getExtractor(provider);

        String email = extractor.extractEmail(oauthUser);
        if (email == null) {
            throw new RuntimeException("Email not provided by " + provider);
        }

        ProviderType providerType = extractor.getProviderType();
        Provider providerEntity = providerRepository.findByProviderName(providerType)
                .orElseGet(() -> providerRepository.save(Provider.builder()
                        .providerName(providerType)
                        .description(providerType.name() + " OAuth authentication")
                        .build()));

        userRepository.findByEmail(email)
                .map(existingUser -> {
                    updateOAuthUserFromProvider(existingUser, oauthUser, extractor);
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    Role userRole = roleRepository.findByRoleName(RoleType.USER)
                            .orElseThrow(() -> new RuntimeException("USER ROLE not found"));
                    UserJpaEntity newUser = extractor.buildUser(oauthUser, userRole, providerEntity);
                    return userRepository.save(newUser);
                });
    }

    private void updateOAuthUserFromProvider(UserJpaEntity existingUser, OAuth2User oauthUser,
                                             OAuthUserInfoExtractor extractor) {
        String firstName = extractor.extractFirstName(oauthUser);
        String lastName = extractor.extractLastName(oauthUser);
        String username = extractor.extractUsername(oauthUser);

        ProfileJpaEntity profile = existingUser.getProfile();
        if (profile == null) {
            profile = ProfileJpaEntity.builder()
                    .user(existingUser)
                    .build();
            existingUser.setProfile(profile);
        }

        if (firstName != null && !firstName.isEmpty()) {
            profile.setFirstName(firstName);
        }
        if (lastName != null && !lastName.isEmpty()) {
            profile.setLastName(lastName);
        }
        if (username != null && !username.isEmpty()) {
            existingUser.setUsername(username);
        }
    }

    protected OAuth2User extractOAuthUser(Authentication authentication) {
        if (authentication.getPrincipal() instanceof OAuth2User oauthUser) {
            return oauthUser;
        }
        throw new IllegalStateException("Principal is not OAuth2User");
    }

    protected String extractProvider(Authentication authentication) {
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            return oauthToken.getAuthorizedClientRegistrationId();
        }
        return authentication.getName();
    }

    protected void sendRedirect(HttpServletResponse response, String token) {
        try {
            response.sendRedirect(frontendUrl + "/oauth/callback?token=" + token);
        } catch (Exception e) {
            throw new RuntimeException("Failed to redirect after OAuth login", e);
        }
    }
}
