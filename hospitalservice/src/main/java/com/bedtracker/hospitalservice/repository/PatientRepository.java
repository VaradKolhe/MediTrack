package com.bedtracker.hospitalservice.repository;

import com.bedtracker.hospitalservice.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    
    // Find all patients for a specific hospital
    List<Patient> findByHospitalId(Long hospitalId);
    
    // Find patients in a specific room
    @Query("SELECT p FROM Patient p WHERE p.roomId = :roomId AND p.status = 'ADMITTED'")
    List<Patient> findAdmittedPatientsByRoomId(@Param("roomId") Long roomId);
    
    // Find all patients (including discharged) in a room
    List<Patient> findByRoomId(Long roomId);
    
    // Find patient by contact number and hospital (for duplicate check)
    Optional<Patient> findByContactNumberAndHospitalId(String contactNumber, Long hospitalId);
    
    // Count admitted patients in a room
    @Query("SELECT COUNT(p) FROM Patient p WHERE p.roomId = :roomId AND p.status = 'ADMITTED'")
    Long countAdmittedPatientsByRoomId(@Param("roomId") Long roomId);
    
    // Find patient by ID and hospital (for security - ensure patient belongs to hospital)
    Optional<Patient> findByPatientIdAndHospitalId(Long patientId, Long hospitalId);
    
    // Find all admitted patients for a hospital
    List<Patient> findByHospitalIdAndStatus(Long hospitalId, Patient.PatientStatus status);
}

