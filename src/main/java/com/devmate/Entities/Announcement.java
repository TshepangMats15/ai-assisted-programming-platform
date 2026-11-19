
package com.devmate.Entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcement")
public class Announcement {

    public static final String GLOBAL_AUDIENCE = "All students";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(nullable = false)
    private String audience = GLOBAL_AUDIENCE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Announcement() {
    }

    public Announcement(String title, String message) {
        this.title = title;
        this.message = message;
        this.audience = GLOBAL_AUDIENCE;
    }

    public Announcement(
            String announcementID,
            String title,
            String content,
            String createdBy) {

        this(title, content);
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.audience = GLOBAL_AUDIENCE;
    }

    @PreUpdate
    protected void onUpdate() {
        this.audience = GLOBAL_AUDIENCE;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAudience() {
        return audience;
    }

    public void setAudience(String audience) {
        this.audience = GLOBAL_AUDIENCE;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
