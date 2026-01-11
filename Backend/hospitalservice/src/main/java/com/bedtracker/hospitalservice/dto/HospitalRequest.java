package com.bedtracker.hospitalservice.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalRequest {

    // Aligned with Hospital.name (length=120, nullable=false)
    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must not exceed 120 characters")
    private String name;

    // Aligned with Hospital.contactNumber (length=15, nullable=false)
    @NotBlank(message = "Contact number is required")
    @Size(max = 15, message = "Contact number must not exceed 15 characters")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Contact number must be 10-15 digits")
    private String contactNumber;

    // Aligned with Hospital.address (length=255, nullable=false)
    @NotBlank(message = "Address is required")
    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    // Added to align with Hospital.city (length=120, nullable=false)
    @NotBlank(message = "City is required")
    @Size(max = 120, message = "City must not exceed 120 characters")
    private String city;

    // Added to align with Hospital.state (length=120, nullable=false)
    @NotBlank(message = "State is required")
    @Size(max = 120, message = "State must not exceed 120 characters")
    private String state;

}