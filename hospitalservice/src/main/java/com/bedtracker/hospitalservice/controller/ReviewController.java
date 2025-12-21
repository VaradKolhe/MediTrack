package com.bedtracker.hospitalservice.controller;

import com.bedtracker.hospitalservice.dto.ApiResponse;
import com.bedtracker.hospitalservice.dto.ReviewRequest;
import com.bedtracker.hospitalservice.dto.ReviewResponse;
import com.bedtracker.hospitalservice.exception.ResourceAlreadyExistsException;
import com.bedtracker.hospitalservice.exception.ResourceNotFoundException;
import com.bedtracker.hospitalservice.exception.UnauthorizedException;
import com.bedtracker.hospitalservice.service.ReviewService;
import com.bedtracker.hospitalservice.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hospitals")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/reviews/{hospitalId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviews(
            @PathVariable Long hospitalId) {
        try {
            log.info("Fetching reviews for hospital ID: {}", hospitalId);
            List<ReviewResponse> reviews = reviewService.getReviewsByHospitalId(hospitalId);
            return ResponseEntity.ok(ApiResponse.success("Reviews fetched successfully", reviews));
        } catch (ResourceNotFoundException ex) {
            log.error("Error fetching reviews: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            log.error("Unexpected error fetching reviews: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch reviews"));
        }
    }

    @PostMapping("/{hospitalId}/reviews")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @PathVariable Long hospitalId,
            @Valid @RequestBody ReviewRequest request) {
        try {
            // Extract userId from JWT token
            Long userId = SecurityUtil.getUserId();
            if (userId == null) {
                log.warn("Attempted to create review without valid user authentication");
                throw new UnauthorizedException("User must be logged in to post reviews");
            }

            log.info("User {} creating review for hospital {}", userId, hospitalId);
            ReviewResponse review = reviewService.createReview(hospitalId, userId, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Review created successfully", review));
        } catch (UnauthorizedException ex) {
            log.error("Unauthorized review creation attempt: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (ResourceNotFoundException ex) {
            log.error("Resource not found: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (ResourceAlreadyExistsException ex) {
            log.error("Review already exists: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            log.error("Unexpected error creating review: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create review"));
        }
    }

    @DeleteMapping("/{hospitalId}/reviews/{reviewId}")
    @PreAuthorize("ADMIN")
    public ResponseEntity<ApiResponse<?>> deleteReview(
            @PathVariable Long hospitalId, @PathVariable Long reviewId
    ) {
        reviewService.deleteReview(hospitalId, reviewId);

        // Return successful response
        return ResponseEntity.ok(
                new ApiResponse<>("Review deleted successfully", true, null)
        );
    }


}

