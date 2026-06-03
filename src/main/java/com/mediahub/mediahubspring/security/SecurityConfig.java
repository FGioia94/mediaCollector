package com.mediahub.mediahubspring.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity // To override default config
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter,
                          UserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }


    @Bean
    public AuthenticationProvider authenticationProvider() {
        // This bean defines the "rule" about how to login
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        // We specify that we'll use our custom userDetailsService and passwordEncoder
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // Disable CSRF because this is a stateless REST API using JWT
                .csrf(csrf -> csrf.disable())

                // Authorization rules for all endpoints
                .authorizeHttpRequests(auth -> auth

                        // ---------------------------------------------------------
                        // PUBLIC ENDPOINTS (no authentication required)
                        // ---------------------------------------------------------
                        .requestMatchers(HttpMethod.GET, "/api/ping", "/api/health").permitAll()
                        .requestMatchers("/auth/**").permitAll()

                        // Media search and discovery
                        .requestMatchers(HttpMethod.GET, "/media/**").permitAll()

                        // Movies & TV Shows - read only
                        .requestMatchers(HttpMethod.GET, "/movies/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/tvshows/**").permitAll()

                        // Genres - read only
                        .requestMatchers(HttpMethod.GET, "/genres/**").permitAll()

                        // Reviews - read only
                        .requestMatchers(HttpMethod.GET, "/reviews/**").permitAll()

                        // GraphQL endpoint
                        .requestMatchers("/graphql").permitAll()

                        // Watchlist - read only
                        .requestMatchers(HttpMethod.GET, "/watchlist/**").permitAll()

                        // External movies - read only
                        .requestMatchers(HttpMethod.GET, "/external/**").permitAll()


                        // ---------------------------------------------------------
                        // USER ENDPOINTS (authenticated users)
                        // ---------------------------------------------------------

                        // USER baseline + EDITOR and ADMIN inheritance for review creation
                        .requestMatchers(HttpMethod.POST, "/reviews").hasAnyRole("USER", "EDITOR", "ADMIN")

                        // USER baseline + EDITOR and ADMIN inheritance for review updates
                        .requestMatchers(HttpMethod.PUT, "/reviews/**").hasAnyRole("USER", "EDITOR", "ADMIN")

                        // USER baseline + EDITOR and ADMIN inheritance for watchlist writes
                        .requestMatchers(HttpMethod.POST, "/watchlist").hasAnyRole("USER", "EDITOR", "ADMIN")

                        // USER baseline + EDITOR and ADMIN inheritance for watchlist writes
                        .requestMatchers(HttpMethod.DELETE, "/watchlist/**").hasAnyRole("USER", "EDITOR", "ADMIN")


                        // ---------------------------------------------------------
                        // EDITOR + ADMIN ENDPOINTS (content management)
                        // ---------------------------------------------------------

                        // Movies
                        .requestMatchers(HttpMethod.POST, "/movies").hasAnyRole("EDITOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/movies/**").hasAnyRole("EDITOR", "ADMIN")

                        // External movies (save TMDB → DB)
                        .requestMatchers(HttpMethod.POST, "/external/movie/**").hasAnyRole("EDITOR", "ADMIN")

                        // TV Shows
                        .requestMatchers(HttpMethod.POST, "/tvshows").hasAnyRole("EDITOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/tvshows/**").hasAnyRole("EDITOR", "ADMIN")

                        // Genres
                        .requestMatchers(HttpMethod.POST, "/genres").hasAnyRole("EDITOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/genres/**").hasAnyRole("EDITOR", "ADMIN")


                        // ---------------------------------------------------------
                        // ADMIN ONLY ENDPOINTS (system-level operations)
                        // ---------------------------------------------------------

                        // Movies & TV Shows deletion
                        .requestMatchers(HttpMethod.DELETE, "/movies/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/tvshows/**").hasRole("ADMIN")

                        // Reviews deletion (moderation)
                        .requestMatchers(HttpMethod.DELETE, "/reviews/**").hasRole("ADMIN")

                        // User management
                        .requestMatchers("/users/**").hasRole("ADMIN")

                        // Role management
                        .requestMatchers("/roles/**").hasRole("ADMIN")


                        // ---------------------------------------------------------
                        // ANY OTHER REQUEST MUST BE AUTHENTICATED
                        // ---------------------------------------------------------
                        .anyRequest().authenticated()
                )

                // Use stateless session management because we rely on JWT
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Authentication provider (UserDetailsService + PasswordEncoder)
                .authenticationProvider(authenticationProvider())

                // Register the JWT authentication filter before the default login filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }



}
