package com.meditrack.adminservice.dto;

import com.meditrack.adminservice.entity.Room;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    
    private Long roomId;
    private Long hospitalId;
    private String roomNumber;
    private Integer totalBeds;
    private Integer occupiedBeds; // Calculated field
    private Integer availableBeds; // Calculated field
    
    public static RoomResponse fromEntity(Room room) {
        int occupiedBeds = room.getPatients() == null ? 0 : room.getPatients().size();
        RoomResponse response = new RoomResponse();
        response.setRoomId(room.getId());
        response.setHospitalId(room.getHospital().getId());
        response.setRoomNumber(room.getRoomNumber());
        response.setTotalBeds(room.getTotalBeds());
        response.setOccupiedBeds(occupiedBeds);
        response.setAvailableBeds(room.getTotalBeds() - occupiedBeds);
        return response;
    }
}

