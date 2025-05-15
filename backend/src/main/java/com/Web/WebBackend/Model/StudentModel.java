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
@Table(name = "Student")
public class StudentModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "username", unique = true)
    private String username;

    @Column(name = "password")
    private String password;

    @Column(name = "points")
    private int points = 0;

    @Column(name = "level")
    private Integer level = 1;

    @Column(name = "parent_id")
    private Integer parentId;

    @Column(name = "teacher_id")
    private Integer teacherId;

    @OneToOne
    @JoinColumn(name = "parent_id", insertable = false, updatable = false)
    @JsonBackReference("student-parent")
    private ParentModel parent;

    @OneToOne
    @JoinColumn(name = "teacher_id", insertable = false, updatable = false)
    @JsonBackReference("student-teacher")
    private TeacherModel teacher;

    @OneToMany(mappedBy = "assignedTo", cascade = CascadeType.ALL)
    @JsonManagedReference("student-tasks")
    private List<TaskModel> taskModelList = new ArrayList<>();

    @OneToMany(mappedBy = "studentModel", cascade = CascadeType.ALL)
    @JsonManagedReference("student-wishes")
    private List<WishModel> wishList = new ArrayList<>();

    public StudentModel(String username, String password) {
        this.username = username;
        this.password = password;
        this.points = 0;
        this.level = 1;
    }
}