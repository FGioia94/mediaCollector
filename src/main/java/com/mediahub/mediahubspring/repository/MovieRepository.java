package com.mediahub.mediahubspring.repository;

import com.mediahub.mediahubspring.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, Long> {
	Optional<Movie> findFirstByTitleContainingIgnoreCase(String title);
}
