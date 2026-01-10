package com.meditrack.adminservice.controller;

import com.meditrack.adminservice.dto.ApiResponse;
import com.meditrack.adminservice.dto.RoomRequest;
import com.meditrack.adminservice.dto.RoomResponse;
import com.meditrack.adminservice.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/rooms")
@RequiredArgsConstructor
public class AdminRoomController {

    private static final Logger log = LoggerFactory.getLogger(AdminRoomController.class);
    private final AdminService adminService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody RoomRequest request) {
        try {
            log.info("Admin creating room: {} for hospital: {}", request.getRoomNumber(), request.getHospitalId());
            RoomResponse response = adminService.createRoom(request);
            log.info("Room created successfully with ID: {}", response.getRoomId());
            return ResponseEntity.ok(ApiResponse.success("Room created successfully", response));
        } catch (Exception ex) {
            log.error("Error in create room endpoint: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    @GetMapping("/hospital/{hospitalId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRoomsByHospital(@PathVariable Long hospitalId) {
        try {
            log.debug("Admin fetching rooms for hospital: {}", hospitalId);
            return ResponseEntity.ok(ApiResponse.success("Rooms fetched successfully", adminService.getRoomsByHospital(hospitalId)));
        } catch (Exception ex) {
            log.error("Error in getRoomsByHospital endpoint for hospital {}: {}", hospitalId, ex.getMessage(), ex);
            throw ex;
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> list() {
        try {
            log.debug("Admin fetching all rooms");
            return ResponseEntity.ok(ApiResponse.success("Rooms fetched successfully", adminService.getAllRooms()));
        } catch (Exception ex) {
            log.error("Error in list rooms endpoint: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> get(@PathVariable Long id) {
        try {
            log.debug("Admin fetching room with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success("Room fetched successfully", adminService.getRoom(id)));
        } catch (Exception ex) {
            log.error("Error in get room endpoint for ID {}: {}", id, ex.getMessage(), ex);
            throw ex;
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody RoomRequest request) {
        try {
            log.info("Admin updating room with ID: {}", id);
            RoomResponse response = adminService.updateRoom(id, request);
            log.info("Room updated successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success("Room updated successfully", response));
        } catch (Exception ex) {
            log.error("Error in update room endpoint for ID {}: {}", id, ex.getMessage(), ex);
            throw ex;
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            log.info("Admin deleting room with ID: {}", id);
            adminService.deleteRoom(id);
            log.info("Room deleted successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success("Room deleted successfully", null));
        } catch (Exception ex) {
            log.error("Error in delete room endpoint for ID {}: {}", id, ex.getMessage(), ex);
            throw ex;
        }
    }
}


