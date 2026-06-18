package com.mediahub.mediahubspring.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

//LOGIN
// The user sends email + password.
// If the credentials are correct → generate a JWT.
// return the JWT.

//SUBSEQUENT REQUESTS
// The frontend sends the token in the Authorization header.
// The JWT filter intercepts the request.
// It uses the JwtService to:
// extract the email
// validate the token
// Then it:
// loads the user from the database
// sets the user inside the SecurityContext
// The request then proceeds as an authenticated request.

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}") // Token expiration time in milliseconds
    private Long jwtExpiration;

    // Generates a JWT for the authenticated user
    public String generateToken(UserDetails userDetails) {
        return buildToken(Map.of(), userDetails);
    }

    // Builds the JWT with optional extra claims
    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)                       // custom claims (optional)
                .setSubject(userDetails.getUsername())        // email as subject
                .setIssuedAt(new Date(System.currentTimeMillis())) // token creation time
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration)) // expiration
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // signing algorithm
                .compact();
    }

    // Extracts the username (email) from the token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Validates the token by checking username and expiration
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // Checks if the token is expired
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Extracts the expiration date from the token
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Generic method to extract any claim from the token
    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        final Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    // Parses the token and retrieves all claims
    private Claims extractAllClaims(String token) {
        return Jwts.parser()               // correct parser for modern jjwt
                .setSigningKey(getSignInKey())    // signing key for validation
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Accept either a Base64-encoded secret or a raw text secret from the environment.
    private Key getSignInKey() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secretKey);
        } catch (IllegalArgumentException | DecodingException ex) {
            keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(normalizeKeyLength(keyBytes));
    }

    private byte[] normalizeKeyLength(byte[] keyBytes) {
        if (keyBytes.length >= 32) {
            return keyBytes;
        }

        try {
            return MessageDigest.getInstance("SHA-256").digest(keyBytes);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 algorithm is unavailable", ex);
        }
    }
}