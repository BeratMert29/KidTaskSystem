package com.Web.WebBackend.Model;

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
@Table(name = "parent")
public class ParentModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "username", unique = true)
    private String username;

    @Column(name = "password")
    private String password;

    @OneToOne
    @JoinColumn(name = "student_id")
    @JsonManagedReference("student-parent")
    private StudentModel student;

    @OneToMany(mappedBy = "approvedByParent", cascade = CascadeType.ALL)
    @JsonManagedReference("parent-wishes")
    private List<WishModel> approvedWishes = new ArrayList<>();

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @JsonManagedReference("parent-tasks")
    private List<TaskModel> tasks = new ArrayList<>();

    public ParentModel(String username, String password) {
        this.username = username;
        this.password = password;
    }
}