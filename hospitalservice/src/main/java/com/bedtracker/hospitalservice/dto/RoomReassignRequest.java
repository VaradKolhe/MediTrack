package com.bedtracker.hospitalservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomReassignRequest {
    
    @NotNull(message = "Patient ID is required")
    private Long patientId;
    
    @NotNull(message = "New Room ID is required")
    private Long newRoomId;
}

