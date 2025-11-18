package com.meditrack.adminservice.controller;

import com.meditrack.adminservice.dto.ApiResponse;
import com.meditrack.adminservice.dto.ReceptionistRequest;
import com.meditrack.adminservice.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/receptionists")
@RequiredArgsConstructor
public class AdminReceptionistController {

    private final AdminService adminService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody ReceptionistRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Receptionist created", adminService.createReceptionist(request)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> list() {
        return ResponseEntity.ok(ApiResponse.success("Receptionists fetched", adminService.getAllReceptionists()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Receptionist fetched", adminService.getReceptionist(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody ReceptionistRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Receptionist updated", adminService.updateReceptionist(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        adminService.deleteReceptionist(id);
        return ResponseEntity.ok(ApiResponse.success("Receptionist deleted", null));
    }
}


