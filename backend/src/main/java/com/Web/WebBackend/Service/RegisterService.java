package com.Web.WebBackend.Service;

import com.Web.WebBackend.Model.StudentModel;
import com.Web.WebBackend.Model.ParentModel;
import com.Web.WebBackend.Model.TeacherModel;
import com.Web.WebBackend.Repository.StudentRepository;
import com.Web.WebBackend.Repository.ParentRepository;
import com.Web.WebBackend.Repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RegisterService {
    private static final Logger logger = LoggerFactory.getLogger(RegisterService.class);

    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    private final TeacherRepository teacherRepository;

    @Autowired
    public RegisterService(
            StudentRepository studentRepository,
            ParentRepository parentRepository,
            TeacherRepository teacherRepository) {
        this.studentRepository = studentRepository;
        this.parentRepository = parentRepository;
        this.teacherRepository = teacherRepository;
    }

    @Transactional
    public StudentModel studentRegister(String username, String password) {
        logger.info("Attempting to register student with username: {}", username);

        // Check if username exists in any repository
        if (isUsernameExists(username)) {
            logger.warn("Username {} already exists", username);
            throw new RuntimeException("Username already exists");
        }

        // Create new student
        StudentModel student = new StudentModel(username, password);
        student.setPoints(0);
        student.setLevel(1);

        // Save and return the student
        try {
            StudentModel savedStudent = studentRepository.save(student);
            logger.info("Successfully registered student with username: {}", username);
            return savedStudent;
        } catch (Exception e) {
            logger.error("Error saving student: {}", e.getMessage());
            throw new RuntimeException("Error registering student: " + e.getMessage());
        }
    }

    @Transactional
    public ParentModel parentRegister(String username, String password, Integer studentId) {
        logger.info("Attempting to register parent with username: {} for student: {}", username, studentId);

        // Check if username exists in any repository
        if (isUsernameExists(username)) {
            logger.warn("Username {} already exists", username);
            throw new RuntimeException("Username already exists");
        }

        // Find student
        StudentModel student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Check if student already has a parent
        if (student.getParentId() != null) {
            logger.warn("Student {} already has a parent", studentId);
            throw new RuntimeException("Student already has a parent");
        }

        // Create new parent
        ParentModel parent = new ParentModel(username, password);

        // Save parent
        try {
            ParentModel savedParent = parentRepository.save(parent);

            // Update student with parent ID
            student.setParentId(savedParent.getId());
            studentRepository.save(student);

            logger.info("Successfully registered parent with username: {} for student: {}", username, studentId);
            return savedParent;
        } catch (Exception e) {
            logger.error("Error saving parent: {}", e.getMessage());
            throw new RuntimeException("Error registering parent: " + e.getMessage());
        }
    }

    @Transactional
    public TeacherModel teacherRegister(String username, String password, Integer studentId) {
        logger.info("Attempting to register teacher with username: {} for student: {}", username, studentId);

        // Check if username exists in any repository
        if (isUsernameExists(username)) {
            logger.warn("Username {} already exists", username);
            throw new RuntimeException("Username already exists");
        }

        // Find student
        StudentModel student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Check if student already has a teacher
        if (student.getTeacherId() != null) {
            logger.warn("Student {} already has a teacher", studentId);
            throw new RuntimeException("Student already has a teacher");
        }

        // Create new teacher
        TeacherModel teacher = new TeacherModel(username, password);

        // Save teacher
        try {
            TeacherModel savedTeacher = teacherRepository.save(teacher);

            // Update student with teacher ID
            student.setTeacherId(savedTeacher.getId());
            studentRepository.save(student);

            logger.info("Successfully registered teacher with username: {} for student: {}", username, studentId);
            return savedTeacher;
        } catch (Exception e) {
            logger.error("Error saving teacher: {}", e.getMessage());
            throw new RuntimeException("Error registering teacher: " + e.getMessage());
        }
    }

    public List<StudentModel> getAvailableStudents() {
        logger.info("Getting list of available students");
        List<StudentModel> allStudents = studentRepository.findAll();

        // Filter students who don't have a parent or teacher
        return allStudents.stream()
                .filter(student -> student.getParentId() == null || student.getTeacherId() == null)
                .collect(Collectors.toList());
    }

    private boolean isUsernameExists(String username) {
        logger.debug("Checking if username {} exists in any repository", username);

        // Check in all repositories
        boolean exists = studentRepository.findByUsername(username).isPresent() ||
                parentRepository.findByUsername(username).isPresent() ||
                teacherRepository.findByUsername(username).isPresent();

        if (exists) {
            logger.debug("Username {} was found in one of the repositories", username);
        } else {
            logger.debug("Username {} was not found in any repository", username);
        }

        return exists;
    }
}