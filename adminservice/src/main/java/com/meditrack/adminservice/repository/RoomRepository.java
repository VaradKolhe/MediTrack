package com.meditrack.adminservice.repository;

import com.meditrack.adminservice.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByHospital_Id(Long hospitalId);
}