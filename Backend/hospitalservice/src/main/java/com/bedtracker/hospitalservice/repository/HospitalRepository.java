package com.bedtracker.hospitalservice.repository;

import com.bedtracker.hospitalservice.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    Optional<Hospital> findById(Long id);

    @Modifying
    @Query("UPDATE Hospital h SET h.occupiedBeds = COALESCE(h.occupiedBeds, 0) + 1 WHERE h.id = :id")
    void incrementOccupancy(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Hospital h SET h.occupiedBeds = CASE WHEN h.occupiedBeds > 0 THEN h.occupiedBeds - 1 ELSE 0 END WHERE h.id = :id")
    void decrementOccupancy(@Param("id") Long id);
}

