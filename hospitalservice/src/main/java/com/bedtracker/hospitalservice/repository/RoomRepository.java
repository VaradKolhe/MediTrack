package com.bedtracker.hospitalservice.repository;

import com.bedtracker.hospitalservice.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    
    // Find all rooms for a specific hospital
    List<Room> findByHospital_IdOrderByRoomNumber(Long hospitalId);
    
    // Find room by ID and hospital (for security - ensure room belongs to hospital)
    Optional<Room> findByIdAndHospital_Id(Long Id, Long hospitalId);
    
    // Find room by room number and hospital
    Optional<Room> findByRoomNumberAndHospital_Id(String roomNumber, Long hospitalId);
}

