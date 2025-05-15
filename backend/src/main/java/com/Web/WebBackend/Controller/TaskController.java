package com.Web.WebBackend.Controller;

import com.Web.WebBackend.Enum.TaskStatus;
import com.Web.WebBackend.Model.ParentModel;
import com.Web.WebBackend.Model.StudentModel;
import com.Web.WebBackend.Model.TaskModel;
import com.Web.WebBackend.Model.TeacherModel;
import com.Web.WebBackend.Repository.ParentRepository;
import com.Web.WebBackend.Repository.StudentRepository;
import com.Web.WebBackend.Repository.TaskRepository;
import com.Web.WebBackend.Repository.TeacherRepository;
import com.Web.WebBackend.Service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public ResponseEntity<List<TaskModel>> getAllTasks() {
        List<TaskModel> tasks = taskRepository.findAll();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/student/id/{studentId}")
    public ResponseEntity<?> getTasksByStudentId(@PathVariable Integer studentId) {
        Optional<StudentModel> student = studentRepository.findById(studentId);
        if (!student.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        List<TaskModel> tasks = taskRepository.findAllByAssignedToId(studentId);
        if (tasks == null || tasks.isEmpty()) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/teacher/{username}")
    public ResponseEntity<List<TaskModel>> getTeacherTasks(@PathVariable String username) {
        List<TaskModel> tasks = taskService.getTeacherTasks(username);
        if (tasks == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/teacher/{username}/review")
    public ResponseEntity<List<TaskModel>> getTeacherReviewTasks(@PathVariable String username) {
        Optional<TeacherModel> teacher = teacherRepository.findByUsername(username);
        if (!teacher.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        List<TaskModel> tasks = taskService.getTeacherTasksAwaitingApproval(username);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/teacher/{teacherId}")
    public ResponseEntity<?> createTaskByTeacher(@PathVariable Integer teacherId, @RequestBody TaskModel task) {
        try {
            Optional<TeacherModel> teacher = teacherRepository.findById(teacherId);
            if (!teacher.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            // Verify teacher-student relationship
            if (teacher.get().getStudent() == null ||
                    !teacher.get().getStudent().getId().equals(task.getAssignedTo().getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Teacher can only create tasks for their assigned student"));
            }

            TaskModel createdTask = taskService.TeacherCreatesTask(task, teacherId, task.getAssignedTo().getId());
            return ResponseEntity.ok(createdTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Error creating task: " + e.getMessage()));
        }
    }

    @PostMapping("/parent/{parentId}")
    public ResponseEntity<?> createTaskByParent(@PathVariable Integer parentId, @RequestBody TaskModel task) {
        try {
            Optional<ParentModel> parent = parentRepository.findById(parentId);
            if (!parent.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            // Verify parent-student relationship
            if (parent.get().getStudent() == null ||
                    !parent.get().getStudent().getId().equals(task.getAssignedTo().getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Parent can only create tasks for their child"));
            }

            TaskModel createdTask = taskService.ParentCreatesTask(task, parentId, task.getAssignedTo().getId());
            return ResponseEntity.ok(createdTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Error creating task: " + e.getMessage()));
        }
    }

    @GetMapping("/student/{username}")
    public ResponseEntity<?> getStudentTasks(@PathVariable String username) {
        List<TaskModel> tasks = taskService.getStudentTasks(username);
        if (tasks == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/student/{studentId}/task/{taskId}/complete")
    public ResponseEntity<TaskModel> studentCompleteTask(@PathVariable Integer studentId, @PathVariable Integer taskId) {
        TaskModel updatedTask = taskService.studentFinishedTask(taskId, studentId);
        if (updatedTask == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(updatedTask);
    }

    @GetMapping("/parent/username/{username}/all-tasks")
    public ResponseEntity<List<TaskModel>> getAllParentTasksByUsername(@PathVariable String username) {
        Optional<ParentModel> parent = parentRepository.findByUsername(username);
        if (!parent.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        List<TaskModel> tasks = taskService.getParentTasks(username);
        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/teacher/{teacherId}/approve/{taskId}")
    public ResponseEntity<TaskModel> teacherApproveTask(@PathVariable Integer teacherId, @PathVariable Integer taskId) {
        TaskModel updatedTask = taskService.TeacherApproveTask(taskId, teacherId);
        if (updatedTask == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(updatedTask);
    }

    @PutMapping("/teacher/{teacherId}/reject/{taskId}")
    public ResponseEntity<TaskModel> teacherRejectTask(@PathVariable Integer teacherId, @PathVariable Integer taskId) {
        TaskModel updatedTask = taskService.TeacherRejectTask(taskId, teacherId);
        if (updatedTask == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(updatedTask);
    }

    @GetMapping("/parent/{parentId}/tasks")
    public ResponseEntity<List<TaskModel>> getParentTasksById(@PathVariable Integer parentId) {
        Optional<ParentModel> parent = parentRepository.findById(parentId);
        if (!parent.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        List<TaskModel> tasks = taskService.getParentTasks(parent.get().getUsername());
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/parent/username/{username}/tasks")
    public ResponseEntity<List<TaskModel>> getParentTasksByUsername(@PathVariable String username) {
        Optional<ParentModel> parent = parentRepository.findByUsername(username);
        if (!parent.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        List<TaskModel> tasks = taskService.getParentTasksAwaitingApproval(username);
        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/parent/{parentId}/approve/{taskId}")
    public ResponseEntity<TaskModel> parentApproveTask(@PathVariable Integer parentId, @PathVariable Integer taskId) {
        TaskModel updatedTask = taskService.ParentApproveTask(taskId, parentId);
        if (updatedTask == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(updatedTask);
    }

    @PutMapping("/parent/{parentId}/reject/{taskId}")
    public ResponseEntity<TaskModel> parentRejectTask(@PathVariable Integer parentId, @PathVariable Integer taskId) {
        TaskModel updatedTask = taskService.ParentRejectTask(taskId, parentId);
        if (updatedTask == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(updatedTask);
    }

    @PutMapping("/parent/{parentId}/update/{taskId}")
    public ResponseEntity<TaskModel> parentUpdateTask(
            @PathVariable Integer parentId,
            @PathVariable Integer taskId,
            @RequestBody TaskModel updatedTask) {
        Optional<ParentModel> parent = parentRepository.findById(parentId);
        if (!parent.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Optional<TaskModel> existingTask = taskRepository.findById(taskId);
        if (!existingTask.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        TaskModel savedTask = taskService.ParentUpdateTask(taskId, parentId, updatedTask);
        if (savedTask == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(savedTask);
    }

    @PutMapping("/teacher/{teacherId}/update/{taskId}")
    public ResponseEntity<TaskModel> teacherUpdateTask(
            @PathVariable Integer teacherId,
            @PathVariable Integer taskId,
            @RequestBody TaskModel updatedTask) {
        TaskModel savedTask = taskService.TeacherUpdateTask(taskId, teacherId, updatedTask);
        return ResponseEntity.ok(savedTask);
    }

    @DeleteMapping("/parent/{parentId}/task/{taskId}")
    public ResponseEntity<?> deleteTaskByParent(@PathVariable Integer parentId, @PathVariable Integer taskId) {
        Optional<ParentModel> parent = parentRepository.findById(parentId);
        if (!parent.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Optional<TaskModel> task = taskRepository.findById(taskId);
        if (!task.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        // Verify the task was assigned by this parent
        if (!task.get().getAssignedBy().equals(parent.get().getUsername())) {
            return ResponseEntity.badRequest().build();
        }

        taskRepository.delete(task.get());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/teacher/{teacherId}/task/{taskId}")
    public ResponseEntity<?> deleteTaskByTeacher(@PathVariable Integer teacherId, @PathVariable Integer taskId) {
        Optional<TeacherModel> teacher = teacherRepository.findById(teacherId);
        if (!teacher.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Optional<TaskModel> task = taskRepository.findById(taskId);
        if (!task.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        // Verify the task was assigned by this teacher
        if (!task.get().getAssignedBy().equals(teacher.get().getUsername())) {
            return ResponseEntity.badRequest().build();
        }

        taskRepository.delete(task.get());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/pending/{username}")
    public ResponseEntity<List<TaskModel>> getPendingTasks(@PathVariable String username) {
        Optional<ParentModel> parent = parentRepository.findByUsername(username);
        Optional<TeacherModel> teacher = teacherRepository.findByUsername(username);

        if (!parent.isPresent() && !teacher.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        List<TaskModel> tasks;
        if (parent.isPresent()) {
            tasks = taskService.getParentTasks(username).stream()
                    .filter(task -> task.getStatus() == TaskStatus.pending)
                    .collect(Collectors.toList());
        } else {
            tasks = taskService.getTeacherTasks(username).stream()
                    .filter(task -> task.getStatus() == TaskStatus.pending)
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/teacher/{teacherId}/rate/{taskId}")
    public ResponseEntity<TaskModel> rateTask(
            @PathVariable Integer teacherId,
            @PathVariable Integer taskId,
            @RequestParam Integer rating
    ) {
        if (rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().build();
        }

        TaskModel updatedTask = taskService.rateTask(taskId, teacherId, rating);
        if (updatedTask == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(updatedTask);
    }

    @PutMapping("/parent/{parentId}/task/{taskId}/rate")
    public ResponseEntity<TaskModel> rateTaskByParent(
            @PathVariable Integer parentId,
            @PathVariable Integer taskId,
            @RequestBody Map<String, Integer> request) {
        try {
            TaskModel task = taskService.getTaskById(taskId);
            if (task == null) {
                return ResponseEntity.notFound().build();
            }

            task.setRating(request.get("rating"));
            task.setUpdatedAt(LocalDateTime.now());
            TaskModel updatedTask = taskService.updateTask(task);
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/teacher/{teacherId}/task/{taskId}/rate")
    public ResponseEntity<TaskModel> rateTaskByTeacher(@PathVariable Integer teacherId, @PathVariable Integer taskId, @RequestBody Map<String, Integer> request) {
        try {
            TaskModel task = taskService.getTaskById(taskId);
            if (task == null) {
                return ResponseEntity.notFound().build();
            }

            task.setRating(request.get("rating"));
            task.setUpdatedAt(LocalDateTime.now());
            TaskModel updatedTask = taskService.updateTask(task);
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/parent/{parentId}/task/{taskId}/review")
    public ResponseEntity<TaskModel> reviewTaskByParent(@PathVariable Integer parentId, @PathVariable Integer taskId, @RequestBody Map<String, Object> reviewData) {
        TaskModel updatedTask = taskService.reviewTaskByParent(parentId, taskId, reviewData);
        if (updatedTask == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(updatedTask);
    }

    @PutMapping("/teacher/{teacherId}/task/{taskId}/review")
    public ResponseEntity<TaskModel> reviewTaskByTeacher(@PathVariable Integer teacherId, @PathVariable Integer taskId, @RequestBody Map<String, Object> reviewData) {
        TaskModel updatedTask = taskService.reviewTaskByTeacher(teacherId, taskId, reviewData);
        if (updatedTask == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(updatedTask);
    }

    @GetMapping("/teacher/{teacherId}/students")
    public ResponseEntity<?> getTeacherStudents(@PathVariable Integer teacherId) {
        try {
            Optional<TeacherModel> teacher = teacherRepository.findById(teacherId);
            if (!teacher.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            StudentModel student = teacher.get().getStudent();
            if (student == null) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            return ResponseEntity.ok(List.of(student));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Error fetching teacher's students"));
        }
    }

    @GetMapping("/parent/{parentId}/students")
    public ResponseEntity<?> getParentStudents(@PathVariable Integer parentId) {
        try {
            Optional<ParentModel> parent = parentRepository.findById(parentId);
            if (!parent.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            StudentModel student = parent.get().getStudent();
            if (student == null) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            return ResponseEntity.ok(List.of(student));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Error fetching parent's students"));
        }
    }
}