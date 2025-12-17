package com.bedtracker.hospitalservice.service;

import com.bedtracker.hospitalservice.dto.ReviewRequest;
import com.bedtracker.hospitalservice.dto.ReviewResponse;
import com.bedtracker.hospitalservice.dto.UserResponse;
import com.bedtracker.hospitalservice.entity.Hospital;
import com.bedtracker.hospitalservice.entity.Review;
import com.bedtracker.hospitalservice.exception.ResourceAlreadyExistsException;
import com.bedtracker.hospitalservice.exception.ResourceNotFoundException;
import com.bedtracker.hospitalservice.repository.HospitalRepository;
import com.bedtracker.hospitalservice.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final HospitalRepository hospitalRepository;
    private final RestTemplate restTemplate;

    @Value("${user.service.base.url:http://userservice}")
    private String userServiceBaseUrl;

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authHeader != null) {
                headers.set(HttpHeaders.AUTHORIZATION, authHeader);
            }
        }
        return headers;
    }

    private UserResponse getUserById(Long userId) {
        try {
            HttpEntity<?> entity = new HttpEntity<>(getHeaders());
            ResponseEntity<UserResponse> response = restTemplate.exchange(
                    userServiceBaseUrl + "/api/users/" + userId,
                    HttpMethod.GET,
                    entity,
                    UserResponse.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                log.warn("Failed to fetch user {}: status={}", userId, response.getStatusCode());
                throw new ResourceNotFoundException("User not found with ID: " + userId);
            }
        } catch (RestClientException ex) {
            log.error("Error calling user service for user {}: {}", userId, ex.getMessage(), ex);
            throw new ResourceNotFoundException("Failed to fetch user information: " + ex.getMessage());
        }
    }

    public List<ReviewResponse> getReviewsByHospitalId(Long hospitalId) {
        log.info("Fetching reviews for hospital ID: {}", hospitalId);
        
        // Verify hospital exists
        if (!hospitalRepository.existsById(hospitalId)) {
            throw new ResourceNotFoundException("Hospital not found with ID: " + hospitalId);
        }

        List<Review> reviews = reviewRepository.findByHospitalIdOrderByCreatedAtDesc(hospitalId);
        return reviews.stream()
                .map(ReviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse createReview(Long hospitalId, Long userId, ReviewRequest request) {
        log.info("Creating review for hospital ID: {} by user ID: {}", hospitalId, userId);

        // Verify hospital exists
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with ID: " + hospitalId));

        // Check if user already reviewed this hospital
        if (reviewRepository.existsByHospitalIdAndUserId(hospitalId, userId)) {
            throw new ResourceAlreadyExistsException("User has already reviewed this hospital");
        }

        // Fetch user information to get fullname
        UserResponse userResponse = getUserById(userId);
        String fullname = (userResponse.getFirstName() != null ? userResponse.getFirstName() : "") + 
                         " " + 
                         (userResponse.getLastName() != null ? userResponse.getLastName() : "");
        fullname = fullname.trim();
        if (fullname.isEmpty()) {
            fullname = userResponse.getUsername(); // Fallback to username if names are empty
        }

        // Create review
        Review review = Review.builder()
                .hospitalId(hospitalId)
                .userId(userId)
                .fullname(fullname)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Recalculate hospital average rating and total reviews
        updateHospitalRating(hospital);

        log.info("Review created successfully with ID: {}", savedReview.getId());
        return ReviewResponse.fromEntity(savedReview);
    }

    @Transactional
    private void updateHospitalRating(Hospital hospital) {
        if (hospital == null || hospital.getId() == null) {
            log.warn("Attempted to update rating for null hospital");
            return;
        }

        List<Review> reviews = reviewRepository.findByHospitalIdOrderByCreatedAtDesc(hospital.getId());
        
        if (reviews == null || reviews.isEmpty()) {
            hospital.setAverageRating(0.0);
            hospital.setTotalReviews(0);
        } else {
            double sum = reviews.stream()
                    .mapToInt(Review::getRating)
                    .sum();
            double average = sum / reviews.size();
            
            hospital.setAverageRating(average);
            hospital.setTotalReviews(reviews.size());
        }

        hospitalRepository.save(hospital);
        log.debug("Updated hospital {} rating: {} ({} reviews)", 
                hospital.getId(), hospital.getAverageRating(), hospital.getTotalReviews());
    }
}

