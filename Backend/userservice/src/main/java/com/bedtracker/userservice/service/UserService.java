package com.bedtracker.userservice.service;

import com.bedtracker.userservice.dto.*;
import com.bedtracker.userservice.entity.Role;
import com.bedtracker.userservice.entity.User;
import com.bedtracker.userservice.repository.UserRepository;
import com.bedtracker.userservice.security.CustomUserDetails;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    // --- Generic User Logic ---

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        return mapToUserResponse(user);
    }

    public UserResponse updateUser(Long id, UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setHospitalId(request.getHospitalId());

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
    }

    // --- Receptionist Logic ---

    public ReceptionistResponse createReceptionist(ReceptionistRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already in use");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setHospitalId(request.getHospitalId());
        user.setRole(Role.RECEPTIONIST);

        // Admin-created receptionists are usually auto-enabled
        user.setIsEnabled(true);

        User savedUser = userRepository.save(user);
        return mapToReceptionistResponse(savedUser);
    }

    public List<ReceptionistResponse> getAllReceptionists() {
        return userRepository.findByRole(Role.RECEPTIONIST).stream()
                .map(this::mapToReceptionistResponse)
                .collect(Collectors.toList());
    }

    public ReceptionistResponse getReceptionistById(Long id) {
        User user = userRepository.findByIdAndRole(id, Role.RECEPTIONIST)
                .orElseThrow(() -> new RuntimeException("Receptionist not found with ID: " + id));
        return mapToReceptionistResponse(user);
    }

    public ReceptionistResponse updateReceptionist(Long id, ReceptionistRequest request) {
        User user = userRepository.findByIdAndRole(id, Role.RECEPTIONIST)
                .orElseThrow(() -> new RuntimeException("Receptionist not found with ID: " + id));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setHospitalId(request.getHospitalId());

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User savedUser = userRepository.save(user);
        return mapToReceptionistResponse(savedUser);
    }

    public void deleteReceptionist(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receptionist not found with ID: " + id));
        userRepository.delete(user);
    }

    // --- Mappers ---

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

    private ReceptionistResponse mapToReceptionistResponse(User user) {
        return new ReceptionistResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getIsEnabled(),
                user.getHospitalId(),
                user.getCreatedAt()
        );
    }

    public boolean existsByUsername(@NotBlank(message = "Username is required") @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters") String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(@NotBlank(message = "Email is required") @Email(message = "Email should be valid") String email) {
        return userRepository.existsByEmail(email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("Loading user by username: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("User not found with username: {}", username);
                    return new UsernameNotFoundException("User not found with username: " + username);
                });

        if (!user.getIsEnabled()) {
            log.warn("User account is disabled: {}", user.getUsername());
            throw new UsernameNotFoundException("User account is disabled. Please verify your email.");
        }

        log.info("User loaded successfully: {}", user.getUsername());
        return new CustomUserDetails(user);
    }
}