package com.brandonkamga.teqizz.iam.domain.model;

import com.brandonkamga.teqizz.iam.domain.event.UserRegisteredEvent;
import com.brandonkamga.teqizz.iam.domain.model.vo.Email;
import com.brandonkamga.teqizz.iam.domain.model.vo.HashedPassword;
import com.brandonkamga.teqizz.iam.domain.model.vo.UserId;
import com.brandonkamga.teqizz.iam.domain.model.vo.Username;
import com.brandonkamga.teqizz.shared.domain.AggregateRoot;

/**
 * User — IAM aggregate root.
 * 
 */
public class User extends AggregateRoot<UserId> {

    private UserId id;
    private Email email;
    private Username username;
    private HashedPassword password;
    private String providerName;
    private String providerUserId;
    private String roleName;
    private Profile profile;

    private User() {}

    /**
     * Factory method for registering a brand-new user.
     * Raises a UserRegisteredEvent.
     */
    public static User register(UserId id, Email email, Username username,
                                HashedPassword password, String providerName,
                                String providerUserId, String roleName, Profile profile) {
        User user = new User();
        user.id = id;
        user.email = email;
        user.username = username;
        user.password = password;
        user.providerName = providerName;
        user.providerUserId = providerUserId;
        user.roleName = roleName;
        user.profile = profile;
        user.registerEvent(new UserRegisteredEvent(id, email.value(), username.value()));
        return user;
    }

    /**
     * Factory method for reconstituting a user from persistence (no domain events).
     */
    public static User reconstitute(UserId id, Email email, Username username,
                                    HashedPassword password, String providerName,
                                    String providerUserId, String roleName, Profile profile) {
        User user = new User();
        user.id = id;
        user.email = email;
        user.username = username;
        user.password = password;
        user.providerName = providerName;
        user.providerUserId = providerUserId;
        user.roleName = roleName;
        user.profile = profile;
        return user;
    }

    // Getters
    public UserId getId() { return id; }
    public Email getEmail() { return email; }
    public Username getUsername() { return username; }
    public HashedPassword getPassword() { return password; }
    public String getProviderName() { return providerName; }
    public String getProviderUserId() { return providerUserId; }
    public String getRoleName() { return roleName; }
    public Profile getProfile() { return profile; }

    // Setters used during update operations
    public void setEmail(Email email) { this.email = email; }
    public void setUsername(Username username) { this.username = username; }
    public void setPassword(HashedPassword password) { this.password = password; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    public void setProviderUserId(String providerUserId) { this.providerUserId = providerUserId; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public void setProfile(Profile profile) { this.profile = profile; }
}
