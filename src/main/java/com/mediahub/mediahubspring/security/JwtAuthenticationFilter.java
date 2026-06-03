package com.mediahub.mediahubspring.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private JwtService service;
    private UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService service, UserDetailsService userDetailsService) {
        this.service = service;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public void doFilterInternal(HttpServletRequest request,
                                 HttpServletResponse response,
                                 FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String email = service.extractUsername(token);

        if (email == null){
            // Request carry on as a non-authenticated user
            filterChain.doFilter(request, response);
            return;
        }

        // Checks that the user is not already authenticated
        if (SecurityContextHolder.getContext().getAuthentication() == null)
        {
         UserDetails userDetails = userDetailsService.loadUserByUsername(email);

         // Validates the token
         if (service.isTokenValid(token, userDetails)){
             // Creating the Authentication object
             var authToken = new UsernamePasswordAuthenticationToken(
                             userDetails,
                             null,
                             userDetails.getAuthorities()
                     );

             // User goes into the SecurityContext
             authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
             SecurityContextHolder.getContext().setAuthentication(authToken);

         }
        }

        // Continue request processing after JWT checks.
        filterChain.doFilter(request, response);

    }
}
