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

            // Verify password
            String storedPassword = "";
            Integer userId = null;
            String userUsername = "";

            if (user instanceof StudentModel student) {
                storedPassword = student.getPassword();
                userId = student.getId();
                userUsername = student.getUsername();
            } else if (user instanceof TeacherModel teacher) {
                storedPassword = teacher.getPassword();
                userId = teacher.getId();
                userUsername = teacher.getUsername();
            } else if (user instanceof ParentModel parent) {
                storedPassword = parent.getPassword();
                userId = parent.getId();
                userUsername = parent.getUsername();
            }

            if (!password.equals(storedPassword)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
            }

            return ResponseEntity.ok(Map.of(
                "user", Map.of(
                    "id", userId,
                    "username", userUsername,
                    "role", foundRole
                ),
                "message", "Login successful"
            ));

        } catch (Exception e) {
            System.out.println("Error during login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "An error occurred during login"));
        }
    }
} 