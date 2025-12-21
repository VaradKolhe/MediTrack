package com.bedtracker.hospitalservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomReassignRequest {
    
    @NotNull(message = "Patient is required")
    private Long patientId;
    
    @NotNull(message = "New Room is required")
    private Long newRoomId;

    @Size(max = 1000, message = "Symptoms must not exceed 1000 characters")
    private String symptoms;
}
