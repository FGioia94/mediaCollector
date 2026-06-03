package com.mediahub.mediahubspring.repository;

import com.mediahub.mediahubspring.model.MediaItem;
import com.mediahub.mediahubspring.model.Movie;
import com.mediahub.mediahubspring.model.TVShow;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

// extending JpaRepository automatically creates a Bean, so we can inject this dependency in the controller constructor directly
public interface MediaItemRepository extends JpaRepository<MediaItem, Long> {

    List<MediaItem> findByTitleContainingIgnoreCase(String title);
       Optional<MediaItem> findFirstByTitleIgnoreCase(String title);
       boolean existsByTitleIgnoreCase(String title);
       boolean existsByTitleIgnoreCaseAndIdNot(String title, Long id);
    List<MediaItem> findByGenres_Id(Long genreId);
    List<MediaItem> findByReleaseDateBetween(LocalDate start, LocalDate end);

    @Query("""
           SELECT m from MediaItem m
           LEFT JOIN m.reviews r
           GROUP BY m
           ORDER BY COUNT(r) DESC
           """)
    List<MediaItem> findTopReviewed(Pageable pageable);
    List<MediaItem> findByGenres_IdAndReleaseDateBetween(
            Long genreId,
            LocalDate start,
            LocalDate end
    );

    @Query("""
           SELECT AVG(r.rating)
           FROM Review r
           WHERE r.mediaItem.id = :mediaId
           """)
    Double getAverageRating(Long mediaId);

    @Query("""
    SELECT m
    FROM MediaItem m
    WHERE (:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%')))
      AND (:genreId IS NULL OR EXISTS (
            SELECT g FROM m.genres g WHERE g.id = :genreId
      ))
      AND (:year IS NULL OR YEAR(m.releaseDate) = :year)
    """)
    List<MediaItem> advancedSearch(String title, Long genreId, Integer year);

    @Query("""
    SELECT g.name, COUNT(m)
    FROM Genre g
    LEFT JOIN g.mediaItems m
    GROUP BY g.name
    """)
    List<Object[]> countMediaByGenre();

       @Query("SELECT m FROM MediaItem m WHERE TYPE(m) = Movie")
       List<MediaItem> findAllMovies();

       @Query("SELECT m FROM MediaItem m WHERE TYPE(m) = TVShow")
       List<MediaItem> findAllTvShows();



}
