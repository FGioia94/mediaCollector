package com.mediahub.mediahubspring.security;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class UserSchemaBootstrap {

    private static final Logger log = LoggerFactory.getLogger(UserSchemaBootstrap.class);

    private final JdbcTemplate jdbcTemplate;

    public UserSchemaBootstrap(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void ensureUsernameColumn() {
        try {
            jdbcTemplate.execute("""
                    ALTER TABLE users
                    ADD COLUMN IF NOT EXISTS username VARCHAR(32)
                    """);

            // Backfill existing rows deterministically and uniquely.
            jdbcTemplate.execute("""
                    UPDATE users
                    SET username = CONCAT('user_', id)
                    WHERE username IS NULL OR BTRIM(username) = ''
                    """);

            jdbcTemplate.execute("""
                    CREATE UNIQUE INDEX IF NOT EXISTS ux_users_username_lower
                    ON users (LOWER(username))
                    """);

            log.info("Username schema bootstrap completed.");
        } catch (DataAccessException ex) {
            log.warn("Could not apply username schema bootstrap: {}", ex.getMessage());
        }
    }
}
