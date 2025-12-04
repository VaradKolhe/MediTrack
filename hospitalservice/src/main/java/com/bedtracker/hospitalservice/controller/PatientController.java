package com.bedtracker.hospitalservice.controller;

import com.bedtracker.hospitalservice.dto.ApiResponse;
import com.bedtracker.hospitalservice.dto.PatientRegisterRequest;
import com.bedtracker.hospitalservice.dto.PatientResponse;
import com.bedtracker.hospitalservice.dto.PatientUpdateRequest;
import com.bedtracker.hospitalservice.service.PatientService;
import com.bedtracker.hospitalservice.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('RECEPTIONIST')")
public class PatientController {
    
    private final PatientService patientService;
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<PatientResponse>> registerPatient(
            @Valid @RequestBody PatientRegisterRequest request) {
        
        Long hospitalId = SecurityUtil.getHospitalId();
        log.info("Received patient registration request for hospital: {}", hospitalId);
        
        PatientResponse patient = patientService.registerPatient(request, hospitalId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Patient registered successfully", patient));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientResponse>>> getAllPatients() {
        
        Long hospitalId = SecurityUtil.getHospitalId();
        log.info("Fetching all patients for hospital: {}", hospitalId);
        
        List<PatientResponse> patients = patientService.getAllPatients(hospitalId);
        return ResponseEntity.ok(ApiResponse.success("Patients retrieved successfully", patients));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatientById(
            @PathVariable Long id) {
        
        Long hospitalId = SecurityUtil.getHospitalId();
        log.info("Fetching patient {} for hospital: {}", id, hospitalId);
        
        PatientResponse patient = patientService.getPatientById(id, hospitalId);
        return ResponseEntity.ok(ApiResponse.success("Patient retrieved successfully", patient));
    }
    
    @GetMapping("/room/{roomId}")
    public ResponseEntity<ApiResponse<List<PatientResponse>>> getPatientsByRoom(
            @PathVariable Long roomId) {
        
        Long hospitalId = SecurityUtil.getHospitalId();
        log.info("Fetching patients in room {} for hospital: {}", roomId, hospitalId);
        
        List<PatientResponse> patients = patientService.getPatientsByRoom(roomId, hospitalId);
        return ResponseEntity.ok(ApiResponse.success("Patients retrieved successfully", patients));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponse>> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientUpdateRequest request) {
        
        Long hospitalId = SecurityUtil.getHospitalId();
        log.info("Updating patient {} for hospital: {}", id, hospitalId);
        
        PatientResponse patient = patientService.updatePatient(id, request, hospitalId);
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", patient));
    }
    
    @PutMapping("/discharge/{id}")
    public ResponseEntity<ApiResponse<PatientResponse>> dischargePatient(
            @PathVariable Long id) {
        
        Long hospitalId = SecurityUtil.getHospitalId();
        log.info("Discharging patient {} for hospital: {}", id, hospitalId);
        
        PatientResponse patient = patientService.dischargePatient(id, hospitalId);
        return ResponseEntity.ok(ApiResponse.success("Patient discharged successfully", patient));
    }
}

