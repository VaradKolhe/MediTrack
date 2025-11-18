package com.meditrack.adminservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RoomRequest {

    private Long hospitalId;

    @NotBlank
    @Size(max = 50)
    private String roomNumber;

    @NotBlank
    @Size(max = 120)
    private String ward;

    @Min(1)
    private Integer totalBeds;

    public RoomRequest() {
    }

    public RoomRequest(Long hospitalId, String roomNumber, String ward, Integer totalBeds) {
        this.hospitalId = hospitalId;
        this.roomNumber = roomNumber;
        this.ward = ward;
        this.totalBeds = totalBeds;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getWard() {
        return ward;
    }

    public void setWard(String ward) {
        this.ward = ward;
    }

    public Integer getTotalBeds() {
        return totalBeds;
    }

    public void setTotalBeds(Integer totalBeds) {
        this.totalBeds = totalBeds;
    }
    public Long getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
    }
}

