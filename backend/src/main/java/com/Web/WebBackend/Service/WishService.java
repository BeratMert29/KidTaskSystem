package com.Web.WebBackend.Service;

import com.Web.WebBackend.Model.StudentModel;
import com.Web.WebBackend.Model.WishModel;
import com.Web.WebBackend.Model.ParentModel;
import com.Web.WebBackend.Repository.StudentRepository;
import com.Web.WebBackend.Repository.WishRepository;
import com.Web.WebBackend.Repository.ParentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WishService {
    private final WishRepository wishRepository;
    private final ParentRepository parentRepository;
    private final StudentRepository studentRepository;
    private final UserService userService;

    @Autowired
    public WishService(
            WishRepository wishRepository,
            ParentRepository parentRepository,
            StudentRepository studentRepository,
            UserService userService) {
        this.wishRepository = wishRepository;
        this.parentRepository = parentRepository;
        this.studentRepository = studentRepository;
        this.userService = userService;
    }

    public WishModel addWish(WishModel wish) {
        // Set default values
        wish.setIsInWishlist(true);
        wish.setIsInShoplist(false);
        wish.setIsApproved(false);
        wish.setCreatedAt(LocalDateTime.now());

        // Validate required fields
        if (wish.getItemName() == null || wish.getItemName().trim().isEmpty()) {
            throw new RuntimeException("Item name is required");
        }
        if (wish.getDescription() == null || wish.getDescription().trim().isEmpty()) {
            throw new RuntimeException("Description is required");
        }
        if (wish.getPrice() == null || wish.getPrice() <= 0) {
            throw new RuntimeException("Price must be greater than 0");
        }
        if (wish.getPoints() == null || wish.getPoints() <= 0) {
            throw new RuntimeException("Points must be greater than 0");
        }
        if (wish.getLevel() == null || wish.getLevel() <= 0) {
            throw new RuntimeException("Level must be greater than 0");
        }
        if (wish.getImageUrl() == null || wish.getImageUrl().trim().isEmpty()) {
            throw new RuntimeException("Image URL is required");
        }
        if (wish.getStudentModel() == null || wish.getStudentModel().getId() == null) {
            throw new RuntimeException("Student information is required");
        }

        // Save the wish
        WishModel savedWish = wishRepository.save(wish);
        System.out.println("Wish saved successfully: " + savedWish.getWishId());
        return savedWish;
    }

    // ... existing code ...
    public List<WishModel> getStudentWishes(Integer studentId) {
        if (studentId == null) {
            throw new RuntimeException("Student ID is required");
        }
        System.out.println("Fetching wishes for student: " + studentId);
        List<WishModel> wishes = wishRepository.findByStudentModelId(studentId);
        System.out.println("Found " + wishes.size() + " wishes for student " + studentId);
        return wishes;
    }
// ... existing code ...

    public List<WishModel> getStudentShoplist(Integer studentId) {
        if (studentId == null) {
            throw new RuntimeException("Student ID is required");
        }
        return wishRepository.findByStudentModelIdAndIsInShoplistTrue(studentId);
    }

    public List<WishModel> getApprovedWishes(Integer studentId) {
        if (studentId == null) {
            throw new RuntimeException("Student ID is required");
        }
        return wishRepository.findByStudentModelIdAndIsApprovedTrue(studentId);
    }

    public List<WishModel> getPurchasableWishes(Integer studentId, Integer points, Integer level) {
        if (studentId == null) {
            throw new RuntimeException("Student ID is required");
        }
        if (points == null || points < 0) {
            throw new RuntimeException("Points must be non-negative");
        }
        if (level == null || level < 1) {
            throw new RuntimeException("Level must be at least 1");
        }

        return wishRepository.findByStudentModelIdAndIsApprovedTrueAndIsInShoplistTrueAndPointsLessThanEqualAndLevelLessThanEqual(
                studentId, points, level);
    }

    // ... existing code ...
    public List<WishModel> getPendingWishes() {
        List<WishModel> wishes = wishRepository.findByIsApprovedFalse();
        // Ensure student information is loaded and properly serialized
        wishes.forEach(wish -> {
            if (wish.getStudentModel() != null) {
                // Create a new StudentModel with only the necessary fields
                StudentModel student = wish.getStudentModel();
                StudentModel studentInfo = new StudentModel();
                studentInfo.setId(student.getId());
                studentInfo.setUsername(student.getUsername());
                wish.setStudentModel(studentInfo);
            }
        });
        return wishes;
    }
// ... existing code ...

    public List<WishModel> getParentApprovedWishes(Integer parentId) {
        if (parentId == null) {
            throw new RuntimeException("Parent ID is required");
        }
        return wishRepository.findByApprovedByParentId(parentId);
    }

    public WishModel approveWish(Integer wishId, Integer parentId) {
        if (wishId == null) {
            throw new RuntimeException("Wish ID is required");
        }
        if (parentId == null) {
            throw new RuntimeException("Parent ID is required");
        }

        WishModel wish = wishRepository.findById(wishId)
                .orElseThrow(() -> new RuntimeException("Wish not found"));

        if (wish.getIsApproved()) {
            throw new RuntimeException("Wish is already approved");
        }

        ParentModel parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        wish.setIsApproved(true);
        wish.setApprovedAt(LocalDateTime.now());
        wish.setIsInShoplist(true);
        wish.setApprovedByParent(parent);

        return wishRepository.save(wish);
    }

    public void removeFromWishlist(Integer wishId) {
        if (wishId == null) {
            throw new RuntimeException("Wish ID is required");
        }

        WishModel wish = wishRepository.findById(wishId)
                .orElseThrow(() -> new RuntimeException("Wish not found"));

        if (!wish.getIsInWishlist()) {
            throw new RuntimeException("Wish is not in wishlist");
        }

        wish.setIsInWishlist(false);
        wishRepository.save(wish);
    }

    public void removeFromShoplist(Integer wishId) {
        if (wishId == null) {
            throw new RuntimeException("Wish ID is required");
        }

        WishModel wish = wishRepository.findById(wishId)
                .orElseThrow(() -> new RuntimeException("Wish not found"));

        if (!wish.getIsInShoplist()) {
            throw new RuntimeException("Wish is not in shoplist");
        }

        wish.setIsInShoplist(false);
        wishRepository.save(wish);
    }

    public WishModel getWish(Integer wishId) {
        if (wishId == null) {
            throw new RuntimeException("Wish ID is required");
        }
        return wishRepository.findById(wishId)
                .orElseThrow(() -> new RuntimeException("Wish not found"));
    }

    public void ParentApproveWish(Integer wishId, Integer parentId) {
        if (wishId == null) {
            throw new RuntimeException("Wish ID is required");
        }
        if (parentId == null) {
            throw new RuntimeException("Parent ID is required");
        }

        WishModel wish = getWish(wishId);
        ParentModel parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        if(!wish.getIsApproved()) {
            wish.setIsApproved(true);
            wish.setApprovedAt(LocalDateTime.now());
            wish.setIsInShoplist(true);
            wish.setApprovedByParent(parent);
            wishRepository.save(wish);
        }
    }

    public void ParentRejectsWish(Integer wishId, Integer parentId) {
        if (wishId == null) {
            throw new RuntimeException("Wish ID is required");
        }
        if (parentId == null) {
            throw new RuntimeException("Parent ID is required");
        }

        WishModel wish = getWish(wishId);
        ParentModel parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        wish.setIsApproved(false);
        wish.setIsInShoplist(false);
        wish.setIsInWishlist(false);
        wish.setApprovedByParent(null);
        wishRepository.save(wish);
    }

    @Transactional
    public WishModel purchaseWish(Integer wishId, Integer studentId) {
        System.out.println("Starting purchase process for wishId: " + wishId + ", studentId: " + studentId);


        if (wishId == null) {
            throw new RuntimeException("Wish ID is required");
        }
        if (studentId == null) {
            throw new RuntimeException("Student ID is required");
        }

        // Get the wish and student
        WishModel wish = wishRepository.findById(wishId)
                .orElseThrow(() -> new RuntimeException("Wish not found"));
        System.out.println("Found wish: " + wish.getWishId() + ", points: " + wish.getPoints() +
                ", isApproved: " + wish.getIsApproved() + ", isInShoplist: " + wish.getIsInShoplist());

        StudentModel student = userService.getStudent(studentId);
        System.out.println("Found student: " + student.getId() + ", points: " + student.getPoints() +
                ", level: " + student.getLevel());

        // Validate the wish belongs to the student
        if (!wish.getStudentModel().getId().equals(studentId)) {
            System.out.println("Wish ownership validation failed. Wish studentId: " +
                    wish.getStudentModel().getId() + ", provided studentId: " + studentId);
            throw new RuntimeException("Wish does not belong to this student");
        }
        System.out.println("Wish ownership validation passed");

        // Validate the wish is approved and in shoplist
        if (!wish.getIsApproved() || !wish.getIsInShoplist()) {
            System.out.println("Wish status validation failed. isApproved: " + wish.getIsApproved() +
                    ", isInShoplist: " + wish.getIsInShoplist());
            throw new RuntimeException("Wish must be approved and in shoplist to purchase");
        }
        System.out.println("Wish status validation passed");

        // Validate student has enough points
        if (student.getPoints() < wish.getPoints()) {
            System.out.println("Points validation failed. Student points: " + student.getPoints() +
                    ", required points: " + wish.getPoints());
            throw new RuntimeException("Not enough points to purchase this wish");
        }
        System.out.println("Points validation passed");

        // Validate student level requirement
        if (student.getLevel() < wish.getLevel()) {
            System.out.println("Level validation failed. Student level: " + student.getLevel() +
                    ", required level: " + wish.getLevel());
            throw new RuntimeException("Student level too low to purchase this wish");
        }
        System.out.println("Level validation passed");

        try {
            // Deduct points and update level using UserService
            // Using negative points to deduct
            userService.updateStudentPoints(studentId, (double) -wish.getPoints());
            System.out.println("Successfully deducted points and updated level");

            // Remove wish from shoplist
            wish.setIsInShoplist(false);
            wish.setIsInWishlist(false);
            wish.setIsPurchased(true);
            WishModel savedWish = wishRepository.save(wish);
            System.out.println("Successfully updated wish status");

            return savedWish;
        } catch (Exception e) {
            System.err.println("Error during purchase transaction: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error processing purchase: " + e.getMessage());
        }
    }



}