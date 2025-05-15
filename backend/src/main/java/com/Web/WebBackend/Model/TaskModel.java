package com.Web.WebBackend.Model;

import com.Web.WebBackend.Enum.TaskStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "Task")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "createdBy")
    private String assignedBy;

    @Column(name = "reward")
    private Double reward;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "feedback")
    private String feedback;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    @JsonBackReference("student-tasks")
    private StudentModel assignedTo;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    @JsonBackReference("teacher-tasks")
    private TeacherModel teacher;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    @JsonBackReference("parent-tasks")
    private ParentModel parent;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    @Column(name = "completion_date")
    private LocalDateTime completionDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}