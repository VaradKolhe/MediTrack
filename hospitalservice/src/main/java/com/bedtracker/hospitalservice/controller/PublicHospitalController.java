package com.bedtracker.hospitalservice.controller;

import com.bedtracker.hospitalservice.dto.ApiResponse;
import com.bedtracker.hospitalservice.dto.HospitalResponse;
import com.bedtracker.hospitalservice.service.HospitalService;
import com.bedtracker.hospitalservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("permitAll()")
public class PublicHospitalController {

    private final HospitalService hospitalService;
    private final JwtUtil jwtUtil;

    @GetMapping("/hospitals")
    public ResponseEntity<ApiResponse<?>> getPublicHospitals() {
        log.info("Public request: Fetching all hospitals with no authentication");

        List<HospitalResponse> hospitals = hospitalService.getAllHospitals();

        return ResponseEntity.ok(
                ApiResponse.success("Public hospitals retrieved successfully", hospitals)
        );
    }

    @PostMapping("/auth/staff/login")
    public ResponseEntity<ApiResponse<?>> staffLogin(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.get("username");
        Object hospitalIdObj = payload.get("hospitalId");
        Object receptionistIdObj = payload.get("receptionistId");
        String role = "RECEPTIONIST";

        Long hospitalId = hospitalIdObj == null ? null : Long.valueOf(hospitalIdObj.toString());
        Long receptionistId = receptionistIdObj == null ? null : Long.valueOf(receptionistIdObj.toString());

        if (username == null || hospitalId == null || receptionistId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Missing required fields"));
        }

        java.util.Map<String, Object> claims = new java.util.HashMap<>();
        claims.put("role", role);
        claims.put("hospitalId", hospitalId);
        claims.put("receptionistId", receptionistId);

        String token = jwtUtil.generateToken(claims, username);

        return ResponseEntity.ok(ApiResponse.success("Staff authenticated", java.util.Map.of("token", token, "type", "Bearer")));
    }
}
