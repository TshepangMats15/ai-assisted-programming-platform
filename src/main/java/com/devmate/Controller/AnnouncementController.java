
package com.devmate.Controller;

import com.devmate.Entities.Announcement;
import com.devmate.Repository.AnnouncementRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")

public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementController(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    // GET: Retrieve all announcements
    @GetMapping
    public ResponseEntity<List<Announcement>> getAll() {
        return ResponseEntity.ok(announcementRepository.findAll());
    }

    // POST: Create a new announcement
    @PostMapping
    public ResponseEntity<Announcement> create(
            @RequestBody Announcement announcement) {

        Announcement savedAnnouncement =
                announcementRepository.save(announcement);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedAnnouncement);
    }

    // PUT: Update an existing announcement
    @PutMapping("/{id}")
    public ResponseEntity<Announcement> update(
            @PathVariable Long id,
            @RequestBody Announcement updatedAnnouncement) {

        return announcementRepository.findById(id)
                .map(existingAnnouncement -> {

                    existingAnnouncement.setTitle(
                            updatedAnnouncement.getTitle());

                    existingAnnouncement.setMessage(
                            updatedAnnouncement.getMessage());

                    existingAnnouncement.setAudience(
                            updatedAnnouncement.getAudience());

                    Announcement savedAnnouncement =
                            announcementRepository.save(existingAnnouncement);

                    return ResponseEntity.ok(savedAnnouncement);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE: Delete an announcement
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        if (!announcementRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        announcementRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
