package com.Web.WebBackend.Controller;

import com.Web.WebBackend.DTO.StudentDTO;
import com.Web.WebBackend.Model.StudentModel;
import com.Web.WebBackend.Repository.StudentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/students")
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        try {
            System.out.println("StudentController: Received request for /api/students");
            List<StudentModel> students = studentRepository.findAll();
            System.out.println("StudentController: Found " + students.size() + " students");

            List<StudentDTO> studentDTOs = students.stream()
                    .map(StudentDTO::fromStudentModel)
                    .collect(Collectors.toList());

            if (studentDTOs.isEmpty()) {
                System.out.println("WARNING: No students found in the database");
                return ResponseEntity.ok(studentDTOs);
            }

            // Log each student's details
            for (StudentDTO student : studentDTOs) {
                System.out.println("Student: ID=" + student.getId() +
                        ", Username=" + student.getUsername() +
                        ", Points=" + student.getPoints() +
                        ", Level=" + student.getLevel());

                // Test JSON serialization for each student
                try {
                    String json = objectMapper.writeValueAsString(student);
                    // Only log the first 200 characters to avoid flooding the logs
                    String truncatedJson = json.length() > 200 ? json.substring(0, 200) + "..." : json;
                    System.out.println("Serialized student (truncated): " + truncatedJson);
                } catch (Exception e) {
                    System.err.println("Error serializing student " + student.getId() + ": " + e.getMessage());
                }
            }

            return ResponseEntity.ok(studentDTOs);
        } catch (Exception e) {
            System.err.println("StudentController: Error getting students: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/students/{studentId}/points")
    public ResponseEntity<Integer> getStudentPoints(@PathVariable Integer studentId) {
        try {
            StudentModel student = studentRepository.findById(studentId).orElse(null);
            if (student == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(student.getPoints());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}