package com.bedtracker.userservice.controller;

import com.bedtracker.userservice.dto.*;
import com.bedtracker.userservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest authRequest) {
        try {
            log.info("Registration request received for user: {}", authRequest.getUsername());
            
            AuthResponse response = authService.register(authRequest);
            
            log.info("User registered successfully: {}", authRequest.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Registration failed for user {}: {}", authRequest.getUsername(), e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during registration for user {}: {}", authRequest.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Registration failed due to internal error"));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            log.info("Login request received for user: {}", loginRequest.getUsername());
            
            AuthResponse response = authService.login(loginRequest);
            
            log.info("User logged in successfully: {}", loginRequest.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Login failed for user {}: {}", loginRequest.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid username or password"));
        } catch (Exception e) {
            log.error("Unexpected error during login for user {}: {}", loginRequest.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Login failed due to internal error"));
        }
    }
    
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            log.info("Token validation request received");
            
            TokenValidationResponse response = authService.validateToken(authorizationHeader);
            
            if (response.isValid()) {
                log.info("Token validation successful for user: {}", response.getUsername());
                return ResponseEntity.ok(response);
            } else {
                log.warn("Token validation failed: {}", response.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
        } catch (Exception e) {
            log.error("Unexpected error during token validation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new TokenValidationResponse(false, null, null, null, "Token validation failed due to internal error"));
        }
    }
    
    // Simple error response class
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ErrorResponse {
        private String message;
    }
}
