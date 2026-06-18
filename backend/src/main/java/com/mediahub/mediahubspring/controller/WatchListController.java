package com.mediahub.mediahubspring.controller;

import com.mediahub.mediahubspring.dto.WatchListRequest;
import com.mediahub.mediahubspring.dto.WatchListResponse;
import com.mediahub.mediahubspring.model.MediaItem;
import com.mediahub.mediahubspring.model.User;
import com.mediahub.mediahubspring.model.WatchList;
import com.mediahub.mediahubspring.service.MediaItemService;
import com.mediahub.mediahubspring.service.UserService;
import com.mediahub.mediahubspring.service.WatchListService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/watchlist")
public class WatchListController {

    private final WatchListService service;
    private final UserService userService;
    private final MediaItemService mediaItemService;

    public WatchListController(WatchListService service,
                               UserService userService,
                               MediaItemService mediaItemService) {
        this.service = service;
        this.userService = userService;
        this.mediaItemService = mediaItemService;
    }

    // ---------------------------------------------------------
    // CREATE
    // ---------------------------------------------------------
    @PostMapping
    public WatchListResponse add(@Valid @RequestBody WatchListRequest request) {

        User user = userService.get(request.getUserId());
        MediaItem item = mediaItemService.get(request.getMediaItemId());

        WatchList watchList = new WatchList(user, item);

        WatchList saved = service.addWatchList(watchList);

        return toResponse(saved);
    }

    // ---------------------------------------------------------
    // GET ALL
    // ---------------------------------------------------------
    @GetMapping("/all")
    public List<WatchListResponse> getAll() {
        return service.getAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------
    // GET BY ID
    // ---------------------------------------------------------
    @GetMapping("/{id}")
    public WatchListResponse get(@PathVariable Long id) {
        return toResponse(service.get(id));
    }

    // ---------------------------------------------------------
    // GET BY USER
    // ---------------------------------------------------------
    @GetMapping("/user/{userId}")
    public List<WatchListResponse> getByUser(@PathVariable Long userId) {
        return service.getByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------
    // GET BY MEDIA ITEM
    // ---------------------------------------------------------
    @GetMapping("/media/{mediaItemId}")
    public List<WatchListResponse> getByMediaItem(@PathVariable Long mediaItemId) {
        return service.getByMediaItem(mediaItemId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------
    // EXISTS
    // ---------------------------------------------------------
    @GetMapping("/exists")
    public boolean exists(@RequestParam Long userId,
                          @RequestParam Long mediaItemId) {
        return service.exists(userId, mediaItemId);
    }

    // ---------------------------------------------------------
    // DELETE
    // ---------------------------------------------------------
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // ---------------------------------------------------------
    // MAPPING
    // ---------------------------------------------------------
    private WatchListResponse toResponse(WatchList w) {
        return new WatchListResponse(
                w.getId(),
                w.getUser().getId(),
                w.getMediaItem().getId(),
                w.getAddedAt()
        );
    }
}
