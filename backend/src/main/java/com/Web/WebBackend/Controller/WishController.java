package com.Web.WebBackend.Controller;

import com.Web.WebBackend.Model.WishModel;
import com.Web.WebBackend.Service.WishService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"}, allowCredentials = "true")
public class WishController {
    private final WishService wishService;

    @Autowired
    public WishController(WishService wishService) {
        this.wishService = wishService;
    }

    @PostMapping("/student/{studentId}")
    public ResponseEntity<WishModel> addWish(@PathVariable Integer studentId, @RequestBody WishModel wish) {
        try {
            WishModel savedWish = wishService.addWish(wish);
            return ResponseEntity.ok(savedWish);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/student/{studentId}/wishlist")
    public ResponseEntity<List<WishModel>> getStudentWishes(@PathVariable Integer studentId) {
        try {
            List<WishModel> wishes = wishService.getStudentWishes(studentId);
            return ResponseEntity.ok(wishes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/student/{studentId}/shoplist")
    public ResponseEntity<List<WishModel>> getStudentShoplist(@PathVariable Integer studentId) {
        try {
            List<WishModel> wishes = wishService.getStudentShoplist(studentId);
            return ResponseEntity.ok(wishes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/student/{studentId}/approved")
    public ResponseEntity<List<WishModel>> getApprovedWishes(@PathVariable Integer studentId) {
        try {
            List<WishModel> wishes = wishService.getApprovedWishes(studentId);
            return ResponseEntity.ok(wishes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/student/{studentId}/purchasable")
    public ResponseEntity<List<WishModel>> getPurchasableWishes(
            @PathVariable Integer studentId,
            @RequestParam Integer points,
            @RequestParam Integer level) {
        try {
            List<WishModel> wishes = wishService.getPurchasableWishes(studentId, points, level);
            return ResponseEntity.ok(wishes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<List<WishModel>> getPendingWishes() {
        try {
            List<WishModel> wishes = wishService.getPendingWishes();
            return ResponseEntity.ok(wishes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/parent/{parentId}/approved")
    public ResponseEntity<List<WishModel>> getParentApprovedWishes(@PathVariable Integer parentId) {
        try {
            List<WishModel> wishes = wishService.getParentApprovedWishes(parentId);
            return ResponseEntity.ok(wishes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{wishId}/approve")
    public ResponseEntity<WishModel> approveWish(
            @PathVariable Integer wishId,
            @RequestParam Integer parentId) {
        try {
            WishModel approvedWish = wishService.approveWish(wishId, parentId);
            return ResponseEntity.ok(approvedWish);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{wishId}/wishlist")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Integer wishId) {
        try {
            wishService.removeFromWishlist(wishId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{wishId}/shoplist")
    public ResponseEntity<Void> removeFromShoplist(@PathVariable Integer wishId) {
        try {
            wishService.removeFromShoplist(wishId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{wishId}")
    public ResponseEntity<WishModel> getWish(@PathVariable Integer wishId) {
        try {
            WishModel wish = wishService.getWish(wishId);
            return ResponseEntity.ok(wish);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{wishId}/parent-approve")
    public ResponseEntity<Void> parentApproveWish(@PathVariable Integer wishId, @RequestParam Integer parentId) {
        try {
            wishService.ParentApproveWish(wishId, parentId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{wishId}/parent-reject")
    public ResponseEntity<Void> parentRejectWish(
            @PathVariable("wishId") Integer wishId,
            @RequestParam("parentId") Integer parentId) {
        try {
            wishService.ParentRejectsWish(wishId, parentId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace(); // Add logging
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{wishId}/purchase")
    public ResponseEntity<?> purchaseWish(
            @PathVariable Integer wishId,
            @RequestParam Integer studentId) {
        try {
            System.out.println("Received purchase request for wishId: " + wishId + ", studentId: " + studentId);
            WishModel purchasedWish = wishService.purchaseWish(wishId, studentId);
            return ResponseEntity.ok(purchasedWish);
        } catch (RuntimeException e) {
            System.err.println("Error purchasing wish: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(400)
                    .body(Map.of("message", e.getMessage()));
        }
    }



}