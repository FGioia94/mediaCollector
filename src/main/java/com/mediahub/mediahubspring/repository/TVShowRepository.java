package com.mediahub.mediahubspring.repository;

import com.mediahub.mediahubspring.model.TVShow;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TVShowRepository extends JpaRepository<TVShow, Long> {
}
