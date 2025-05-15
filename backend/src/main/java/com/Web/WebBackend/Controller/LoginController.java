package com.Web.WebBackend.Controller;

import com.Web.WebBackend.Model.ParentModel;
import com.Web.WebBackend.Model.StudentModel;
import com.Web.WebBackend.Model.TeacherModel;
import com.Web.WebBackend.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class LoginController {
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String username = loginRequest.get("username");
            String password = loginRequest.get("password");

            if (username == null || password == null || username.trim().isEmpty() || password.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Username and password are required"));
            }

            // Try to find user in each role
            String[] roles = {"student", "teacher", "parent"};
            Object user = null;
            String foundRole = null;

            for (String role : roles) {
                Optional<?> userOpt = switch (role) {
                    case "student" -> userService.findStudentByUsername(username);
                    case "teacher" -> userService.findTeacherByUsername(username);
                    case "parent" -> userService.findParentByUsername(username);
                    default -> Optional.empty();
                };

                if (userOpt.isPresent()) {
                    user = userOpt.get();
                    foundRole = role;
                    break;
                }
            }

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid username or password"));
            }

            // Verify password and get user details
            Integer userId = null;
            String userUsername = "";
            Integer points = null;
            Integer level = null;

            if (user instanceof StudentModel student) {
                if (!password.equals(student.getPassword())) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("message", "Invalid username or password"));
                }
                userId = student.getId();
                userUsername = student.getUsername();
                points = student.getPoints();
                level = student.getLevel();
            } else if (user instanceof TeacherModel teacher) {
                if (!password.equals(teacher.getPassword())) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("message", "Invalid username or password"));
                }
                userId = teacher.getId();
                userUsername = teacher.getUsername();
            } else if (user instanceof ParentModel parent) {
                if (!password.equals(parent.getPassword())) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("message", "Invalid username or password"));
                }
                userId = parent.getId();
                userUsername = parent.getUsername();
            }

            // Create response with all user data
            Map<String, Object> userData = Map.of(
                    "id", userId,
                    "username", userUsername,
                    "role", foundRole,
                    "points", points != null ? points : 0,
                    "level", level != null ? level : 1
            );

            return ResponseEntity.ok(userData);

        } catch (Exception e) {
            System.out.println("Error during login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred during login"));
        }
    }
}