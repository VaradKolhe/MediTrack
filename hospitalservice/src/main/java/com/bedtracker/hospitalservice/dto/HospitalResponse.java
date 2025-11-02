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
    private String contactNumber;
    private String email;
    private Integer totalRooms;
    private Integer totalBeds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static HospitalResponse fromEntity(Hospital hospital) {
        return new HospitalResponse(
            hospital.getId(),
            hospital.getName(),
            hospital.getAddress(),
            hospital.getContactNumber(),
            hospital.getEmail(),
            hospital.getTotalRooms(),
            hospital.getTotalBeds(),
            hospital.getCreatedAt(),
            hospital.getUpdatedAt()
        );
    }
}

