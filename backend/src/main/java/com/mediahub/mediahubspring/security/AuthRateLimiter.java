package com.mediahub.mediahubspring.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayDeque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AuthRateLimiter {

    private final Map<String, ArrayDeque<Long>> buckets = new ConcurrentHashMap<>();

    @Value("${app.rate-limit.auth.max-requests:10}")
    private int maxRequests;

    @Value("${app.rate-limit.auth.window-seconds:60}")
    private int windowSeconds;

    public void checkOrThrow(String action, HttpServletRequest request) {
        String clientIp = resolveClientIp(request);
        String key = action + "|" + clientIp;

        long now = System.currentTimeMillis();
        long windowMs = Math.max(1, windowSeconds) * 1000L;

        ArrayDeque<Long> queue = buckets.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (queue) {
            while (!queue.isEmpty() && now - queue.peekFirst() >= windowMs) {
                queue.removeFirst();
            }

            if (queue.size() >= Math.max(1, maxRequests)) {
                long retryAfterMs = windowMs - (now - queue.peekFirst());
                long retryAfterSec = Math.max(1, (retryAfterMs + 999) / 1000);
                throw new ResponseStatusException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "Too many requests. Try again in " + retryAfterSec + " seconds."
                );
            }

            queue.addLast(now);
        }
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            String first = forwardedFor.split(",")[0].trim();
            if (!first.isEmpty()) {
                return first;
            }
        }

        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }

        String remoteAddr = request.getRemoteAddr();
        return remoteAddr == null || remoteAddr.isBlank() ? "unknown" : remoteAddr;
    }
}
