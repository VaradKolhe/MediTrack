package com.bedtracker.hospitalservice.dto;

import com.bedtracker.hospitalservice.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private Long id;
    private Long hospitalId;
    private Long userId;
    private String fullname;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public static ReviewResponse fromEntity(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setHospitalId(review.getHospitalId());
        response.setUserId(review.getUserId());
        response.setFullname(review.getFullname());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}

