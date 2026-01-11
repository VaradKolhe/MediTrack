package com.bedtracker.hospitalservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyResponse {
    
    private Long roomId;
    private String roomNumber;
    private Integer totalBeds;
    private Integer occupiedBeds;
    private Integer availableBeds;
    
    public OccupancyResponse(Long roomId, String roomNumber, Integer totalBeds, Integer occupiedBeds) {
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.totalBeds = totalBeds;
        this.occupiedBeds = occupiedBeds;
        this.availableBeds = totalBeds - occupiedBeds;
    }
}

