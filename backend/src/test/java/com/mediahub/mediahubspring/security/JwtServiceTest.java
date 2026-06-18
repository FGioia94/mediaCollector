package com.mediahub.mediahubspring.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    @Test
    void generateAndValidateToken_withShortPlainTextSecret() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "short-secret@value");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86_400_000L);

        UserDetails userDetails = User.withUsername("short@example.com")
                .password("ignored")
                .authorities("ROLE_USER")
                .build();

        String token = jwtService.generateToken(userDetails);

        assertEquals("short@example.com", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void generateAndValidateToken_withPlainTextSecret() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "test-secret-key-test-secret-key-test-secret-key");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86_400_000L);

        UserDetails userDetails = User.withUsername("john@example.com")
                .password("ignored")
                .authorities("ROLE_USER")
                .build();

        String token = jwtService.generateToken(userDetails);

        assertEquals("john@example.com", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void generateAndValidateToken_withBase64Secret() {
        JwtService jwtService = new JwtService();
        String base64Secret = Base64.getEncoder()
                .encodeToString("test-secret-key-test-secret-key-test-secret-key".getBytes());
        ReflectionTestUtils.setField(jwtService, "secretKey", base64Secret);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86_400_000L);

        UserDetails userDetails = User.withUsername("jane@example.com")
                .password("ignored")
                .authorities("ROLE_USER")
                .build();

        String token = jwtService.generateToken(userDetails);

        assertEquals("jane@example.com", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, userDetails));
    }
}