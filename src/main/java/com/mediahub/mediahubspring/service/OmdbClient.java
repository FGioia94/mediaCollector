package com.mediahub.mediahubspring.service;

import com.mediahub.mediahubspring.dto.OmdbRatingResponse;
import com.mediahub.mediahubspring.exception.ExternalApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class OmdbClient {

    private static final Logger log = LoggerFactory.getLogger(OmdbClient.class);

    @Value("${omdb.api.key}")
    private String apiKey;

    private final RestTemplate rest = new RestTemplate();

    public OmdbRatingResponse getRatings(String imdbId) {
        String url = "https://www.omdbapi.com/?apikey=" + apiKey + "&i=" + imdbId;

        try {
            return rest.getForObject(url, OmdbRatingResponse.class);
        } catch (Exception ex) {
            log.error("[OMDB] Error calling getRatings(): {}", ex.getMessage());
            throw new ExternalApiException("OMDB ratings request failed");
        }
    }
}
