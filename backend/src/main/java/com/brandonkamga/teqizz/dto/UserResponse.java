package com.brandonkamga.teqizz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String providerName;
    private String providerUserId;
    private String roleName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Profile fields
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private String country;
    private String bio;
    private String githubUrl;
    private String linkedinUrl;
    private String twitterUrl;
    private String websiteUrl;
}
