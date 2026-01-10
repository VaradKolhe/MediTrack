package com.meditrack.adminservice.controller;

import com.meditrack.adminservice.dto.ApiResponse;
import com.meditrack.adminservice.dto.UserRequest;
import com.meditrack.adminservice.dto.UserResponse;
import com.meditrack.adminservice.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private static final Logger log = LoggerFactory.getLogger(AdminUserController.class);
    private final AdminService adminService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody UserRequest request) {
        try {
            log.info("Admin creating user: {}", request.getUsername());
            UserResponse response = adminService.createUser(request);
            log.info("User created successfully with ID: {}", response.getId());
            return ResponseEntity.ok(ApiResponse.success("User created successfully", response));
        } catch (Exception ex) {
            log.error("Error in create user endpoint: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> list() {
        try {
            log.debug("Admin fetching all users");
            return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", adminService.getAllUsers()));
        } catch (Exception ex) {
            log.error("Error in list users endpoint: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> get(@PathVariable Long id) {
        try {
            log.debug("Admin fetching user with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success("User fetched successfully", adminService.getUser(id)));
        } catch (Exception ex) {
            log.error("Error in get user endpoint for ID {}: {}", id, ex.getMessage(), ex);
            throw ex;
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        try {
            log.info("Admin updating user with ID: {}", id);
            UserResponse response = adminService.updateUser(id, request);
            log.info("User updated successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", response));
        } catch (Exception ex) {
            log.error("Error in update user endpoint for ID {}: {}", id, ex.getMessage(), ex);
            throw ex;
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            log.info("Admin deleting user with ID: {}", id);
            adminService.deleteUser(id);
            log.info("User deleted successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
        } catch (Exception ex) {
            log.error("Error in delete user endpoint for ID {}: {}", id, ex.getMessage(), ex);
            throw ex;
        }
    }
}


