package com.mediahub.mediahubspring.security;

import com.mediahub.mediahubspring.model.Role;
import com.mediahub.mediahubspring.model.User;
import com.mediahub.mediahubspring.repository.RoleRepository;
import com.mediahub.mediahubspring.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataAccessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@ConditionalOnProperty(value = "app.admin-bootstrap.enabled", havingValue = "true", matchIfMissing = true)
public class AdminBootstrap {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminBootstrapEmail;
    private final String adminBootstrapPassword;
    private final boolean syncPasswordOnStartup;

    public AdminBootstrap(UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          @Value("${app.admin-bootstrap.email:}") String adminBootstrapEmail,
                          @Value("${app.admin-bootstrap.password:}") String adminBootstrapPassword,
                          @Value("${app.admin-bootstrap.sync-password-on-startup:false}") boolean syncPasswordOnStartup) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminBootstrapEmail = adminBootstrapEmail;
        this.adminBootstrapPassword = adminBootstrapPassword;
        this.syncPasswordOnStartup = syncPasswordOnStartup;
    }

    @PostConstruct
    public void init() {
        try {
            // Keep core roles present even on a fresh database.
            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseGet(() -> roleRepository.save(new Role("ADMIN")));
            roleRepository.findByName("USER")
                    .orElseGet(() -> roleRepository.save(new Role("USER")));
            roleRepository.findByName("EDITOR")
                    .orElseGet(() -> roleRepository.save(new Role("EDITOR")));

            if (adminBootstrapEmail == null || adminBootstrapEmail.isBlank()) {
                if (!userRepository.existsByRoles_Name("ADMIN")) {
                    log.warn("Admin bootstrap is enabled but no email was configured. Set app.admin-bootstrap.email (for example via MEDIAHUB_ADMIN_EMAIL).");
                }
                assignMissingUsernames();
                return;
            }

            // Always ensure the configured email has ADMIN role, even if other admins exist.
            var existing = userRepository.findWithRolesByEmailIgnoreCase(adminBootstrapEmail);
            if (existing.isPresent()) {
                User existingUser = existing.get();
                Set<Role> updatedRoles = new HashSet<>(existingUser.getRoles());
                updatedRoles.add(adminRole);
                existingUser.setRoles(updatedRoles);

                // Optional password sync for local bootstrap/debug scenarios.
                if (syncPasswordOnStartup && adminBootstrapPassword != null && !adminBootstrapPassword.isBlank()) {
                    existingUser.setPassword(passwordEncoder.encode(adminBootstrapPassword));
                }

                if (isBlank(existingUser.getUsernameValue())) {
                    existingUser.setUsernameValue("ADMIN");
                }

                userRepository.save(existingUser);
                log.info("Existing user promoted to ADMIN: {}", existingUser.getEmail());
                assignMissingUsernames();
                return;
            }

            if (userRepository.existsByRoles_Name("ADMIN")) {
                log.info("Configured admin email {} not found. Existing ADMIN user detected, skipping admin user creation.", adminBootstrapEmail);
                assignMissingUsernames();
                return;
            }

            if (adminBootstrapPassword == null || adminBootstrapPassword.isBlank()) {
                log.warn("Admin bootstrap is enabled but no password was configured. Set app.admin-bootstrap.password (for example via MEDIAHUB_ADMIN_PASSWORD).");
                assignMissingUsernames();
                return;
            }

            User admin = new User();
            admin.setEmail(adminBootstrapEmail);
            // Password is always stored as bcrypt hash.
            admin.setPassword(passwordEncoder.encode(adminBootstrapPassword));
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setUsernameValue("ADMIN");
            admin.setRoles(Set.of(adminRole));

            userRepository.save(admin);
            log.info("Default ADMIN created: {}", adminBootstrapEmail);
            assignMissingUsernames();
        } catch (DataAccessException ex) {
            // Do not block app startup when schema is not initialized yet.
            log.warn("Skipping admin bootstrap because database is not ready: {}", ex.getMessage());
        }
    }

    private void assignMissingUsernames() {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            return;
        }

        if (users.size() == 2) {
            User adminUser = users.stream()
                    .filter(user -> user.getRoles().stream().anyMatch(role -> "ADMIN".equals(role.getName())))
                    .findFirst()
                    .orElse(null);
            if (adminUser != null && isBlank(adminUser.getUsernameValue())) {
                adminUser.setUsernameValue("ADMIN");
                userRepository.save(adminUser);
            }

            User nonAdminUser = users.stream()
                    .filter(user -> adminUser == null || !user.getId().equals(adminUser.getId()))
                    .findFirst()
                    .orElse(null);
            if (nonAdminUser != null && isBlank(nonAdminUser.getUsernameValue())) {
                nonAdminUser.setUsernameValue("mikamI411");
                userRepository.save(nonAdminUser);
            }
        }

        for (User user : users) {
            if (!isBlank(user.getUsernameValue())) {
                continue;
            }

            String baseUsername = fallbackFromEmail(user.getEmail());
            String candidate = baseUsername;
            int suffix = 1;
            while (userRepository.existsByUsernameIgnoreCase(candidate)) {
                candidate = baseUsername + suffix;
                suffix++;
            }

            user.setUsernameValue(candidate);
            userRepository.save(user);
        }
    }

    private String fallbackFromEmail(String email) {
        if (email == null || email.isBlank()) {
            return "user";
        }

        int atIdx = email.indexOf('@');
        String localPart = atIdx > 0 ? email.substring(0, atIdx) : email;
        String cleaned = localPart.replaceAll("[^A-Za-z0-9_]", "_");

        if (cleaned.length() < 3) {
            return "user";
        }
        if (cleaned.length() > 32) {
            return cleaned.substring(0, 32);
        }
        return cleaned;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
