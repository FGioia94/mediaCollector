package com.mediahub.mediahubspring.dto;

import com.mediahub.mediahubspring.model.Genre;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.util.Set;

public class TVShowRequest extends MediaItemRequest {

    @NotNull(message = "The number of seasons is required")
    @Positive(message = "The number of seasons should be bigger than zero")
    private Integer seasons;

    @NotNull(message = "The number of episodes is required")
    @Positive(message = "The number of episodes should be bigger than zero")
    private Integer episodes;

    @NotBlank(message = "Network is required")
    private String network;

    public TVShowRequest() {
    }

    public TVShowRequest(String title,
                         String description,
                         LocalDate releaseDate,
                         String posterUrl,
                         Set<Long> genres,
                         Integer seasons,
                         Integer episodes,
                         String network) {

        super(title, description, releaseDate, posterUrl, genres);
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

    // SETTERS
    public void setSeasons(Integer seasons) {
        this.seasons = seasons;
    }

    public void setEpisodes(Integer episodes) {
        this.episodes = episodes;
    }

    public void setNetwork(String network) {
        this.network = network;
    }
}
