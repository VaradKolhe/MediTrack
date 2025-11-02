package com.bedtracker.hospitalservice.filter;

import com.bedtracker.hospitalservice.security.JwtAuthenticationToken;
import com.bedtracker.hospitalservice.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authorizationHeader = request.getHeader("Authorization");
        
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Missing or invalid Authorization header\"}");
            return;
        }
        
        String token = authorizationHeader.substring(7);
        
        try {
            // Validate token
            if (!jwtUtil.validateToken(token)) {
                log.warn("Invalid JWT token");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Invalid or expired token\"}");
                return;
            }
            
            // Extract claims
            String username = jwtUtil.extractUsername(token);
            Long hospitalId = jwtUtil.extractHospitalId(token);
            Long receptionistId = jwtUtil.extractReceptionistId(token);
            String role = jwtUtil.extractRole(token);
            
            if (hospitalId == null) {
                log.warn("Token does not contain hospitalId claim");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Token missing hospitalId claim\"}");
                return;
            }
            
            if (role == null) {
                log.warn("Token does not contain role claim");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Token missing role claim\"}");
                return;
            }
            
            // Check if role is RECEPTIONIST
            if (!"RECEPTIONIST".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
                log.warn("Access denied for role: {}", role);
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Access denied: Only receptionists and admins can access this service\"}");
                return;
            }
            
            // Create authentication token
            JwtAuthenticationToken authentication = new JwtAuthenticationToken(
                    username, role, hospitalId, receptionistId
            );
            
            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            log.debug("JWT validated successfully - username: {}, role: {}, hospitalId: {}", 
                     username, role, hospitalId);
            
            filterChain.doFilter(request, response);
            
        } catch (Exception e) {
            log.error("Error processing JWT token: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Error processing token: " + e.getMessage() + "\"}");
        }
    }
}

