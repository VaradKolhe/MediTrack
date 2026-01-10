package com.bedtracker.hospitalservice.repository;

import com.bedtracker.hospitalservice.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    List<Review> findByHospitalIdOrderByCreatedAtDesc(Long hospitalId);
    
    Optional<Review> findByHospitalIdAndUserId(Long hospitalId, Long userId);
    
    boolean existsByHospitalIdAndUserId(Long hospitalId, Long userId);
}

