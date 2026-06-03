package com.mediahub.mediahubspring.dto;

import java.time.LocalDate;
import java.util.Set;

public class TVShowResponse extends MediaItemResponse {

    private Integer seasons;
    private Integer episodes;
    private String network;

    public TVShowResponse() {
    }

    public TVShowResponse(Long id,
                          String title,
                          String description,
                          LocalDate releaseDate,
                          String posterUrl,
                          Set<Long> genreIds,
                          Set<Long> reviewIds,
                          Set<Long> watchListIds,
                          Integer seasons,
                          Integer episodes,
                          String network) {
        super(id, title, description, releaseDate, posterUrl, genreIds, reviewIds, watchListIds);
        this.seasons = seasons;
        this.episodes = episodes;
        this.network = network;
    }

    // GETTERS

    public Integer getSeasons() {
        return this.seasons;
    }

    public Integer getEpisodes() {
        return this.episodes;
    }

    public String getNetwork() {
        return this.network;
    }
}
