package com.bedtracker.userservice.controller;

import com.bedtracker.userservice.dto.UserResponse;
import com.bedtracker.userservice.service.UserService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    
    private final UserService userService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            log.info("Request to fetch all users received");
            
            List<UserResponse> users = userService.getAllUsers();
            
            log.info("Successfully fetched {} users", users.size());
            return ResponseEntity.ok(users);
            
        } catch (Exception e) {
            log.error("Error fetching all users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch users due to internal error"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            log.info("Request to fetch user by ID: {}", id);
            
            UserResponse user = userService.getUserById(id);
            
            log.info("Successfully fetched user with ID: {}", id);
            return ResponseEntity.ok(user);
            
        } catch (RuntimeException e) {
            log.error("User not found with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found with ID: " + id));
        } catch (Exception e) {
            log.error("Error fetching user with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch user due to internal error"));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            log.info("Request to delete user with ID: {}", id);
            
            userService.deleteUser(id);
            
            log.info("Successfully deleted user with ID: {}", id);
            return ResponseEntity.ok(new SuccessResponse("User deleted successfully"));
            
        } catch (RuntimeException e) {
            log.error("User not found with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found with ID: " + id));
        } catch (Exception e) {
            log.error("Error deleting user with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to delete user due to internal error"));
        }
    }
    
    // Simple response classes
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ErrorResponse {
        private String message;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SuccessResponse {
        private String message;
    }
}
