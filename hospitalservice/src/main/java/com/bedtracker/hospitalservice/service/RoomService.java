package com.bedtracker.hospitalservice.service;

import com.bedtracker.hospitalservice.dto.OccupancyResponse;
import com.bedtracker.hospitalservice.dto.RoomAssignRequest;
import com.bedtracker.hospitalservice.dto.RoomReassignRequest;
import com.bedtracker.hospitalservice.dto.RoomResponse;
import com.bedtracker.hospitalservice.entity.Patient;
import com.bedtracker.hospitalservice.entity.Room;
import com.bedtracker.hospitalservice.exception.BadRequestException;
import com.bedtracker.hospitalservice.exception.ResourceNotFoundException;
import com.bedtracker.hospitalservice.repository.PatientRepository;
import com.bedtracker.hospitalservice.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {
    
    private final RoomRepository roomRepository;
    private final PatientRepository patientRepository;
    
    public List<RoomResponse> getAllRooms(Long hospitalId) {
        log.info("Fetching all rooms for hospital: {}", hospitalId);
        List<Room> rooms = roomRepository.findByHospitalIdOrderByRoomNumber(hospitalId);
        
        return rooms.stream()
                .map(room -> {
                    Long occupiedBeds = patientRepository.countAdmittedPatientsByRoomId(room.getRoomId());
                    return RoomResponse.fromEntity(room, occupiedBeds.intValue());
                })
                .collect(Collectors.toList());
    }
    
    public RoomResponse getRoomById(Long roomId, Long hospitalId) {
        log.info("Fetching room {} for hospital {}", roomId, hospitalId);
        Room room = roomRepository.findByRoomIdAndHospitalId(roomId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Room not found with ID: " + roomId + " for hospital: " + hospitalId
                ));
        
        Long occupiedBeds = patientRepository.countAdmittedPatientsByRoomId(roomId);
        return RoomResponse.fromEntity(room, occupiedBeds.intValue());
    }
    
    public OccupancyResponse getRoomOccupancy(Long roomId, Long hospitalId) {
        log.info("Fetching occupancy for room {} in hospital {}", roomId, hospitalId);
        
        Room room = roomRepository.findByRoomIdAndHospitalId(roomId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Room not found with ID: " + roomId + " for hospital: " + hospitalId
                ));
        
        Long occupiedBeds = patientRepository.countAdmittedPatientsByRoomId(roomId);
        
        return new OccupancyResponse(
                room.getRoomId(),
                room.getRoomNumber(),
                room.getTotalBeds(),
                occupiedBeds.intValue()
        );
    }
    
    @Transactional
    public RoomResponse assignPatientToRoom(RoomAssignRequest request, Long hospitalId) {
        log.info("Assigning patient {} to room {} in hospital {}", request.getPatientId(), request.getRoomId(), hospitalId);
        
        // Verify room belongs to hospital
        Room room = roomRepository.findByRoomIdAndHospitalId(request.getRoomId(), hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Room not found with ID: " + request.getRoomId() + " for hospital: " + hospitalId
                ));
        
        // Verify patient belongs to hospital
        Patient patient = patientRepository.findByPatientIdAndHospitalId(request.getPatientId(), hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient not found with ID: " + request.getPatientId() + " for hospital: " + hospitalId
                ));
        
        // Check if patient is already discharged
        if (patient.getStatus() == Patient.PatientStatus.DISCHARGED) {
            throw new BadRequestException("Cannot assign discharged patient to room");
        }
        
        // Check if patient is already in this room
        if (patient.getRoomId() != null && patient.getRoomId().equals(request.getRoomId())) {
            throw new BadRequestException("Patient is already assigned to this room");
        }
        
        // Check room capacity
        Long currentOccupancy = patientRepository.countAdmittedPatientsByRoomId(request.getRoomId());
        if (currentOccupancy >= room.getTotalBeds()) {
            throw new BadRequestException("Room is full — cannot assign more patients");
        }
        
        // Assign patient to room
        patient.setRoomId(request.getRoomId());
        patientRepository.save(patient);
        
        log.info("Patient {} assigned to room {} successfully", request.getPatientId(), request.getRoomId());
        
        // Return updated room info
        Long updatedOccupancy = patientRepository.countAdmittedPatientsByRoomId(request.getRoomId());
        return RoomResponse.fromEntity(room, updatedOccupancy.intValue());
    }
    
    @Transactional
    public RoomResponse reassignPatient(RoomReassignRequest request, Long hospitalId) {
        log.info("Reassigning patient {} to room {} in hospital {}", 
                request.getPatientId(), request.getNewRoomId(), hospitalId);
        
        // Verify new room belongs to hospital
        Room newRoom = roomRepository.findByRoomIdAndHospitalId(request.getNewRoomId(), hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Room not found with ID: " + request.getNewRoomId() + " for hospital: " + hospitalId
                ));
        
        // Verify patient belongs to hospital
        Patient patient = patientRepository.findByPatientIdAndHospitalId(request.getPatientId(), hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient not found with ID: " + request.getPatientId() + " for hospital: " + hospitalId
                ));
        
        // Check if patient is already discharged
        if (patient.getStatus() == Patient.PatientStatus.DISCHARGED) {
            throw new BadRequestException("Cannot reassign discharged patient");
        }
        
        // Check if patient is already in the new room
        if (patient.getRoomId() != null && patient.getRoomId().equals(request.getNewRoomId())) {
            throw new BadRequestException("Patient is already assigned to this room");
        }
        
        // Check new room capacity
        Long currentOccupancy = patientRepository.countAdmittedPatientsByRoomId(request.getNewRoomId());
        if (currentOccupancy >= newRoom.getTotalBeds()) {
            throw new BadRequestException("Room is full — cannot assign more patients");
        }
        
        // Reassign patient to new room
        patient.setRoomId(request.getNewRoomId());
        patientRepository.save(patient);
        
        log.info("Patient {} reassigned to room {} successfully", request.getPatientId(), request.getNewRoomId());
        
        // Return updated room info
        Long updatedOccupancy = patientRepository.countAdmittedPatientsByRoomId(request.getNewRoomId());
        return RoomResponse.fromEntity(newRoom, updatedOccupancy.intValue());
    }
    
    public Long countOccupiedBeds(Long roomId) {
        return patientRepository.countAdmittedPatientsByRoomId(roomId);
    }
}

