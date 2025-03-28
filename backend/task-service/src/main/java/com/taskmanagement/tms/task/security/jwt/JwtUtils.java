package com.taskmanagement.tms.task.security.jwt;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    
    private void logJwtError(String message, Object... args) {
        logger.error(message, args);
        
    }

    public String getUserNameFromJwtToken(String token) {
        try {
            logger.info("Attempting to parse JWT token using HS256");
            
            return Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (SignatureException e) {
            logJwtError("Invalid JWT signature: {}", e.getMessage());
            throw new RuntimeException("Invalid JWT signature", e);
        } catch (MalformedJwtException e) {
            logJwtError("Invalid JWT token: {}", e.getMessage());
            throw new RuntimeException("Invalid JWT token", e);
        } catch (ExpiredJwtException e) {
            logJwtError("JWT token is expired: {}", e.getMessage());
            throw new RuntimeException("JWT token is expired", e);
        } catch (UnsupportedJwtException e) {
            logJwtError("JWT token is unsupported: {}", e.getMessage());
            throw new RuntimeException("JWT token is unsupported", e);
        } catch (IllegalArgumentException e) {
            logJwtError("JWT claims string is empty: {}", e.getMessage());
            throw new RuntimeException("JWT claims string is empty", e);
        } catch (Exception e) {
            logJwtError("Unexpected error parsing JWT token: {}", e.getMessage());
            throw new RuntimeException("Unexpected error parsing JWT token", e);
        }
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (SignatureException e) {
            logJwtError("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logJwtError("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logJwtError("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logJwtError("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logJwtError("JWT claims string is empty: {}", e.getMessage());
        } catch (Exception e) {
            logJwtError("Unexpected error validating token: {}", e.getMessage());
        }

        return false;
    }
} 