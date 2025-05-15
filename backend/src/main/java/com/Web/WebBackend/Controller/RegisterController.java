package com.Web.WebBackend.Controller;

import com.Web.WebBackend.Model.ParentModel;
import com.Web.WebBackend.Model.StudentModel;
import com.Web.WebBackend.Model.TeacherModel;
import com.Web.WebBackend.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/register")
public class RegisterController {
    @Autowired
    private UserService userService;

    @PostMapping("/student")
    public ResponseEntity<?> registerStudent(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");

            if (userService.usernameExistsInAnyRole(username)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Username already exists"));
            }

            StudentModel student = new StudentModel(username, password);
            StudentModel savedStudent = userService.addStudent(student);

            return ResponseEntity.ok(Map.of(
                    "id", savedStudent.getId(),
                    "username", savedStudent.getUsername(),
                    "role", "student",
                    "points", savedStudent.getPoints(),
                    "level", savedStudent.getLevel()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/parent")
    public ResponseEntity<?> registerParent(@RequestBody Map<String, Object> request) {
        try {
            String username = (String) request.get("username");
            String password = (String) request.get("password");
            Integer studentId = (Integer) request.get("studentId");

            if (userService.usernameExistsInAnyRole(username)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Username already exists"));
            }

            if (studentId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Student ID is required for parent registration"));
            }

            // Verify student exists
            StudentModel student = userService.getStudent(studentId);
            if (student == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Student not found"));
            }

            ParentModel parent = new ParentModel(username, password);
            parent.setStudent(student);
            ParentModel savedParent = userService.addParent(parent);

            return ResponseEntity.ok(Map.of(
                    "id", savedParent.getId(),
                    "username", savedParent.getUsername(),
                    "role", "parent",
                    "studentId", studentId
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/teacher")
    public ResponseEntity<?> registerTeacher(@RequestBody Map<String, Object> request) {
        try {
            String username = (String) request.get("username");
            String password = (String) request.get("password");
            Integer studentId = (Integer) request.get("studentId");

            if (userService.usernameExistsInAnyRole(username)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Username already exists"));
            }

            if (studentId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Student ID is required for teacher registration"));
            }

            // Verify student exists
            StudentModel student = userService.getStudent(studentId);
            if (student == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Student not found"));
            }

            TeacherModel teacher = new TeacherModel(username, password);
            teacher.setStudent(student);
            TeacherModel savedTeacher = userService.addTeacher(teacher);

            return ResponseEntity.ok(Map.of(
                    "id", savedTeacher.getId(),
                    "username", savedTeacher.getUsername(),
                    "role", "teacher",
                    "studentId", studentId
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @GetMapping("/available-students")
    public ResponseEntity<?> getAvailableStudents() {
        try {
            return ResponseEntity.ok(userService.getAllStudents());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to fetch available students: " + e.getMessage()));
        }
    }
}