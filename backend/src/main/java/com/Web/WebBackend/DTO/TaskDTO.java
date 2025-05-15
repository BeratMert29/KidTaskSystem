package com.Web.WebBackend.DTO;

import com.Web.WebBackend.Enum.TaskStatus;
import com.Web.WebBackend.Model.TaskModel;
import java.time.LocalDateTime;

public class TaskDTO {
    private Integer id;
    private String title;
    private String description;
    private Double reward;
    private LocalDateTime deadline;
    private Integer duration;
    private AssignedToDTO assignedTo;
    private TaskStatus status;
    private LocalDateTime completionDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String assignedBy;

    // Inner DTO class for assigned student
    public static class AssignedToDTO {
        private Integer id;
        private String username;

        public AssignedToDTO() {}

        public AssignedToDTO(Integer id, String username) {
            this.id = id;
            this.username = username;
        }

        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }
    }

    public TaskDTO() {}

    public static TaskDTO fromTaskModel(TaskModel task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setReward(task.getReward());
        dto.setDeadline(task.getDeadline());
        dto.setDuration(task.getDuration());
        dto.setStatus(task.getStatus());
        dto.setCompletionDate(task.getCompletionDate());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        dto.setAssignedBy(task.getAssignedBy());

        if (task.getAssignedTo() != null) {
            AssignedToDTO assignedToDTO = new AssignedToDTO(
                    task.getAssignedTo().getId(),
                    task.getAssignedTo().getUsername()
            );
            dto.setAssignedTo(assignedToDTO);
        }

        return dto;
    }

    // Getters and setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getReward() {
        return reward;
    }

    public void setReward(Double reward) {
        this.reward = reward;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public AssignedToDTO getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(AssignedToDTO assignedTo) {
        this.assignedTo = assignedTo;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public LocalDateTime getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDateTime completionDate) {
        this.completionDate = completionDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(String assignedBy) {
        this.assignedBy = assignedBy;
    }
}