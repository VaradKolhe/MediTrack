package com.meditrack.adminservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequest {

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    @NotBlank(message = "Room number is required")
    @Size(max = 50, message = "Room number must not exceed 50 characters")
    private String roomNumber;

    @NotNull(message = "Total beds is required")
    @Min(value = 1, message = "Total beds must be at least 1")
    private Integer totalBeds;

}

