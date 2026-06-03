package com.mediahub.mediahubspring.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "tv_shows")
public class TVShow extends MediaItem {

    private Integer seasons;
    private Integer episodes;
    private String network;

    public TVShow() {
    }

    public TVShow(String title,
                  String description,
                  LocalDate releaseDate,
                  String posterUrl,
                  Set<Genre> genres,
                  Integer seasons,
                  Integer episodes,
                  String network) {
        super(title, description, releaseDate, posterUrl, genres, null, null);
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
