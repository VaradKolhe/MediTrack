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
    private static final String LOGIN_ENDPOINT = "/public/auth/staff/login";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (request.getServletPath().startsWith("/public/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);  // <-- let permitAll() work
            return;
        }

        String token = header.substring(7);

        try {
            if (!jwtUtil.validateToken(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"success\":false,\"message\":\"Invalid token\"}");
                return;
            }

            String username = jwtUtil.extractUsername(token);
            String role = jwtUtil.extractRole(token);
            Long hospitalId = jwtUtil.extractHospitalId(token);
            Long receptionistId = jwtUtil.extractReceptionistId(token);
            Long userId = jwtUtil.extractUserId(token);

            JwtAuthenticationToken auth =
                    new JwtAuthenticationToken(username, role, hospitalId, receptionistId, userId);

            auth.setAuthenticated(true);
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"success\":false,\"message\":\"Token error\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}

