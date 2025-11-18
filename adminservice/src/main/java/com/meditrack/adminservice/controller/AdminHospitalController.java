package com.meditrack.adminservice.controller;

import com.meditrack.adminservice.dto.ApiResponse;
import com.meditrack.adminservice.dto.HospitalRequest;
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
        log.info("Admin create hospital {}", request.getName());
        return ResponseEntity.ok(ApiResponse.success("Hospital created", adminService.createHospital(request)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> list() {
        return ResponseEntity.ok(ApiResponse.success("Hospitals fetched", adminService.getAllHospitals()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Hospital fetched", adminService.getHospital(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody HospitalRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Hospital updated", adminService.updateHospital(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        adminService.deleteHospital(id);
        return ResponseEntity.ok(ApiResponse.success("Hospital deleted", null));
    }
}


