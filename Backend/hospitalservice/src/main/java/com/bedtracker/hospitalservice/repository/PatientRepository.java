package com.bedtracker.hospitalservice.repository;

import com.bedtracker.hospitalservice.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface    PatientRepository extends JpaRepository<Patient, Long> {

    // Find all patients for a specific hospital
    List<Patient> findByHospitalId(Long hospitalId);

    // FIX: Changed p.roomId to p.room.id
    @Query("SELECT p FROM Patient p WHERE p.room.id = :roomId AND p.status = 'ADMITTED'")
    List<Patient> findAdmittedPatientsByRoomId(@Param("roomId") Long roomId);

    // FIX: Changed findByRoomId to findByRoom_Id for clarity (Spring Data convention for nested objects)
    List<Patient> findByRoomIdAndStatus(Long roomId, Patient.PatientStatus status);

    // Find patient by contact number and hospital
    Optional<Patient> findByContactNumberAndHospitalId(String contactNumber, Long hospitalId);

    // FIX: Changed p.roomId to p.room.id
    @Query("SELECT COUNT(p) FROM Patient p WHERE p.room.id = :roomId AND p.status = 'ADMITTED'")
    Long countAdmittedPatientsByRoomId(@Param("roomId") Long roomId);

    // Find patient by ID and hospital
    Optional<Patient> findByPatientIdAndHospitalId(Long patientId, Long hospitalId);

    // Find all admitted patients for a hospital
    List<Patient> findByHospitalIdAndStatus(Long hospitalId, Patient.PatientStatus status);
}