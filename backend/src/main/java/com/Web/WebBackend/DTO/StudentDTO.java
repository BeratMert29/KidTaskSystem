package com.Web.WebBackend.DTO;

import com.Web.WebBackend.Model.StudentModel;

public class StudentDTO {

    private Integer id;
    private String username;
    private int points;
    private Integer level;

    public StudentDTO() {}

    public StudentDTO(Integer id, String username, int points, Integer level) {
        this.id = id;
        this.username = username;
        this.points = points;
        this.level = level;
    }

    // Existing getters and setters
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

    // New getters and setters for points and level
    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    // Static factory method
    public static StudentDTO fromStudentModel(StudentModel student) {
        return new StudentDTO(
                student.getId(),
                student.getUsername(),
                student.getPoints(),
                student.getLevel()
        );
    }
}