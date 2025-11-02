package com.bedtracker.hospitalservice.service;

import com.bedtracker.hospitalservice.dto.PatientRegisterRequest;
import com.bedtracker.hospitalservice.dto.PatientResponse;
import com.bedtracker.hospitalservice.dto.PatientUpdateRequest;
import com.bedtracker.hospitalservice.entity.Patient;
import com.bedtracker.hospitalservice.exception.BadRequestException;
import com.bedtracker.hospitalservice.exception.ResourceAlreadyExistsException;
import com.bedtracker.hospitalservice.exception.ResourceNotFoundException;
import com.bedtracker.hospitalservice.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientService {
    
    private final PatientRepository patientRepository;
    
    @Transactional
    public PatientResponse registerPatient(PatientRegisterRequest request, Long hospitalId) {
        log.info("Registering new patient for hospital: {}", hospitalId);
        
        // Check for duplicate by contact number
        patientRepository.findByContactNumberAndHospitalId(request.getContactNumber(), hospitalId)
                .ifPresent(patient -> {
                    throw new ResourceAlreadyExistsException(
                            "Patient with contact number " + request.getContactNumber() + " already exists"
                    );
                });
        
        // Create patient entity using builder
        Patient patient = Patient.builder()
                .hospitalId(hospitalId)
                .name(request.getName())
                .age(request.getAge())
                .gender(request.getGender())
                .contactNumber(request.getContactNumber())
                .address(request.getAddress())
                .symptoms(request.getSymptoms())
                .entryDate(request.getEntryDate() != null ? request.getEntryDate() : LocalDate.now())
                .status(Patient.PatientStatus.ADMITTED)
                .build();
        
        Patient savedPatient = patientRepository.save(patient);
        log.info("Patient registered successfully with ID: {}", savedPatient.getPatientId());
        
        return PatientResponse.fromEntity(savedPatient);
    }
    
    public List<PatientResponse> getAllPatients(Long hospitalId) {
        log.info("Fetching all patients for hospital: {}", hospitalId);
        List<Patient> patients = patientRepository.findByHospitalIdOrderByCreatedAtDesc(hospitalId);
        return patients.stream()
                .map(PatientResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<PatientResponse> getPatientsByRoom(Long roomId, Long hospitalId) {
        log.info("Fetching patients in room {} for hospital {}", roomId, hospitalId);
        
        // Verify room belongs to hospital (should be checked via RoomService or repository)
        List<Patient> patients = patientRepository.findAdmittedPatientsByRoomId(roomId);
        
        // Filter by hospitalId for security
        return patients.stream()
                .filter(p -> p.getHospitalId().equals(hospitalId))
                .map(PatientResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public PatientResponse getPatientById(Long patientId, Long hospitalId) {
        log.info("Fetching patient {} for hospital {}", patientId, hospitalId);
        Patient patient = patientRepository.findByPatientIdAndHospitalId(patientId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient not found with ID: " + patientId + " for hospital: " + hospitalId
                ));
        return PatientResponse.fromEntity(patient);
    }
    
    @Transactional
    public PatientResponse updatePatient(Long patientId, PatientUpdateRequest request, Long hospitalId) {
        log.info("Updating patient {} for hospital {}", patientId, hospitalId);
        
        Patient patient = patientRepository.findByPatientIdAndHospitalId(patientId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient not found with ID: " + patientId + " for hospital: " + hospitalId
                ));
        
        // Don't allow updating discharged patients
        if (patient.getStatus() == Patient.PatientStatus.DISCHARGED) {
            throw new BadRequestException("Cannot update discharged patient");
        }
        
        // Update fields if provided
        if (request.getName() != null) {
            patient.setName(request.getName());
        }
        if (request.getAge() != null) {
            patient.setAge(request.getAge());
        }
        if (request.getGender() != null) {
            patient.setGender(request.getGender());
        }
        if (request.getContactNumber() != null) {
            // Check for duplicate contact number (excluding current patient)
            patientRepository.findByContactNumberAndHospitalId(request.getContactNumber(), hospitalId)
                    .ifPresent(existingPatient -> {
                        if (!existingPatient.getPatientId().equals(patientId)) {
                            throw new ResourceAlreadyExistsException(
                                    "Patient with contact number " + request.getContactNumber() + " already exists"
                            );
                        }
                    });
            patient.setContactNumber(request.getContactNumber());
        }
        if (request.getAddress() != null) {
            patient.setAddress(request.getAddress());
        }
        if (request.getSymptoms() != null) {
            patient.setSymptoms(request.getSymptoms());
        }
        if (request.getEntryDate() != null) {
            patient.setEntryDate(request.getEntryDate());
        }
        
        Patient updatedPatient = patientRepository.save(patient);
        log.info("Patient updated successfully with ID: {}", updatedPatient.getPatientId());
        
        return PatientResponse.fromEntity(updatedPatient);
    }
    
    @Transactional
    public PatientResponse dischargePatient(Long patientId, Long hospitalId) {
        log.info("Discharging patient {} for hospital {}", patientId, hospitalId);
        
        Patient patient = patientRepository.findByPatientIdAndHospitalId(patientId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient not found with ID: " + patientId + " for hospital: " + hospitalId
                ));
        
        if (patient.getStatus() == Patient.PatientStatus.DISCHARGED) {
            throw new BadRequestException("Patient is already discharged");
        }
        
        // Update patient status
        patient.setStatus(Patient.PatientStatus.DISCHARGED);
        patient.setExitDate(LocalDate.now());
        // Keep roomId for historical record
        
        Patient dischargedPatient = patientRepository.save(patient);
        log.info("Patient discharged successfully with ID: {}", dischargedPatient.getPatientId());
        
        return PatientResponse.fromEntity(dischargedPatient);
    }
}

