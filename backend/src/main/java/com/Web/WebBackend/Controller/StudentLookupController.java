package com.Web.WebBackend.Controller;

import com.Web.WebBackend.Model.StudentModel;
import com.Web.WebBackend.Service.StudentLookupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class StudentLookupController {
    private static final Logger logger = LoggerFactory.getLogger(StudentLookupController.class);

    @Autowired
    private StudentLookupService studentLookupService;

    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> searchStudents(@RequestParam String username) {
        logger.info("Searching for students with username: {}", username);
        try {
            List<StudentModel> students = studentLookupService.searchStudentsByUsername(username);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(students);
        } catch (Exception e) {
            logger.error("Error searching students: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(error);
        }
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getStudentById(@PathVariable Integer id) {
        logger.info("Looking up student with ID: {}", id);
        try {
            StudentModel student = studentLookupService.getStudentById(id);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(student);
        } catch (Exception e) {
            logger.error("Error looking up student: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(error);
        }
    }

    @GetMapping(value = "/available", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAvailableStudents() {
        logger.info("Getting list of available students (without parent or teacher)");
        try {
            List<StudentModel> students = studentLookupService.getAvailableStudents();
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(students);
        } catch (Exception e) {
            logger.error("Error getting available students: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(error);
        }
    }
}