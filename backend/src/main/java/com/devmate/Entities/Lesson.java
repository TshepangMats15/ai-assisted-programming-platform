package com.devmate.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.Audited;

@Entity
@Table(name = "lessons")
@Audited
public class Lesson {

    @Id
    @Column(name = "lesson_id", length = 255, nullable = false)
    private String lessonID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore
    private Coursework coursework;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content_type", nullable = false)
    private String contentType; // "READING", "VIDEO", "CODE_LAB"

    @Column(name = "content_body", columnDefinition = "LONGTEXT")
    private String contentBody;

    public Lesson() {
    }

    public Lesson(String lessonID, Coursework coursework, String title, 
                  String contentType, String contentBody) {
        this.lessonID = lessonID;
        this.coursework = coursework;
        this.title = title;
        this.contentType = contentType;
        this.contentBody = contentBody;
    }

    public String getLessonID() {
        return lessonID;
    }

    public void setLessonID(String lessonID) {
        this.lessonID = lessonID;
    }

    public Coursework getCoursework() {
        return coursework;
    }

    public void setCoursework(Coursework coursework) {
        this.coursework = coursework;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getContentBody() {
        return contentBody;
    }

    public void setContentBody(String contentBody) {
        this.contentBody = contentBody;
    }
}
