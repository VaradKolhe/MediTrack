package com.meditrack.adminservice.dto;

import com.meditrack.adminservice.entity.Hospital;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalResponse {
    
    private Long id;
    private String name;
    private String address;
    private String state;
    private String city;
    private String contactNumber;
    private Integer totalBeds;
    private Integer occupiedBeds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static HospitalResponse fromEntity(Hospital hospital) {
        HospitalResponse response = new HospitalResponse();
        response.setId(hospital.getId());
        response.setName(hospital.getName());
        response.setAddress(hospital.getAddress());
        response.setState(hospital.getState());
        response.setCity(hospital.getCity());
        response.setContactNumber(hospital.getContactNumber());
        response.setTotalBeds(hospital.getTotalBeds());
        response.setOccupiedBeds(0); // Can be calculated if needed
        response.setCreatedAt(hospital.getCreatedAt());
        response.setUpdatedAt(hospital.getUpdatedAt());
        return response;
    }
}

