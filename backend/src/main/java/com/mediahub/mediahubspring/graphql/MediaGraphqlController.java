package com.mediahub.mediahubspring.graphql;

import com.mediahub.mediahubspring.model.MediaItem;
import com.mediahub.mediahubspring.service.ExternalMediaService;
import com.mediahub.mediahubspring.service.MediaItemService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.Set;
import java.util.stream.Collectors;

@Controller
public class MediaGraphqlController {

    private final MediaItemService mediaItemService;
    private final ExternalMediaService externalMediaService;

    public MediaGraphqlController(MediaItemService mediaItemService,
                                  ExternalMediaService externalMediaService) {
        this.mediaItemService = mediaItemService;
        this.externalMediaService = externalMediaService;
    }

    @QueryMapping
    public java.util.List<GraphqlMediaItem> discoverMedia(@Argument String title,
                                                          @Argument Long genreId,
                                                          @Argument Integer year,
                                                          @Argument String type,
                                                          @Argument Double minRating,
                                                          @Argument String sortBy,
                                                          @Argument String sortDir) {
        return mediaItemService.discover(title, genreId, year, type, minRating, sortBy, sortDir)
                .stream()
                .map(this::toGraphqlMediaItem)
                .toList();
    }

    @QueryMapping
    public java.util.List<GraphqlMediaItem> topReviewed(@Argument Integer limit) {
        int safeLimit = limit != null ? limit : 10;
        return mediaItemService.findTopReviewed(safeLimit)
                .stream()
                .map(this::toGraphqlMediaItem)
                .toList();
    }

    @QueryMapping
    public java.util.List<GraphqlTrendingMedia> trending() {
        return externalMediaService.getTrendingMovies()
                .stream()
                .map(item -> new GraphqlTrendingMedia(
                        item.externalId() != null ? item.externalId().toString() : null,
                        item.localMovieId() != null ? item.localMovieId().toString() : null,
                        item.title(),
                        item.overview(),
                        item.posterUrl(),
                        item.savedLocally()
                ))
                .toList();
    }

    @QueryMapping
    public java.util.List<GenreMediaCount> statsByGenre() {
        return mediaItemService.countMediaByGenre().stream()
                .map(row -> new GenreMediaCount(
                        row[0] != null ? row[0].toString() : null,
                        row[1] instanceof Number number ? number.intValue() : 0
                ))
                .toList();
    }

    private GraphqlMediaItem toGraphqlMediaItem(MediaItem mediaItem) {
        Set<String> genreIds = mediaItem.getGenres().stream()
                .map(genre -> genre.getId() != null ? genre.getId().toString() : null)
                .collect(Collectors.toSet());
        Set<String> reviewIds = mediaItem.getReviews().stream()
                .map(review -> review.getId() != null ? review.getId().toString() : null)
                .collect(Collectors.toSet());
        Set<String> watchListIds = mediaItem.getWatchLists().stream()
                .map(watchList -> watchList.getId() != null ? watchList.getId().toString() : null)
                .collect(Collectors.toSet());

        return new GraphqlMediaItem(
                mediaItem.getId() != null ? mediaItem.getId().toString() : null,
                mediaItem.getTitle(),
                mediaItem.getDescription(),
                mediaItem.getReleaseDate() != null ? mediaItem.getReleaseDate().toString() : null,
                mediaItem.getPosterUrl(),
                genreIds,
                reviewIds,
                watchListIds
        );
    }
}