package com.devmate.Entities;

import jakarta.persistence.*;
import org.hibernate.annotations.Audited;

import java.time.LocalDateTime;

@Entity
@Audited.Table(name = "Coursework")
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

        // Connect Coursework to Assessment
        @ManyToOne
        @JoinColumn(name = "assessmentID")
        private Assessment assessment;

        public Coursework() {
        }
        public Coursework(String courseID, String title, String module,
                          String description, LocalDateTime dueDate,
                          String createdBy, Assessment assessment) {
            this.courseID = courseID;
            this.title = title;
            this.module = module;
            this.description = description;
            this.dueDate = dueDate;
            this.createdBy = createdBy;
            this.assessment = assessment;
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
        public Assessment getAssessment() {
        return assessment;
        }
        public void setAssessment(Assessment assessment) {
        this.assessment = assessment;
    }
}

