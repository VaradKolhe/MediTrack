package com.bedtracker.userservice.service;

import com.bedtracker.userservice.dto.UserResponse;
import com.bedtracker.userservice.entity.User;
import com.bedtracker.userservice.repository.UserRepository;
import com.bedtracker.userservice.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("Loading user by username: {}", username);
        User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if(!user.getIsEnabled()) {
            log.warn("User account is disabled: {}", user.getUsername());
            throw new UsernameNotFoundException("User account is disabled");
        }
        log.info("User loaded successfully: {}", user.getUsername());
        return new CustomUserDetails(user);
    }
    
    public List<UserResponse> getAllUsers() {
        log.info("Fetching all users");
        
        List<User> users = userRepository.findAll();
        log.info("Found {} users", users.size());
        
        return users.stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }
    
    public UserResponse getUserById(Long id) {
        log.info("Fetching user by ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", id);
                    return new RuntimeException("User not found with ID: " + id);
                });
        
        log.info("User found: {}", user.getUsername());
        return new UserResponse(user);
    }
    
    public UserResponse getUserByUsername(String username) {
        log.info("Fetching user by username: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("User not found with username: {}", username);
                    return new RuntimeException("User not found with username: " + username);
                });
        
        log.info("User found: {}", user.getUsername());
        return new UserResponse(user);
    }
    
    public void deleteUser(Long id) {
        log.info("Deleting user with ID: {}", id);
        
        if (!userRepository.existsById(id)) {
            log.warn("User not found with ID: {}", id);
            throw new RuntimeException("User not found with ID: " + id);
        }
        
        userRepository.deleteById(id);
        log.info("User deleted successfully with ID: {}", id);
    }
    
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public User save(User user) {
        log.info("Saving user: {}", user.getUsername());
        return userRepository.save(user);
    }
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
