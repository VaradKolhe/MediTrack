package com.bedtracker.hospitalservice.controller;

import com.bedtracker.hospitalservice.dto.*;
import com.bedtracker.hospitalservice.service.RoomService;
import com.bedtracker.hospitalservice.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
@Slf4j
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getAllRooms() {
        Long hospitalId = SecurityUtil.getHospitalId();
        log.info("Fetching all rooms for hospital: {}", hospitalId);

        List<RoomResponse> rooms = roomService.getAllRooms(hospitalId);
        return ResponseEntity.ok(ApiResponse.success("Rooms retrieved successfully", rooms));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoomById(
            @PathVariable Long roomId) {

        Long hospitalId = SecurityUtil.getHospitalId();
        log.info("Fetching room {} for hospital: {}", roomId, hospitalId);

        RoomResponse room = roomService.getRoomById(roomId, hospitalId);
        return ResponseEntity.ok(ApiResponse.success("Room retrieved successfully", room));
    }

    @GetMapping("/{roomId}/occupancy")
    public ResponseEntity<ApiResponse<OccupancyResponse>> getRoomOccupancy(
            @PathVariable Long roomId) {

        Long hospitalId = SecurityUtil.getHospitalId();
        log.info("Fetching occupancy for room {} in hospital: {}", roomId, hospitalId);

        OccupancyResponse occupancy = roomService.getRoomOccupancy(roomId, hospitalId);
        return ResponseEntity.ok(ApiResponse.success("Occupancy retrieved successfully", occupancy));
    }

    @PostMapping("/assign")
    public ResponseEntity<ApiResponse<RoomResponse>> assignPatientToRoom(
            @Valid @RequestBody RoomAssignRequest request) {

        Long hospitalId = SecurityUtil.getHospitalId();
        log.info("Assigning patient {} to room {} for hospital: {}",
                request.getPatientId(), request.getRoomId(), hospitalId);

        RoomResponse room = roomService.assignPatientToRoom(request, hospitalId);
        return ResponseEntity.ok(ApiResponse.success("Patient assigned to room successfully", room));
    }

    @PutMapping("/reassign")
    public ResponseEntity<ApiResponse<RoomResponse>> reassignPatient(
            @Valid @RequestBody RoomReassignRequest request) {

        Long hospitalId = SecurityUtil.getHospitalId();
        log.info("Reassigning patient {} to room {} for hospital: {}",
                request.getPatientId(), request.getNewRoomId(), hospitalId);

        RoomResponse room = roomService.reassignPatient(request, hospitalId);
        return ResponseEntity.ok(ApiResponse.success("Patient reassigned to room successfully", room));
    }
}

