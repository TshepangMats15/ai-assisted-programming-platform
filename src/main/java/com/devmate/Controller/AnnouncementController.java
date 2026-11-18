
package com.devmate.Controller;

import com.devmate.Entities.Announcement;
import com.devmate.Repository.AnnouncementRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementController(
            AnnouncementRepository announcementRepository) {

        this.announcementRepository = announcementRepository;
    }

    public record AnnouncementRequest(
            String title,
            String message
    ) {}

    // Retrieve global announcements
    @GetMapping
    public ResponseEntity<List<Announcement>> getAll() {

        return ResponseEntity.ok(
                announcementRepository
                        .findByAudienceOrderByCreatedAtDescIdDesc(
                                Announcement.GLOBAL_AUDIENCE
                        )
        );
    }

    // Create a global announcement
    @PostMapping
    public ResponseEntity<Announcement> create(
            @RequestBody AnnouncementRequest request) {

        validateRequest(request);

        Announcement announcement = new Announcement(
                request.title().trim(),
                request.message().trim()
        );

        Announcement savedAnnouncement =
                announcementRepository.save(announcement);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedAnnouncement);
    }

    // Update an existing announcement
    @PutMapping("/{id}")
    public ResponseEntity<Announcement> update(
            @PathVariable Long id,
            @RequestBody AnnouncementRequest request) {

        validateRequest(request);

        Announcement existingAnnouncement =
                announcementRepository.findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Announcement not found."
                                )
                        );

        existingAnnouncement.setTitle(
                request.title().trim()
        );

        existingAnnouncement.setMessage(
                request.message().trim()
        );

        existingAnnouncement.setAudience(
                Announcement.GLOBAL_AUDIENCE
        );

        return ResponseEntity.ok(
                announcementRepository.save(existingAnnouncement)
        );
    }

    // Delete an announcement
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        Announcement announcement =
                announcementRepository.findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Announcement not found."
                                )
                        );

        announcementRepository.delete(announcement);

        return ResponseEntity.noContent().build();
    }

    // Validate announcement content
    private void validateRequest(AnnouncementRequest request) {

        if (request == null
                || request.title() == null
                || request.title().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Announcement title is required."
            );
        }

        if (request.title().trim().length() > 255) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Announcement title cannot exceed 255 characters."
            );
        }

        if (request.message() == null
                || request.message().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Announcement message is required."
            );
        }

        if (request.message().trim()
                .getBytes(StandardCharsets.UTF_8).length > 65535) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Announcement message is too long."
            );
        }
    }
}
