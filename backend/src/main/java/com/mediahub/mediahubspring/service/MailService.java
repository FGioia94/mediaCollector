package com.mediahub.mediahubspring.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${app.mail.from:}")
    private String configuredFromAddress;

    @Value("${spring.mail.host:}")
    private String smtpHost;

    public MailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSender = mailSenderProvider.getIfAvailable();
    }

    public boolean sendPasswordResetEmail(String to, String resetLink) {
        if (smtpHost == null || smtpHost.isBlank()) {
            log.warn("SMTP is not configured. Password reset link for {}: {}", to, resetLink);
            return false;
        }

        if (mailSender == null) {
            log.warn("SMTP host is configured but JavaMailSender is unavailable. Password reset link for {}: {}", to, resetLink);
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            String from = (configuredFromAddress != null && !configuredFromAddress.isBlank())
                    ? configuredFromAddress
                    : smtpUsername;

            if (from != null && !from.isBlank()) {
                message.setFrom(from);
            }
            message.setTo(to);
            message.setSubject("MediaHub password reset");
            message.setText("We received a password reset request for your MediaHub account.\n\n"
                    + "Reset your password here:\n"
                    + resetLink
                    + "\n\nIf you did not request this, you can ignore this email.");
            mailSender.send(message);
            log.info("Password reset email accepted by SMTP provider. host={} from={} to={}", smtpHost, from, to);
            return true;
        } catch (MailException ex) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Could not send reset email");
        }
    }
}
