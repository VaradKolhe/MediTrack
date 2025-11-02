package com.bedtracker.hospitalservice.controller;

import com.bedtracker.hospitalservice.dto.ApiResponse;
import com.bedtracker.hospitalservice.dto.HospitalRequest;
import com.bedtracker.hospitalservice.dto.HospitalResponse;
import com.bedtracker.hospitalservice.service.HospitalService;
import com.bedtracker.hospitalservice.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hospitals")
@RequiredArgsConstructor
@Slf4j
public class HospitalController {
    
    private final HospitalService hospitalService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllHospitals() {
        String role = SecurityUtil.getRole();
        
        log.info("Fetching hospitals - Role: {}", role);
        
        // Admins can see all hospitals, receptionists can only see their own
        if ("ADMIN".equalsIgnoreCase(role)) {
            List<HospitalResponse> hospitals = hospitalService.getAllHospitals();
            return ResponseEntity.ok(ApiResponse.success("All hospitals retrieved successfully", hospitals));
        } else {
            // Receptionists can only see their own hospital
            Long hospitalId = SecurityUtil.getHospitalId();
            HospitalResponse hospital = hospitalService.getHospitalById(hospitalId);
            return ResponseEntity.ok(ApiResponse.success("Hospital retrieved successfully", hospital));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HospitalResponse>> getHospitalById(@PathVariable Long id) {
        String role = SecurityUtil.getRole();
        
        log.info("Fetching hospital {} - Role: {}", id, role);
        
        // Admins can access any hospital, receptionists can only access their own
        if (!"ADMIN".equalsIgnoreCase(role)) {
            Long hospitalId = SecurityUtil.getHospitalId();
            if (!hospitalId.equals(id)) {
                return ResponseEntity.status(403)
                        .body(ApiResponse.error("Access denied: You can only view your own hospital"));
            }
        }
        
        HospitalResponse hospital = hospitalService.getHospitalById(id);
        return ResponseEntity.ok(ApiResponse.success("Hospital retrieved successfully", hospital));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<HospitalResponse>> createHospital(
            @Valid @RequestBody HospitalRequest request) {
        
        String role = SecurityUtil.getRole();
        
        // Only admins can create hospitals (for inter-service calls from admin-service)
        if (!"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("Access denied: Only admins can create hospitals"));
        }
        
        log.info("Creating new hospital: {}", request.getName());
        HospitalResponse hospital = hospitalService.createHospital(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Hospital created successfully", hospital));
    }
}

