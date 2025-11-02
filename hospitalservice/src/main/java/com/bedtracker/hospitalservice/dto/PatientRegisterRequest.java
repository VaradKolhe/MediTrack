package com.bedtracker.hospitalservice.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientRegisterRequest {
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;
    
    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age must be non-negative")
    @Max(value = 150, message = "Age must be reasonable")
    private Integer age;
    
    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "^(Male|Female|Other)$", message = "Gender must be Male, Female, or Other")
    private String gender;
    
    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Contact number must be 10-15 digits")
    private String contactNumber;
    
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;
    
    @Size(max = 1000, message = "Symptoms must not exceed 1000 characters")
    private String symptoms;
    
    private LocalDate entryDate; // Optional, defaults to today if not provided
}

