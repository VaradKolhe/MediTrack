package com.bedtracker.userservice.controller;

import com.bedtracker.userservice.dto.*;
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

    // --- Generic User Endpoints ---

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(userService.getAllUsers());
        } catch (Exception e) {
            log.error("Error fetching all users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch users"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.getUserById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Internal Error"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserRequest request) {
        try {
            return ResponseEntity.ok(userService.updateUser(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Update error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to update user"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(new SuccessResponse("User deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to delete user"));
        }
    }

    // --- Receptionist Endpoints (Matched to AdminService) ---

    @PostMapping("/receptionists")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createReceptionist(@RequestBody ReceptionistRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(userService.createReceptionist(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Create receptionist error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Error creating receptionist"));
        }
    }

    @GetMapping("/receptionists")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllReceptionists() {
        try {
            return ResponseEntity.ok(userService.getAllReceptionists());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to fetch receptionists"));
        }
    }

    @GetMapping("/receptionists/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getReceptionistById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.getReceptionistById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Error fetching receptionist"));
        }
    }

    @PutMapping("/receptionists/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateReceptionist(@PathVariable Long id, @RequestBody ReceptionistRequest request) {
        try {
            return ResponseEntity.ok(userService.updateReceptionist(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to update receptionist"));
        }
    }

    @DeleteMapping("/receptionists/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteReceptionist(@PathVariable Long id) {
        try {
            userService.deleteReceptionist(id);
            return ResponseEntity.ok(new SuccessResponse("Receptionist deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to delete receptionist"));
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ErrorResponse { private String message; }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SuccessResponse { private String message; }
}