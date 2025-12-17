package com.bedtracker.hospitalservice.service;

import com.bedtracker.hospitalservice.dto.OccupancyResponse;
import com.bedtracker.hospitalservice.dto.RoomAssignRequest;
import com.bedtracker.hospitalservice.dto.RoomReassignRequest;
import com.bedtracker.hospitalservice.dto.RoomResponse;
import com.bedtracker.hospitalservice.entity.Patient;
import com.bedtracker.hospitalservice.entity.Room;
import com.bedtracker.hospitalservice.exception.BadRequestException;
import com.bedtracker.hospitalservice.exception.ResourceNotFoundException;
import com.bedtracker.hospitalservice.repository.HospitalRepository;
import com.bedtracker.hospitalservice.repository.PatientRepository;
import com.bedtracker.hospitalservice.repository.RoomRepository;
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
public class RoomService {

    private final RoomRepository roomRepository;
    private final PatientRepository patientRepository;
    private final HospitalRepository hospitalRepository; // Added to update Hospital Occupancy

    public List<RoomResponse> getAllRooms(Long hospitalId) {
        log.info("Fetching all rooms for hospital: {}", hospitalId);
        List<Room> rooms = roomRepository.findByHospital_IdOrderByRoomNumber(hospitalId);

        return rooms.stream()
                .map(room -> {
                    Long occupiedBeds = patientRepository.countAdmittedPatientsByRoomId(room.getId());
                    return RoomResponse.fromEntity(room, occupiedBeds.intValue());
                })
                .collect(Collectors.toList());
    }

    public RoomResponse getRoomById(Long roomId, Long hospitalId) {
        log.info("Fetching room {} for hospital {}", roomId, hospitalId);
        Room room = roomRepository.findByIdAndHospital_Id(roomId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Room not found with ID: " + roomId + " for hospital: " + hospitalId
                ));

        Long occupiedBeds = patientRepository.countAdmittedPatientsByRoomId(roomId);
        return RoomResponse.fromEntity(room, occupiedBeds.intValue());
    }

    public OccupancyResponse getRoomOccupancy(Long roomId, Long hospitalId) {
        log.info("Fetching occupancy for room {} in hospital {}", roomId, hospitalId);

        Room room = roomRepository.findByIdAndHospital_Id(roomId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Room not found with ID: " + roomId + " for hospital: " + hospitalId
                ));

        Long occupiedBeds = patientRepository.countAdmittedPatientsByRoomId(roomId);

        return new OccupancyResponse(
                room.getId(),
                room.getRoomNumber(),
                room.getTotalBeds(),
                occupiedBeds.intValue()
        );
    }

    @Transactional
    public RoomResponse assignPatientToRoom(RoomAssignRequest request, Long hospitalId) {
        log.info("Assigning patient {} to room {} in hospital {}", request.getPatientId(), request.getRoomId(), hospitalId);

        // 1. ATOMICITY FIX: Acquire a Database Lock on the Room
        // This prevents two receptionists from grabbing the last bed simultaneously.
        Room room = roomRepository.findByIdAndHospitalIdWithLock(request.getRoomId(), hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        Patient patient = patientRepository.findByPatientIdAndHospitalId(request.getPatientId(), hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        // Check if actually admitted (prevent duplicates)
        if (patient.getStatus() == Patient.PatientStatus.ADMITTED) {
            throw new BadRequestException("Patient is already assigned to a room. Use 'Reassign' to move them.");
        }

        // 2. Check Capacity (Safe now due to Lock)
        Long currentOccupancy = patientRepository.countAdmittedPatientsByRoomId(request.getRoomId());
        if (currentOccupancy >= room.getTotalBeds()) {
            throw new BadRequestException("Room is full — cannot assign more patients");
        }

        // 3. Update Patient
        patient.setRoom(room);
        patient.setStatus(Patient.PatientStatus.ADMITTED);
        patient.setExitDate(null); // Clear exit date if they are being readmitted
        patientRepository.save(patient);

        // 4. ATOMICITY FIX: Atomic Update for Hospital Stats
        // We do not read-modify-write. We fire an update query.
        hospitalRepository.incrementOccupancy(hospitalId);

        return RoomResponse.fromEntity(room, currentOccupancy.intValue() + 1);
    }

    @Transactional
    public RoomResponse reassignPatient(RoomReassignRequest request, Long hospitalId) {
        log.info("Reassigning patient {} to new room {}", request.getPatientId(), request.getNewRoomId());

        // 1. Lock the NEW room to prevent overbooking
        Room newRoom = roomRepository.findByIdAndHospitalIdWithLock(request.getNewRoomId(), hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Target room not found"));

        Patient patient = patientRepository.findByPatientIdAndHospitalId(request.getPatientId(), hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        // 2. Check Capacity of new room
        Long currentOccupancy = patientRepository.countAdmittedPatientsByRoomId(request.getNewRoomId());
        if (currentOccupancy >= newRoom.getTotalBeds()) {
            throw new BadRequestException("Target Room is full");
        }

        // 3. LOGIC FIX: Handle Transfer vs Readmission
        boolean isTransfer = (patient.getStatus() == Patient.PatientStatus.ADMITTED);

        if (!isTransfer) {
            // CASE A: Readmission (Discharged -> Admitted)
            // If they were discharged, we must increment hospital stats
            hospitalRepository.incrementOccupancy(hospitalId);
            patient.setStatus(Patient.PatientStatus.ADMITTED);
            patient.setExitDate(null);
        }
        // CASE B: Transfer (Admitted Room A -> Admitted Room B)
        // We do NOT increment hospital stats, as they are already counted.

        patient.setRoom(newRoom);
        patientRepository.save(patient);

        return RoomResponse.fromEntity(newRoom, currentOccupancy.intValue() + 1);
    }

    @Transactional
    public void dischargePatient(Long patientId, Long hospitalId) {
        log.info("Discharging patient {} from hospital {}", patientId, hospitalId);

        Patient patient = patientRepository.findByPatientIdAndHospitalId(patientId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (patient.getStatus() == Patient.PatientStatus.DISCHARGED) {
            throw new BadRequestException("Patient is already discharged");
        }

        patient.setStatus(Patient.PatientStatus.DISCHARGED);
        patient.setExitDate(LocalDate.now());
        patient.setRoom(null);
        patientRepository.save(patient);

        // ATOMICITY FIX: Atomic Decrement
        hospitalRepository.decrementOccupancy(hospitalId);
    }
}