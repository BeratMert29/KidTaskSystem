package com.Web.WebBackend.Service;

import com.Web.WebBackend.Model.StudentModel;
import com.Web.WebBackend.Repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentLookupService {
    private static final Logger logger = LoggerFactory.getLogger(StudentLookupService.class);

    private final StudentRepository studentRepository;

    @Autowired
    public StudentLookupService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<StudentModel> searchStudentsByUsername(String username) {
        logger.info("Searching for students with username containing: {}", username);
        return studentRepository.findByUsernameContainingIgnoreCase(username);
    }

    public StudentModel getStudentById(Integer id) {
        logger.info("Looking up student with ID: {}", id);
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public List<StudentModel> getAvailableStudents() {
        logger.info("Getting list of available students");
        List<StudentModel> allStudents = studentRepository.findAll();

        // Filter students who don't have a parent or teacher
        return allStudents.stream()
                .filter(student -> student.getParentId() == null || student.getTeacherId() == null)
                .collect(Collectors.toList());
    }
}