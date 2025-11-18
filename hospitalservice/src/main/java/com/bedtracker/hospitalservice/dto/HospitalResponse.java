package com.bedtracker.hospitalservice.dto;

import com.bedtracker.hospitalservice.entity.Hospital;
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
    
    public static HospitalResponse fromEntity(Hospital hospital) {
        return new HospitalResponse(
            hospital.getId(),
            hospital.getName(),
            hospital.getAddress(),
            hospital.getState(),
            hospital.getCity(),
            hospital.getContactNumber(),
            hospital.getTotalBeds()
        );
    }
}

