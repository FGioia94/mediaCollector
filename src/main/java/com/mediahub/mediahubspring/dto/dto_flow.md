# FLOW

1. Controller receives a MediaItemRequest DTO
2. It converts it to a MediaItem object
3. Calls the service
4. The service uses the MediaItemRepository for DB interactions 
and gives back a result to the controller
5. Converts the result to MediaItemResponse
6. Returns the MediaItemResponse DTO to the client
