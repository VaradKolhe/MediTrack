package com.meditrack.adminservice.dto;

import jakarta.validation.constraints.*;

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

    public HospitalRequest() {
    }

    public HospitalRequest(String name, String contactNumber, String address, String city, String state) {
        this.name = name;
        this.contactNumber = contactNumber;
        this.address = address;
        this.city = city;
        this.state = state;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

}

