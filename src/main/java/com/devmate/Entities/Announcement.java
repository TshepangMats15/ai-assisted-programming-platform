package com.devmate.Entities;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcement")
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false )
    private String message;

    @Column(nullable = false)
    private String audience = "All students";

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Announcement() {}

    public Announcement(String announcementID, String title, String content, String createdBy) {
        this.title = title;
        this.message = message;
        this.audience = audience;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {this.id = id;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {this.title = title;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {this.message = message;
    }
    public String getAudience() {
        return audience;
    }
    public void setAudience(String audience) {this.audience = audience;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;
    }
}
