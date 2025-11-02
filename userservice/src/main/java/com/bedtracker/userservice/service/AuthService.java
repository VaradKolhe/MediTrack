package com.bedtracker.userservice.service;

import com.bedtracker.userservice.dto.*;
import com.bedtracker.userservice.entity.Role;
import com.bedtracker.userservice.entity.User;
import com.bedtracker.userservice.security.CustomUserDetails;
import com.bedtracker.userservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    
    public AuthResponse register(AuthRequest authRequest) {
        log.info("Attempting to register new user: {}", authRequest.getUsername());
        
        // Check if username already exists
        if (userService.existsByUsername(authRequest.getUsername())) {
            log.warn("Registration failed: Username already exists - {}", authRequest.getUsername());
            throw new RuntimeException("Username is already taken!");
        }
        
        // Check if email already exists
        if (userService.existsByEmail(authRequest.getEmail())) {
            log.warn("Registration failed: Email already exists - {}", authRequest.getEmail());
            throw new RuntimeException("Email is already taken!");
        }
        
        // Create new user with default USER role
        User user = new User(
                authRequest.getUsername(),
                authRequest.getEmail(),
                passwordEncoder.encode(authRequest.getPassword()),
                Role.USER, // Default role
                authRequest.getFirstName(),
                authRequest.getLastName()
        );
        
        // Save user
        User savedUser = userService.save(user);
        log.info("User registered successfully: {}", savedUser.getUsername());
        
        // Generate JWT token
        UserDetails userDetails = userService.loadUserByUsername(savedUser.getUsername());
        String token = jwtUtil.generateToken(userDetails, createTokenClaims(savedUser));
        
        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getRole()
        );
    }
    
    public AuthResponse login(LoginRequest loginRequest) {
        log.info("Attempting to login user: {}", loginRequest.getUsername());
        
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );
            
            // Get user details
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();
            
            // Generate JWT token
            String token = jwtUtil.generateToken(userDetails, createTokenClaims(user));
            
            log.info("User logged in successfully: {}", user.getUsername());
            
            return new AuthResponse(
                    token,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getRole()
            );
            
        } catch (AuthenticationException e) {
            log.warn("Login failed for user: {} - {}", loginRequest.getUsername(), e.getMessage());
            throw new BadCredentialsException("Invalid username or password");
        }
    }
    
    public TokenValidationResponse validateToken(String token) {
        log.info("Validating JWT token");
        
        try {
            // Remove "Bearer " prefix if present
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            // Validate token structure and expiration
            if (!jwtUtil.validateToken(token)) {
                log.warn("Token validation failed: Invalid token");
                return new TokenValidationResponse(false, null, null, null, "Invalid token");
            }
            
            // Extract username from token
            String username = jwtUtil.extractUsername(token);
            
            // Load user details
            CustomUserDetails userDetails = (CustomUserDetails) userService.loadUserByUsername(username);
            
            // Validate token against user details
            if (!jwtUtil.validateToken(token, userDetails)) {
                log.warn("Token validation failed: Token doesn't match user details");
                return new TokenValidationResponse(false, null, null, null, "Token validation failed");
            }
            
            // Get user entity for additional info
            User user = userDetails.getUser();
            
            log.info("Token validated successfully for user: {}", username);
            
            return new TokenValidationResponse(
                    true,
                    user.getUsername(),
                    user.getId(),
                    user.getRole(),
                    "Token is valid"
            );
            
        } catch (Exception e) {
            log.error("Token validation error: {}", e.getMessage());
            return new TokenValidationResponse(false, null, null, null, "Token validation error: " + e.getMessage());
        }
    }

    private Map<String, Object> createTokenClaims(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRole().name());
        claims.put("email", user.getEmail());
        claims.put("firstName", user.getFirstName());
        claims.put("lastName", user.getLastName());
        return claims;
    }
}
