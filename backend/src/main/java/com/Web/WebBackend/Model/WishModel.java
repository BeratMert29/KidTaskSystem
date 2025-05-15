package com.Web.WebBackend.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@Table(name = "wishes")
public class WishModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer wishId;

    @Column(name = "item_name")
    private String itemName;

    @Column(name = "description")
    private String description;

    @Column(name = "price")
    private Double price;

    @Column(name = "points")
    private Integer points;

    @Column(name = "level")
    private Integer level;

    @Column(name = "is_approved")
    private Boolean isApproved;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_in_wishlist")
    private Boolean isInWishlist;

    @Column(name = "is_in_shoplist")
    private Boolean isInShoplist;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "is_purchased")
    private Boolean isPurchased;

    @ManyToOne
    @JoinColumn(name = "student_id")
    @JsonBackReference("student-wishes")
    private StudentModel studentModel;

    @ManyToOne
    @JoinColumn(name = "approved_by_parent_id")
    @JsonBackReference("parent-wishes")
    private ParentModel approvedByParent;

    @ManyToOne
    @JoinColumn(name = "approved_by_teacher_id")
    @JsonBackReference("teacher-wishes")
    private TeacherModel approvedByTeacher;

    public WishModel(String itemName, String description, Double price, Integer points, Integer level,
                     String imageUrl, StudentModel studentModel) {
        this.itemName = itemName;
        this.description = description;
        this.price = price;
        this.points = points;
        this.level = level;
        this.imageUrl = imageUrl;
        this.studentModel = studentModel;
        this.isApproved = false;
        this.isInWishlist = true;
        this.isInShoplist = false;
        this.createdAt = LocalDateTime.now();
    }
}