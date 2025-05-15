package com.Web.WebBackend.Service;

import com.Web.WebBackend.Model.ParentModel;
import com.Web.WebBackend.Model.StudentModel;
import com.Web.WebBackend.Model.TeacherModel;
import com.Web.WebBackend.Repository.ParentRepository;
import com.Web.WebBackend.Repository.StudentRepository;
import com.Web.WebBackend.Repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ParentRepository parentRepository;

    public Optional<StudentModel> findStudentByUsername(String username) {
        System.out.println("UserService: Finding student by username: " + username);
        return studentRepository.findByUsername(username);
    }

    public List<StudentModel> getAllStudents() {
        System.out.println("UserService: Getting all students");
        List<StudentModel> students = studentRepository.findAll();
        System.out.println("UserService: Found " + students.size() + " students");
        return students;
    }

    public Optional<TeacherModel> findTeacherByUsername(String username) {
        return teacherRepository.findByUsername(username);
    }

    public Optional<ParentModel> findParentByUsername(String username) {
        return parentRepository.findByUsername(username);
    }

    public StudentModel addStudent(StudentModel student) {
        // Set initial points and level for new students
        student.setPoints(0);
        student.setLevel(1);
        System.out.println("Creating new student with initial points: 0, level: 1");
        return studentRepository.save(student);
    }

    public TeacherModel addTeacher(TeacherModel teacher) {
        return teacherRepository.save(teacher);
    }

    public ParentModel addParent(ParentModel parent) {
        return parentRepository.save(parent);
    }

    public boolean usernameExistsInAnyRole(String username) {
        return studentRepository.findByUsername(username).isPresent() ||
                teacherRepository.findByUsername(username).isPresent() ||
                parentRepository.findByUsername(username).isPresent();
    }

    public int calculateLevel(Integer points) {
        int level;
        if (points <= 40) level = 1;
        else if (points <= 60) level = 2;
        else if (points <= 80) level = 3;
        else level = 4;

        System.out.println("Calculating level for points: " + points + " -> Level: " + level);
        return level;
    }
    @Transactional
    public void updateStudentPoints(Integer studentId, Double pointsToAdd) {
        try {
            System.out.println("\n=== Starting points update process ===");
            System.out.println("Student ID: " + studentId);
            System.out.println("Points to add: " + pointsToAdd);

            StudentModel student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            int oldPoints = student.getPoints();
            int oldLevel = student.getLevel();
            int newPoints = (int) (oldPoints + pointsToAdd);
            int newLevel = calculateLevel(newPoints);

            System.out.println("Current state:");
            System.out.println("- Points: " + oldPoints);
            System.out.println("- Level: " + oldLevel);

            System.out.println("Updating to:");
            System.out.println("- New points: " + newPoints);
            System.out.println("- New level: " + newLevel);

            student.setPoints(newPoints);
            student.setLevel(newLevel);

            StudentModel savedStudent = studentRepository.save(student);

            System.out.println("Verification after save:");
            System.out.println("- Saved points: " + savedStudent.getPoints());
            System.out.println("- Saved level: " + savedStudent.getLevel());
            System.out.println("=== Points update completed ===\n");
        } catch (Exception e) {
            System.err.println("Error updating student points: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public void deductStudentPoints(Integer studentId, int pointsToDeduct) {
        StudentModel student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getPoints() < pointsToDeduct) {
            throw new RuntimeException("Not enough points");
        }

        int oldPoints = student.getPoints();
        int oldLevel = student.getLevel();
        int newPoints = oldPoints - pointsToDeduct;
        int newLevel = calculateLevel(newPoints);

        System.out.println("\n=== Deducting student points and updating level ===");
        System.out.println("Student ID: " + studentId);
        System.out.println("Old points: " + oldPoints + ", Old level: " + oldLevel);
        System.out.println("Points to deduct: " + pointsToDeduct);
        System.out.println("New points: " + newPoints + ", New level: " + newLevel);
        System.out.println("=== Deduction completed ===\n");

        student.setPoints(newPoints);
        student.setLevel(newLevel);
        studentRepository.save(student);
    }

    public StudentModel getStudent(Integer studentId) {
        StudentModel student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        System.out.println("\n=== Retrieved student details ===");
        System.out.println("Student ID: " + studentId);
        System.out.println("Points: " + student.getPoints());
        System.out.println("Level: " + student.getLevel());
        System.out.println("=== End student details ===\n");
        return student;
    }


}