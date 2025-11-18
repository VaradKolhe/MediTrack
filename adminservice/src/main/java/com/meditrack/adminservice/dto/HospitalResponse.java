package com.meditrack.adminservice.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructo
public class HospitalResponse {

    private Long id;
    private String name;
    private String address;
    private String city;
    private String state;
    private String phoneNumber;
    private Integer totalBeds;
    private Integer occupiedBeds;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

