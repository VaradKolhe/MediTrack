package com.bedtracker.hospitalservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomAssignRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Room ID is required")
    private Long roomId;
}