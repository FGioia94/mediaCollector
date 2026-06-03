package com.mediahub.mediahubspring.repository;

import com.mediahub.mediahubspring.model.Genre;
import com.mediahub.mediahubspring.model.MediaItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GenreRepository extends JpaRepository<Genre, Long> {

    Optional<Genre> findByNameIgnoreCase(String name);


}
