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

    public AdminBootstrap(UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          @Value("${app.admin-bootstrap.email:}") String adminBootstrapEmail,
                          @Value("${app.admin-bootstrap.password:}") String adminBootstrapPassword) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminBootstrapEmail = adminBootstrapEmail;
        this.adminBootstrapPassword = adminBootstrapPassword;
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

            // Skip if there is already at least an ADMIN user
            if (userRepository.existsByRoles_Name("ADMIN")) {
                return;
            }

            if (adminBootstrapEmail == null || adminBootstrapEmail.isBlank()) {
                log.warn("Admin bootstrap is enabled but no email was configured. Set app.admin-bootstrap.email (for example via MEDIAHUB_ADMIN_EMAIL).");
                return;
            }

            if (adminBootstrapPassword == null || adminBootstrapPassword.isBlank()) {
                log.warn("Admin bootstrap is enabled but no password was configured. Set app.admin-bootstrap.password (for example via MEDIAHUB_ADMIN_PASSWORD).");
                return;
            }

            User admin = new User();
            admin.setEmail(adminBootstrapEmail);
            // Password is always stored as bcrypt hash.
            admin.setPassword(passwordEncoder.encode(adminBootstrapPassword));
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setRoles(Set.of(adminRole));

            userRepository.save(admin);
            log.info("Default ADMIN created: {}", adminBootstrapEmail);
        } catch (DataAccessException ex) {
            // Do not block app startup when schema is not initialized yet.
            log.warn("Skipping admin bootstrap because database is not ready: {}", ex.getMessage());
        }
    }
}
