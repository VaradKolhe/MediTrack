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
    private Integer totalRooms;
    private Integer occupiedBeds;
    private Double latitude;
    private Double longitude;
    private Double averageRating;
    private Integer totalReviews;
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
        response.setOccupiedBeds(hospital.getOccupiedBeds());
        response.setLatitude(hospital.getLatitude());
        response.setLongitude(hospital.getLongitude());
        response.setAverageRating(hospital.getAverageRating());
        response.setTotalReviews(hospital.getTotalReviews());
        response.setCreatedAt(hospital.getCreatedAt());
        response.setUpdatedAt(hospital.getUpdatedAt());
        response.setTotalRooms(hospital.getRooms().size());
        return response;
    }
}

