package com.bedtracker.userservice.service;

import com.bedtracker.userservice.dto.*;
import com.bedtracker.userservice.entity.Role;
import com.bedtracker.userservice.entity.User;
import com.bedtracker.userservice.repository.UserRepository;
import com.bedtracker.userservice.security.CustomUserDetails;
import com.bedtracker.userservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final RestTemplate restTemplate;

    private final EmailService emailService; // Injected EmailService
    private final UserRepository userRepository;

    public UserResponse getMe(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid authorization header");
        }
        String token = authorizationHeader.substring(7);
        Long id = jwtUtil.extractUserId(token);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return mapToUserResponse(user);
    }

    // --- Authentication & Registration Logic ---

    public UserResponse registerUser(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already in use");
        }

        // Generate 6-digit OTP
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        // In your Register Service
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .hospitalId(request.getHospitalId())
                .role(Role.USER)
                .isEnabled(false)
                .verificationCode(otp) // Set OTP here
                .verificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15))
                .build();

        System.out.println("OTP before save: " + user.getVerificationCode()); // Check console
        User savedUser = userRepository.save(user);
        System.out.println("OTP after save: " + savedUser.getVerificationCode()); // Check console

        // Send Email
        emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getFirstName(), otp);

        return mapToUserResponse(savedUser);
    }

    public void verifyUser(VerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getIsEnabled()) {
            return; // Already verified
        }

        if (user.getVerificationCodeExpiresAt() != null &&
                user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code has expired");
        }

        if (user.getVerificationCode() != null &&
                user.getVerificationCode().equals(request.getVerificationCode())) {

            // Enable user and clear OTP

            user.setIsEnabled(true);
            log.info("Service Verification Success");
            // user.setVerificationCode(null);
            // user.setVerificationCodeExpiresAt(null);
            userRepository.save(user);
        } else {
            throw new RuntimeException("Invalid verification code");
        }
    }

    public AuthResponse login(LoginRequest loginRequest) {
        log.info("Attempting to login user: {}", loginRequest.getUsername());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();

            if (!user.getIsEnabled()) {
                throw new DisabledException("User is not enabled");
            }

            if (user.getRole() == Role.RECEPTIONIST) {
                Long hospitalId = user.getHospitalId();
                if (hospitalId == null) {
                    log.warn("No hospitalId associated with staff user: {}", user.getUsername());
                    throw new BadCredentialsException("Staff account is not associated with a hospital");
                }

                Map<String, Object> payload = new HashMap<>();
                payload.put("username", user.getUsername());
                payload.put("hospitalId", hospitalId);
                payload.put("receptionistId", user.getId());
                payload.put("role", "RECEPTIONIST");
                Map<?, ?> response = restTemplate.postForObject("http://localhost:8081/public/auth/staff/login", payload, Map.class);
                if (response == null || !Boolean.TRUE.equals(response.get("success"))) {
                    log.warn("Staff login forwarding failed for user: {}", user.getUsername());
                    throw new BadCredentialsException("Staff authentication failed");
                }
                Object dataObj = response.get("data");
                if (!(dataObj instanceof Map)) {
                    log.warn("Invalid response structure from hospital-service for staff login");
                    throw new BadCredentialsException("Staff authentication failed");
                }
                Map<?, ?> data = (Map<?, ?>) dataObj;
                Object tokenObj = data.get("token");
                if (!(tokenObj instanceof String)) {
                    log.warn("Token missing in hospital-service response for staff login");
                    throw new BadCredentialsException("Staff authentication failed");
                }
                String token = (String) tokenObj;
                log.info("Staff logged in successfully: {}", user.getUsername());
                return new AuthResponse(
                        token,
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getRole()
                );
            } else {
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
            }

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

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getIsEnabled(),
                user.getHospitalId(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
