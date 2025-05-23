package com.Web.WebBackend.DTO;

public class TeacherDTO {

    private Integer id;
    private String username;

    public TeacherDTO() {}

    public TeacherDTO(Integer id, String username) {
        this.id = id;
        this.username = username;
    }

    // Getters and setters
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
