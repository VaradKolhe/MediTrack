package com.bedtracker.hospitalservice.service;

import com.bedtracker.hospitalservice.dto.HospitalRequest;
import com.bedtracker.hospitalservice.dto.HospitalResponse;
import com.bedtracker.hospitalservice.entity.Hospital;
import com.bedtracker.hospitalservice.exception.ResourceNotFoundException;
import com.bedtracker.hospitalservice.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HospitalService {
    
    private final HospitalRepository hospitalRepository;
    
    public HospitalResponse getHospitalById(Long id) {
        log.info("Fetching hospital with ID: {}", id);
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Hospital not found with ID: " + id
                ));
        return HospitalResponse.fromEntity(hospital);
    }
    
    public List<HospitalResponse> getAllHospitals() {
        log.info("Fetching all hospitals");
        return hospitalRepository.findAll().stream()
                .map(HospitalResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public HospitalResponse saveHospital(Hospital hospital) {
        log.info("Saving hospital: {}", hospital.getName());
        Hospital savedHospital = hospitalRepository.save(hospital);
        log.info("Hospital saved successfully with ID: {}", savedHospital.getId());
        return HospitalResponse.fromEntity(savedHospital);
    }
    
    @Transactional
    public HospitalResponse createHospital(HospitalRequest request) {
        log.info("Creating new hospital: {}", request.getName());
        
        Hospital hospital = Hospital.builder()
                .name(request.getName())
                .address(request.getAddress())
                .contactNumber(request.getContactNumber())
                .email(request.getEmail())
                .totalRooms(request.getTotalRooms())
                .totalBeds(request.getTotalBeds())
                .build();
        
        Hospital savedHospital = hospitalRepository.save(hospital);
        log.info("Hospital created successfully with ID: {}", savedHospital.getId());
        return HospitalResponse.fromEntity(savedHospital);
    }
}

