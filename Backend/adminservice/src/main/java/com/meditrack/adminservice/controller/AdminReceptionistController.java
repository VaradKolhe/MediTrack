package com.meditrack.adminservice.controller;

import com.meditrack.adminservice.dto.ApiResponse;
import com.meditrack.adminservice.dto.ReceptionistRequest;
import com.meditrack.adminservice.dto.ReceptionistResponse;
import com.meditrack.adminservice.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/receptionists")
@RequiredArgsConstructor
public class AdminReceptionistController {

    private static final Logger log = LoggerFactory.getLogger(AdminReceptionistController.class);
    private final AdminService adminService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody ReceptionistRequest request) {
        try {
            log.info("Admin creating receptionist: {}", request.getUsername());
            ReceptionistResponse response = adminService.createReceptionist(request);
            log.info("Receptionist created successfully with ID: {}", response.getId());
            return ResponseEntity.ok(ApiResponse.success("Receptionist created successfully", response));
        } catch (Exception ex) {
            log.error("Error in create receptionist endpoint: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> list() {
        try {
            log.debug("Admin fetching all receptionists");
            return ResponseEntity.ok(ApiResponse.success("Receptionists fetched successfully", adminService.getAllReceptionists()));
        } catch (Exception ex) {
            log.error("Error in list receptionists endpoint: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> get(@PathVariable Long id) {
        try {
            log.debug("Admin fetching receptionist with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success("Receptionist fetched successfully", adminService.getReceptionist(id)));
        } catch (Exception ex) {
            log.error("Error in get receptionist endpoint for ID {}: {}", id, ex.getMessage(), ex);
            throw ex;
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody ReceptionistRequest request) {
        try {
            log.info("Admin updating receptionist with ID: {}", id);
            ReceptionistResponse response = adminService.updateReceptionist(id, request);
            log.info("Receptionist updated successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success("Receptionist updated successfully", response));
        } catch (Exception ex) {
            log.error("Error in update receptionist endpoint for ID {}: {}", id, ex.getMessage(), ex);
            throw ex;
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            log.info("Admin deleting receptionist with ID: {}", id);
            adminService.deleteReceptionist(id);
            log.info("Receptionist deleted successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success("Receptionist deleted successfully", null));
        } catch (Exception ex) {
            log.error("Error in delete receptionist endpoint for ID {}: {}", id, ex.getMessage(), ex);
            throw ex;
        }
    }
}


