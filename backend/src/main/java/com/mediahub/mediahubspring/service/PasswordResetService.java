package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.model.PasswordResetToken;
import com.mediahub.mediahubspring.model.User;
import com.mediahub.mediahubspring.repository.PasswordResetTokenRepository;
import com.mediahub.mediahubspring.repository.UserRepository;
import com.mediahub.mediahubspring.util.EmailNormalizer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final MailService mailService;
    private final UserService userService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${app.password-reset.expiration-minutes:30}")
    private long expirationMinutes;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                MailService mailService,
                                UserService userService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.mailService = mailService;
        this.userService = userService;
    }

    @Transactional
    public String requestPasswordReset(String email) {
        String normalizedEmail = EmailNormalizer.normalize(email);
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);

        // Return success even when user does not exist to avoid account enumeration.
        if (user == null) {
            return null;
        }

        tokenRepository.deleteByUser_Id(user.getId());

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setToken(generateToken());
        token.setUsed(false);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(expirationMinutes));
        PasswordResetToken saved = tokenRepository.save(token);

        String resetLink = frontendBaseUrl + "/reset-password?token=" + saved.getToken();
        boolean sent = mailService.sendPasswordResetEmail(user.getEmail(), resetLink);
        return sent ? null : resetLink;
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        PasswordResetToken token = tokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Invalid reset token"));

        if (token.isUsed() || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(BAD_REQUEST, "Reset token expired or already used");
        }

        User updates = new User();
        updates.setPassword(newPassword);
        userService.update(token.getUser().getId(), updates);

        token.setUsed(true);
        tokenRepository.save(token);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
