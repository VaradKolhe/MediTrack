package com.bedtracker.hospitalservice.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Component
@Slf4j
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Failed to extract claims from token: {}", e.getMessage());
            throw new RuntimeException("Invalid JWT token", e);
        }
    }
    
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    public String generateToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }
    
    public Boolean validateToken(String token) {
        try {
            log.debug("Validating JWT token structure and expiration");
            
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            log.error("JWT token validation failed: {}", e.getMessage());
            return false;
        }
    }
    
    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("role", String.class);
    }
    
    public Long extractReceptionistId(String token) {
        Claims claims = extractAllClaims(token);
        Object receptionistId = claims.get("receptionistId");
        if (receptionistId == null) {
            return null;
        }
        if (receptionistId instanceof Long) {
            return (Long) receptionistId;
        }
        if (receptionistId instanceof Integer) {
            return ((Integer) receptionistId).longValue();
        }
        if (receptionistId instanceof String) {
            return Long.parseLong((String) receptionistId);
        }
        return null;
    }
    
    public Long extractHospitalId(String token) {
        Claims claims = extractAllClaims(token);
        Object hospitalId = claims.get("hospitalId");
        if (hospitalId == null) {
            return null;
        }
        if (hospitalId instanceof Long) {
            return (Long) hospitalId;
        }
        if (hospitalId instanceof Integer) {
            return ((Integer) hospitalId).longValue();
        }
        if (hospitalId instanceof String) {
            return Long.parseLong((String) hospitalId);
        }
        return null;
    }
}

