package com.bedtracker.hospitalservice.service;

import com.bedtracker.hospitalservice.dto.OccupancyResponse;
import com.bedtracker.hospitalservice.dto.RoomAssignRequest;
import com.bedtracker.hospitalservice.dto.RoomReassignRequest;
import com.bedtracker.hospitalservice.dto.RoomResponse;
import com.bedtracker.hospitalservice.entity.Hospital;
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

        // 1. Verify room belongs to hospital
        Room room = roomRepository.findByIdAndHospital_Id(request.getRoomId(), hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Room not found with ID: " + request.getRoomId() + " for hospital: " + hospitalId
                ));

        // 2. Verify patient belongs to hospital
        Patient patient = patientRepository.findByPatientIdAndHospitalId(request.getPatientId(), hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient not found with ID: " + request.getPatientId() + " for hospital: " + hospitalId
                ));

        // 3. Validation checks
        if (patient.getStatus() == Patient.PatientStatus.DISCHARGED) {
            throw new BadRequestException("Cannot assign discharged patient to room");
        }

        if (patient.getStatus() == Patient.PatientStatus.ADMITTED || patient.getRoom() != null && patient.getRoom().getId().equals(request.getRoomId())) {
            throw new BadRequestException("Patient is already assigned to this or another room");
        }

        Long currentOccupancy = patientRepository.countAdmittedPatientsByRoomId(request.getRoomId());
        if (currentOccupancy >= room.getTotalBeds()) {
            throw new BadRequestException("Room is full — cannot assign more patients");
        }

        // 4. Assign patient to room
        patient.setRoom(room);
        patientRepository.save(patient);

        // 5. Update Hospital Occupied Beds Count (Increment)
        Hospital hospital = room.getHospital();
        int currentHospitalOccupancy = hospital.getOccupiedBeds() != null ? hospital.getOccupiedBeds() : 0;
        hospital.setOccupiedBeds(currentHospitalOccupancy + 1);
        hospitalRepository.save(hospital);

        log.info("Patient {} assigned to room {} successfully. Hospital occupancy updated.", request.getPatientId(), request.getRoomId());

        // Return updated room info
        Long updatedOccupancy = patientRepository.countAdmittedPatientsByRoomId(request.getRoomId());
        return RoomResponse.fromEntity(room, updatedOccupancy.intValue());
    }

    @Transactional
    public RoomResponse reassignPatient(RoomReassignRequest request, Long hospitalId) {
        log.info("Reassigning patient {} to room {} in hospital {}",
                request.getPatientId(), request.getNewRoomId(), hospitalId);

        Room newRoom = roomRepository.findByIdAndHospital_Id(request.getNewRoomId(), hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Room not found with ID: " + request.getNewRoomId() + " for hospital: " + hospitalId
                ));

        Patient patient = patientRepository.findByPatientIdAndHospitalId(request.getPatientId(), hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient not found with ID: " + request.getPatientId() + " for hospital: " + hospitalId
                ));

        if (patient.getStatus() == Patient.PatientStatus.DISCHARGED) {
            throw new BadRequestException("Cannot reassign discharged patient");
        }

        if (patient.getRoom() != null && patient.getRoom().getId().equals(request.getNewRoomId())) {
            throw new BadRequestException("Patient is already assigned to this room");
        }

        Long currentOccupancy = patientRepository.countAdmittedPatientsByRoomId(request.getNewRoomId());
        if (currentOccupancy >= newRoom.getTotalBeds()) {
            throw new BadRequestException("Room is full — cannot assign more patients");
        }

        // Update relationship
        patient.setRoom(newRoom);
        patientRepository.save(patient);

        // Note: Reassigning within the same hospital does not change the total Occupied Beds of the hospital.

        log.info("Patient {} reassigned to room {} successfully", request.getPatientId(), request.getNewRoomId());

        Long updatedOccupancy = patientRepository.countAdmittedPatientsByRoomId(request.getNewRoomId());
        return RoomResponse.fromEntity(newRoom, updatedOccupancy.intValue());
    }

    @Transactional
    public void dischargePatient(Long patientId, Long hospitalId) {
        log.info("Discharging patient {} from hospital {}", patientId, hospitalId);

        Patient patient = patientRepository.findByPatientIdAndHospitalId(patientId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient not found with ID: " + patientId + " for hospital: " + hospitalId
                ));

        if (patient.getStatus() == Patient.PatientStatus.DISCHARGED) {
            throw new BadRequestException("Patient is already discharged");
        }

        // 1. Update Patient Status
        patient.setStatus(Patient.PatientStatus.DISCHARGED);
        patient.setExitDate(LocalDate.now());
        patient.setRoom(null); // Remove from room
        patientRepository.save(patient);

        // 2. Update Hospital Occupied Beds Count (Decrement)
        // We fetch the hospital explicitly to ensure we have the latest state
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found: " + hospitalId));

        int currentHospitalOccupancy = hospital.getOccupiedBeds() != null ? hospital.getOccupiedBeds() : 0;
        if (currentHospitalOccupancy > 0) {
            hospital.setOccupiedBeds(currentHospitalOccupancy - 1);
            hospitalRepository.save(hospital);
        }

        log.info("Patient {} discharged successfully. Hospital occupancy updated.", patientId);
    }

    public Long countOccupiedBeds(Long roomId) {
        return patientRepository.countAdmittedPatientsByRoomId(roomId);
    }
}