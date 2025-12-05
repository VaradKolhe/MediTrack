package com.meditrack.adminservice.controller;

import com.meditrack.adminservice.dto.ApiResponse;
import com.meditrack.adminservice.dto.HospitalRequest;
import com.meditrack.adminservice.dto.HospitalResponse;
import com.meditrack.adminservice.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/hospitals")
@RequiredArgsConstructor
public class AdminHospitalController {

    private static final Logger log = LoggerFactory.getLogger(AdminHospitalController.class);
    private final AdminService adminService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody HospitalRequest request) {
        try {
            log.info("Admin creating hospital: {}", request.getName());
            HospitalResponse response = adminService.createHospital(request);
            log.info("Hospital created successfully with ID: {}", response.getId());
            return ResponseEntity.ok(ApiResponse.success("Hospital created successfully", response));
        } catch (Exception ex) {
            log.error("Error in create hospital endpoint: {}", ex.getMessage(), ex);
            throw ex; // Let GlobalExceptionHandler handle it
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> list() {
        try {
            log.debug("Admin fetching all hospitals");
            return ResponseEntity.ok(ApiResponse.success("Hospitals fetched successfully", adminService.getAllHospitals()));
        } catch (Exception ex) {
            log.error("Error in list hospitals endpoint: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> get(@PathVariable Long id) {
        try {
            log.debug("Admin fetching hospital with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success("Hospital fetched successfully", adminService.getHospital(id)));
        } catch (Exception ex) {
            log.error("Error in get hospital endpoint for ID {}: {}", id, ex.getMessage(), ex);
            throw ex;
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody HospitalRequest request) {
        try {
            log.info("Admin updating hospital with ID: {}", id);
            HospitalResponse response = adminService.updateHospital(id, request);
            log.info("Hospital updated successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success("Hospital updated successfully", response));
        } catch (Exception ex) {
            log.error("Error in update hospital endpoint for ID {}: {}", id, ex.getMessage(), ex);
            throw ex;
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            log.info("Admin deleting hospital with ID: {}", id);
            adminService.deleteHospital(id);
            log.info("Hospital deleted successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success("Hospital deleted successfully", null));
        } catch (Exception ex) {
            log.error("Error in delete hospital endpoint for ID {}: {}", id, ex.getMessage(), ex);
            throw ex;
        }
    }
}


