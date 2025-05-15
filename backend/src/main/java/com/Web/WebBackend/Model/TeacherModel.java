package com.Web.WebBackend.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@Table(name = "teacher")
public class TeacherModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "username", unique = true)
    private String username;

    @Column(name = "password")
    private String password;

    @OneToOne
    @JoinColumn(name = "student_id")
    @JsonManagedReference("student-teacher")
    private StudentModel student;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL)
    @JsonManagedReference("teacher-tasks")
    private List<TaskModel> taskModelList = new ArrayList<>();

    @OneToMany(mappedBy = "approvedByTeacher", cascade = CascadeType.ALL)
    @JsonManagedReference("teacher-wishes")
    private List<WishModel> approvedWishes = new ArrayList<>();

    public TeacherModel(String username, String password) {
        this.username = username;
        this.password = password;
    }
}