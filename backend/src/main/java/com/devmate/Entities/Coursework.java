package com.devmate.Entities;

import jakarta.persistence.*;
import org.hibernate.annotations.Audited;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "coursework")
@Audited
public class Coursework {

    @Id
    @Column(name = "course_id", length = 255, nullable = false)
    private String courseID;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "module")
    private String module;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    // Diagnostic Assessment (AI Disabled)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pre_assessment_id")
    private Assessment preAssessment;

    // Mastery Assessment (AI Enabled)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "post_assessment_id")
    private Assessment postAssessment;

    // Related Instructional Content
    @OneToMany(mappedBy = "coursework", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Lesson> lessons;

    public Coursework() {
    }

    public Coursework(String courseID, String title, String module,
                      String description, LocalDateTime dueDate,
                      String createdBy, Assessment preAssessment, Assessment postAssessment) {
        this.courseID = courseID;
        this.title = title;
        this.module = module;
        this.description = description;
        this.dueDate = dueDate;
        this.createdBy = createdBy;
        this.preAssessment = preAssessment;
        this.postAssessment = postAssessment;
    }

    public String getCourseID() {
        return courseID;
    }

    public void setCourseID(String courseID) {
        this.courseID = courseID;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getModule() {
        return module;
    }

    public void setModule(String module) {
        this.module = module;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Assessment getPreAssessment() {
        return preAssessment;
    }

    public void setPreAssessment(Assessment preAssessment) {
        this.preAssessment = preAssessment;
    }

    public Assessment getPostAssessment() {
        return postAssessment;
    }

    public void setPostAssessment(Assessment postAssessment) {
        this.postAssessment = postAssessment;
    }

    public List<Lesson> getLessons() {
        return lessons;
    }

    public void setLessons(List<Lesson> lessons) {
        this.lessons = lessons;
    }
}
