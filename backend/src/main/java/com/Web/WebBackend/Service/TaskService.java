package com.Web.WebBackend.Service;

import com.Web.WebBackend.Enum.TaskStatus;
import com.Web.WebBackend.Model.ParentModel;
import com.Web.WebBackend.Model.StudentModel;
import com.Web.WebBackend.Model.TaskModel;
import com.Web.WebBackend.Model.TeacherModel;
import com.Web.WebBackend.Repository.ParentRepository;
import com.Web.WebBackend.Repository.StudentRepository;
import com.Web.WebBackend.Repository.TaskRepository;
import com.Web.WebBackend.Repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public TaskModel TeacherCreatesTask(TaskModel task, Integer teacherId, Integer studentId) {
        try {
            System.out.println("TaskService: Teacher " + teacherId + " creating task for student " + studentId);

            TeacherModel teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            StudentModel student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Verify teacher-student relationship
            if (teacher.getStudent() == null || !teacher.getStudent().getId().equals(studentId)) {
                throw new RuntimeException("Teacher can only create tasks for their assigned student");
            }

            task.setAssignedTo(student);
            task.setAssignedBy(teacher.getUsername());
            task.setStatus(TaskStatus.pending);
            task.setCreatedAt(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());

            TaskModel createdTask = taskRepository.save(task);
            System.out.println("TaskService: Task created successfully with ID: " + createdTask.getId());
            return createdTask;
        } catch (Exception e) {
            System.err.println("TaskService: Error creating task: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public TaskModel ParentCreatesTask(TaskModel task, Integer parentId, Integer studentId) {
        try {
            System.out.println("TaskService: Parent " + parentId + " creating task for student " + studentId);

            ParentModel parent = parentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent not found"));

            StudentModel student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Verify parent-student relationship
            if (parent.getStudent() == null || !parent.getStudent().getId().equals(studentId)) {
                throw new RuntimeException("Parent can only create tasks for their child");
            }

            task.setAssignedTo(student);
            task.setStatus(TaskStatus.pending);
            task.setAssignedBy(parent.getUsername());
            task.setCreatedAt(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());

            TaskModel createdTask = taskRepository.save(task);
            System.out.println("TaskService: Task created successfully with ID: " + createdTask.getId());
            return createdTask;
        } catch (Exception e) {
            System.err.println("TaskService: Error creating task: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<TaskModel> getStudentTasks(String username) {
        try {
            System.out.println("TaskService: Getting tasks for student: " + username);

            Optional<StudentModel> studentOpt = studentRepository.findByUsername(username);
            if (!studentOpt.isPresent()) {
                System.out.println("TaskService: Student not found with username: " + username);
                return new ArrayList<>();
            }

            StudentModel student = studentOpt.get();
            System.out.println("TaskService: Found student with ID: " + student.getId());

            List<TaskModel> tasks = student.getTaskModelList();
            if (tasks == null || tasks.isEmpty()) {
                System.out.println("TaskService: No tasks found for student");
                return new ArrayList<>();
            }

            System.out.println("TaskService: Found " + tasks.size() + " tasks for student");
            return tasks;
        } catch (Exception e) {
            System.err.println("TaskService: Error getting student tasks: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    // ... existing code ...
    public List<TaskModel> getTeacherTasks(String username) {
        try {
            System.out.println("TaskService: Getting tasks for teacher: " + username);

            Optional<TeacherModel> teacherOpt = teacherRepository.findByUsername(username);
            if (!teacherOpt.isPresent()) {
                System.out.println("TaskService: Teacher not found with username: " + username);
                return new ArrayList<>();
            }

            // Get all tasks assigned by this teacher
            List<TaskModel> tasks = taskRepository.findAllByAssignedBy(username);
            if (tasks == null || tasks.isEmpty()) {
                System.out.println("TaskService: No tasks found for teacher");
                return new ArrayList<>();
            }

            // Filter tasks to only show those assigned by this teacher
            List<TaskModel> filteredTasks = tasks.stream()
                    .filter(task -> task.getAssignedBy().equals(username))
                    .collect(Collectors.toList());

            System.out.println("TaskService: Found " + filteredTasks.size() + " tasks for teacher");
            return filteredTasks;
        } catch (Exception e) {
            System.err.println("TaskService: Error getting teacher tasks: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    // ... existing code ...
    // ... existing code ...
    public List<TaskModel> getTeacherTasksAwaitingApproval(String username) {
        try {
            System.out.println("TaskService: Getting tasks awaiting approval for teacher: " + username);

            Optional<TeacherModel> teacherOpt = teacherRepository.findByUsername(username);
            if (!teacherOpt.isPresent()) {
                System.out.println("TaskService: Teacher not found with username: " + username);
                return new ArrayList<>();
            }

            // Get all tasks assigned by this teacher
            List<TaskModel> tasks = taskRepository.findAllByAssignedBy(username);
            if (tasks == null || tasks.isEmpty()) {
                System.out.println("TaskService: No tasks found for teacher");
                return new ArrayList<>();
            }

            // Filter tasks to only show those awaiting approval
            List<TaskModel> filteredTasks = tasks.stream()
                    .filter(task -> task.getStatus() == TaskStatus.awaiting_approval)
                    .collect(Collectors.toList());

            System.out.println("TaskService: Found " + filteredTasks.size() + " tasks awaiting approval for teacher");
            return filteredTasks;
        } catch (Exception e) {
            System.err.println("TaskService: Error getting teacher tasks awaiting approval: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
// ... existing code ...

    // ... existing code ...
    // ... existing code ...
    public List<TaskModel> getParentTasks(String username) {
        try {
            System.out.println("TaskService: Getting all tasks for parent: " + username);

            Optional<ParentModel> parentOpt = parentRepository.findByUsername(username);
            if (!parentOpt.isPresent()) {
                System.out.println("TaskService: Parent not found with username: " + username);
                return new ArrayList<>();
            }

            ParentModel parent = parentOpt.get();
            if (parent.getStudent() == null) {
                System.out.println("TaskService: Parent has no associated student");
                return new ArrayList<>();
            }

            // Get all tasks assigned to the parent's student that were assigned by this parent
            List<TaskModel> tasks = taskRepository.findAllByAssignedToIdAndAssignedBy(parent.getStudent().getId(), username);
            if (tasks == null || tasks.isEmpty()) {
                System.out.println("TaskService: No tasks found for parent's student");
                return new ArrayList<>();
            }

            System.out.println("TaskService: Found " + tasks.size() + " tasks for parent's student");
            return tasks;
        } catch (Exception e) {
            System.err.println("TaskService: Error getting parent tasks: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
// ... existing code ...

    // ... existing code ...
    public List<TaskModel> getParentTasksAwaitingApproval(String username) {
        try {
            System.out.println("TaskService: Getting tasks awaiting approval for parent: " + username);

            Optional<ParentModel> parentOpt = parentRepository.findByUsername(username);
            if (!parentOpt.isPresent()) {
                System.out.println("TaskService: Parent not found with username: " + username);
                return new ArrayList<>();
            }

            ParentModel parent = parentOpt.get();
            if (parent.getStudent() == null) {
                System.out.println("TaskService: Parent has no associated student");
                return new ArrayList<>();
            }

            // Get all tasks assigned to the parent's student that were assigned by this parent
            List<TaskModel> tasks = taskRepository.findAllByAssignedToIdAndAssignedBy(parent.getStudent().getId(), username);
            if (tasks == null || tasks.isEmpty()) {
                System.out.println("TaskService: No tasks found for parent's student");
                return new ArrayList<>();
            }

            // Filter tasks to only show those awaiting approval
            List<TaskModel> filteredTasks = tasks.stream()
                    .filter(task -> task.getStatus() == TaskStatus.awaiting_approval)
                    .collect(Collectors.toList());

            System.out.println("TaskService: Found " + filteredTasks.size() + " tasks awaiting approval for parent's student");
            return filteredTasks;
        } catch (Exception e) {
            System.err.println("TaskService: Error getting parent tasks awaiting approval: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
// ... existing code ...

    @Transactional
    public TaskModel studentFinishedTask(Integer taskId, Integer studentId) {
        try {
            System.out.println("TaskService: Student " + studentId + " completing task " + taskId);

            Optional<TaskModel> taskOpt = taskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                System.out.println("TaskService: Task not found with ID: " + taskId);
                return null;
            }

            Optional<StudentModel> studentOpt = studentRepository.findById(studentId);
            if (!studentOpt.isPresent()) {
                System.out.println("TaskService: Student not found with ID: " + studentId);
                return null;
            }

            TaskModel task = taskOpt.get();
            StudentModel student = studentOpt.get();

            if (!task.getAssignedTo().getId().equals(student.getId())) {
                System.out.println("TaskService: Task is not assigned to this student");
                return null;
            }

            if (task.getStatus() != TaskStatus.pending) {
                System.out.println("TaskService: Task is not in pending status, current status: " + task.getStatus());
                return null;
            }

            task.setStatus(TaskStatus.awaiting_approval);
            task.setUpdatedAt(LocalDateTime.now());

            TaskModel updatedTask = taskRepository.save(task);
            System.out.println("TaskService: Task marked as awaiting approval");
            return updatedTask;
        } catch (Exception e) {
            System.err.println("TaskService: Error completing task: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @Transactional
    public TaskModel TeacherApproveTask(Integer taskId, Integer teacherId) {
        try {
            System.out.println("\n=== Starting teacher task approval process ===");
            System.out.println("Task ID: " + taskId);
            System.out.println("Teacher ID: " + teacherId);

            Optional<TeacherModel> teacherOpt = teacherRepository.findById(teacherId);
            if (!teacherOpt.isPresent()) {
                System.out.println("Teacher not found with ID: " + teacherId);
                return null;
            }

            Optional<TaskModel> taskOpt = taskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                System.out.println("Task not found with ID: " + taskId);
                return null;
            }

            TaskModel task = taskOpt.get();
            if (task.getStatus() != TaskStatus.awaiting_approval) {
                System.out.println("Task is not in awaiting_approval status: " + task.getStatus());
                return null;
            }

            if (!task.getAssignedBy().equals(teacherOpt.get().getUsername())) {
                System.out.println("Task was not assigned by this teacher");
                return null;
            }

            // Update task status
            task.setStatus(TaskStatus.approved);
            task.setCompletionDate(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());

            // Update student points directly within this transaction
            StudentModel student = task.getAssignedTo();
            System.out.println("\nUpdating student points:");
            System.out.println("Student ID: " + student.getId());
            System.out.println("Current points: " + student.getPoints());
            System.out.println("Points to add: " + task.getReward());

            int oldPoints = student.getPoints();
            int oldLevel = student.getLevel();
            int newPoints = (int) (oldPoints + task.getReward());
            int newLevel = userService.calculateLevel(newPoints);

            System.out.println("Current state:");
            System.out.println("- Points: " + oldPoints);
            System.out.println("- Level: " + oldLevel);

            System.out.println("Updating to:");
            System.out.println("- New points: " + newPoints);
            System.out.println("- New level: " + newLevel);

            student.setPoints(newPoints);
            student.setLevel(newLevel);

            // Save both the student and task in the same transaction
            StudentModel savedStudent = studentRepository.save(student);
            TaskModel updatedTask = taskRepository.save(task);

            System.out.println("Verification after save:");
            System.out.println("- Saved points: " + savedStudent.getPoints());
            System.out.println("- Saved level: " + savedStudent.getLevel());
            System.out.println("\nTask approved successfully");
            System.out.println("=== Teacher task approval process completed ===\n");

            return updatedTask;
        } catch (Exception e) {
            System.err.println("Error approving task: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @Transactional
    public TaskModel TeacherRejectTask(Integer taskId, Integer teacherId) {
        try {
            System.out.println("TaskService: Teacher " + teacherId + " rejecting task " + taskId);

            Optional<TeacherModel> teacherOpt = teacherRepository.findById(teacherId);
            if (!teacherOpt.isPresent()) {
                System.out.println("TaskService: Teacher not found with ID: " + teacherId);
                return null;
            }

            Optional<TaskModel> taskOpt = taskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                System.out.println("TaskService: Task not found with ID: " + taskId);
                return null;
            }

            TaskModel task = taskOpt.get();
            if (task.getStatus() != TaskStatus.awaiting_approval) {
                System.out.println("TaskService: Task is not in awaiting_approval status: " + task.getStatus());
                return null;
            }

            if (!task.getAssignedBy().equals(teacherOpt.get().getUsername())) {
                System.out.println("TaskService: Task was not assigned by this teacher");
                return null;
            }

            task.setStatus(TaskStatus.rejected);
            task.setCompletionDate(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());

            TaskModel updatedTask = taskRepository.save(task);
            System.out.println("TaskService: Task rejected successfully");
            return updatedTask;
        } catch (Exception e) {
            System.err.println("TaskService: Error rejecting task: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

        @Transactional
        public TaskModel ParentApproveTask(Integer taskId, Integer parentId) {
            try {
                System.out.println("\n=== Starting task approval process ===");
                System.out.println("Task ID: " + taskId);
                System.out.println("Parent ID: " + parentId);

                Optional<ParentModel> parentOpt = parentRepository.findById(parentId);
                if (!parentOpt.isPresent()) {
                    System.out.println("Parent not found with ID: " + parentId);
                    return null;
                }

                Optional<TaskModel> taskOpt = taskRepository.findById(taskId);
                if (!taskOpt.isPresent()) {
                    System.out.println("Task not found with ID: " + taskId);
                    return null;
                }

                TaskModel task = taskOpt.get();
                if (task.getStatus() != TaskStatus.awaiting_approval) {
                    System.out.println("Task is not in awaiting_approval status: " + task.getStatus());
                    return null;
                }

                if (!task.getAssignedBy().equals(parentOpt.get().getUsername())) {
                    System.out.println("Task was not assigned by this parent");
                    return null;
                }

                // Update task status
                task.setStatus(TaskStatus.approved);
                task.setCompletionDate(LocalDateTime.now());
                task.setUpdatedAt(LocalDateTime.now());

                // Update student points directly within this transaction
                StudentModel student = task.getAssignedTo();
                System.out.println("\nUpdating student points:");
                System.out.println("Student ID: " + student.getId());
                System.out.println("Current points: " + student.getPoints());
                System.out.println("Points to add: " + task.getReward());

                int oldPoints = student.getPoints();
                int oldLevel = student.getLevel();
                int newPoints = (int) (oldPoints + task.getReward());
                int newLevel = userService.calculateLevel(newPoints);

                System.out.println("Current state:");
                System.out.println("- Points: " + oldPoints);
                System.out.println("- Level: " + oldLevel);

                System.out.println("Updating to:");
                System.out.println("- New points: " + newPoints);
                System.out.println("- New level: " + newLevel);

                student.setPoints(newPoints);
                student.setLevel(newLevel);

                // Save both the student and task in the same transaction
                StudentModel savedStudent = studentRepository.save(student);
                TaskModel updatedTask = taskRepository.save(task);

                System.out.println("Verification after save:");
                System.out.println("- Saved points: " + savedStudent.getPoints());
                System.out.println("- Saved level: " + savedStudent.getLevel());
                System.out.println("\nTask approved successfully");
                System.out.println("=== Task approval process completed ===\n");

                return updatedTask;
            } catch (Exception e) {
                System.err.println("Error approving task: " + e.getMessage());
                e.printStackTrace();
                return null;
            }
        }

    @Transactional
    public TaskModel ParentRejectTask(Integer taskId, Integer parentId) {
        try {
            System.out.println("TaskService: Parent " + parentId + " rejecting task " + taskId);

            Optional<ParentModel> parentOpt = parentRepository.findById(parentId);
            if (!parentOpt.isPresent()) {
                System.out.println("TaskService: Parent not found with ID: " + parentId);
                return null;
            }

            Optional<TaskModel> taskOpt = taskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                System.out.println("TaskService: Task not found with ID: " + taskId);
                return null;
            }

            TaskModel task = taskOpt.get();
            if (task.getStatus() != TaskStatus.awaiting_approval) {
                System.out.println("TaskService: Task is not in awaiting_approval status: " + task.getStatus());
                return null;
            }

            if (!task.getAssignedBy().equals(parentOpt.get().getUsername())) {
                System.out.println("TaskService: Task was not assigned by this parent");
                return null;
            }

            task.setStatus(TaskStatus.rejected);
            task.setCompletionDate(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());

            TaskModel updatedTask = taskRepository.save(task);
            System.out.println("TaskService: Task rejected successfully");
            return updatedTask;
        } catch (Exception e) {
            System.err.println("TaskService: Error rejecting task: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @Transactional
    public TaskModel ParentUpdateTask(Integer taskId, Integer parentId, TaskModel updatedTask) {
        try {
            System.out.println("TaskService: Parent " + parentId + " updating task " + taskId);

            // Validate parent exists
            Optional<ParentModel> parentOpt = parentRepository.findById(parentId);
            if (!parentOpt.isPresent()) {
                System.out.println("TaskService: Parent not found with ID: " + parentId);
                throw new RuntimeException("Parent not found");
            }

            // Validate task exists
            Optional<TaskModel> existingTaskOpt = taskRepository.findById(taskId);
            if (!existingTaskOpt.isPresent()) {
                System.out.println("TaskService: Task not found with ID: " + taskId);
                throw new RuntimeException("Task not found");
            }

            TaskModel existingTask = existingTaskOpt.get();
            ParentModel parent = parentOpt.get();

            // Validate parent-student relationship
            if (parent.getStudent() == null || !parent.getStudent().getId().equals(existingTask.getAssignedTo().getId())) {
                System.out.println("TaskService: Parent is not associated with the student who has this task");
                throw new RuntimeException("Parent is not associated with the student who has this task");
            }

            // Validate task was assigned by this parent
            if (!existingTask.getAssignedBy().equals(parent.getUsername())) {
                System.out.println("TaskService: Task was not assigned by this parent");
                throw new RuntimeException("Task was not assigned by this parent");
            }

            // Validate task status allows updates
            if (existingTask.getStatus() != TaskStatus.pending) {
                System.out.println("TaskService: Task is not in pending status, current status: " + existingTask.getStatus());
                throw new RuntimeException("Task can only be updated when in pending status");
            }

            // Update task fields
            if (updatedTask.getTitle() != null) {
                existingTask.setTitle(updatedTask.getTitle());
            }
            if (updatedTask.getDescription() != null) {
                existingTask.setDescription(updatedTask.getDescription());
            }
            if (updatedTask.getReward() != null) {
                existingTask.setReward(updatedTask.getReward());
            }
            if (updatedTask.getDeadline() != null) {
                existingTask.setDeadline(updatedTask.getDeadline());
            }
            if (updatedTask.getDuration() != null) {
                existingTask.setDuration(updatedTask.getDuration());
            }

            // Update timestamps
            existingTask.setUpdatedAt(LocalDateTime.now());

            // Save the updated task
            TaskModel savedTask = taskRepository.save(existingTask);
            System.out.println("TaskService: Task updated successfully");
            return savedTask;
        } catch (Exception e) {
            System.err.println("TaskService: Error updating task: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public TaskModel TeacherUpdateTask(Integer taskId, Integer teacherId, TaskModel updatedTask) {
        try {
            System.out.println("TaskService: Teacher " + teacherId + " updating task " + taskId);

            // Validate teacher exists
            Optional<TeacherModel> teacherOpt = teacherRepository.findById(teacherId);
            if (!teacherOpt.isPresent()) {
                System.out.println("TaskService: Teacher not found with ID: " + teacherId);
                throw new RuntimeException("Teacher not found");
            }

            // Validate task exists
            Optional<TaskModel> taskOpt = taskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                System.out.println("TaskService: Task not found with ID: " + taskId);
                throw new RuntimeException("Task not found");
            }

            TaskModel task = taskOpt.get();
            TeacherModel teacher = teacherOpt.get();

            // Validate task was assigned by this teacher
            if (!task.getAssignedBy().equals(teacher.getUsername())) {
                System.out.println("TaskService: Task was not assigned by this teacher");
                throw new RuntimeException("Task was not assigned by this teacher");
            }

            // Validate task status allows updates
            if (task.getStatus() != TaskStatus.pending) {
                System.out.println("TaskService: Task is not in pending status, current status: " + task.getStatus());
                throw new RuntimeException("Task can only be updated when in pending status");
            }

            // Update task fields
            if (updatedTask.getTitle() != null) {
                task.setTitle(updatedTask.getTitle());
            }
            if (updatedTask.getDescription() != null) {
                task.setDescription(updatedTask.getDescription());
            }
            if (updatedTask.getReward() != null) {
                task.setReward(updatedTask.getReward());
            }
            if (updatedTask.getDeadline() != null) {
                task.setDeadline(updatedTask.getDeadline());
            }
            if (updatedTask.getDuration() != null) {
                task.setDuration(updatedTask.getDuration());
            }

            // Update timestamps
            task.setUpdatedAt(LocalDateTime.now());

            // Save the updated task
            TaskModel savedTask = taskRepository.save(task);
            System.out.println("TaskService: Task updated successfully");
            return savedTask;
        } catch (Exception e) {
            System.err.println("TaskService: Error updating task: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public TaskModel DeleteTaskByParent(Integer parentID, Integer taskId, TaskModel updatedTask) {

        if(parentRepository.findById(parentID).isPresent()) {
            System.out.println("TaskService: Deleting task " + taskId);
            Optional<TaskModel> taskOpt = taskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                System.out.println("TaskService: Task not found with ID: " + taskId);
            }
            TaskModel task = taskOpt.get();
            taskRepository.delete(task);
        }
        return updatedTask;
    }

    @Transactional
    public TaskModel rateTask(Integer taskId, Integer teacherId, Integer rating) {
        try {
            Optional<TeacherModel> teacherOpt = teacherRepository.findById(teacherId);
            if (!teacherOpt.isPresent()) {
                return null;
            }

            Optional<TaskModel> taskOpt = taskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                return null;
            }

            TaskModel task = taskOpt.get();
            if (task.getStatus() != TaskStatus.approved) {
                return null;
            }

            if (!task.getAssignedBy().equals(teacherOpt.get().getUsername())) {
                return null;
            }

            task.setRating(rating);
            task.setUpdatedAt(LocalDateTime.now());

            return taskRepository.save(task);
        } catch (Exception e) {
            return null;
        }
    }

    public TaskModel getTaskById(Integer taskId) {
        try {
            System.out.println("TaskService: Getting task with ID: " + taskId);
            Optional<TaskModel> taskOpt = taskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                System.out.println("TaskService: Task not found with ID: " + taskId);
                return null;
            }
            return taskOpt.get();
        } catch (Exception e) {
            System.err.println("TaskService: Error getting task: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @Transactional
    public TaskModel updateTask(TaskModel task) {
        try {
            System.out.println("TaskService: Updating task with ID: " + task.getId());

            // Validate task exists
            Optional<TaskModel> existingTaskOpt = taskRepository.findById(task.getId());
            if (!existingTaskOpt.isPresent()) {
                System.out.println("TaskService: Task not found with ID: " + task.getId());
                throw new RuntimeException("Task not found");
            }

            TaskModel existingTask = existingTaskOpt.get();

            // Update task fields
            if (task.getTitle() != null) {
                existingTask.setTitle(task.getTitle());
            }
            if (task.getDescription() != null) {
                existingTask.setDescription(task.getDescription());
            }
            if (task.getReward() != null) {
                existingTask.setReward(task.getReward());
            }
            if (task.getDeadline() != null) {
                existingTask.setDeadline(task.getDeadline());
            }
            if (task.getDuration() != null) {
                existingTask.setDuration(task.getDuration());
            }
            if (task.getRating() != null) {
                existingTask.setRating(task.getRating());
            }
            if (task.getFeedback() != null) {
                existingTask.setFeedback(task.getFeedback());
            }
            if (task.getStatus() != null) {
                existingTask.setStatus(task.getStatus());
            }
            existingTask.setUpdatedAt(LocalDateTime.now());

            TaskModel savedTask = taskRepository.save(existingTask);
            System.out.println("TaskService: Task updated successfully");
            return savedTask;
        } catch (Exception e) {
            System.err.println("TaskService: Error updating task: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public TaskModel reviewTaskByParent(Integer parentId, Integer taskId, Map<String, Object> reviewData) {
        try {
            Optional<ParentModel> parentOpt = parentRepository.findById(parentId);
            if (!parentOpt.isPresent()) {
                return null;
            }

            TaskModel task = getTaskById(taskId);
            if (task == null) {
                return null;
            }

            // Validate task was assigned by this parent
            if (!task.getAssignedBy().equals(parentOpt.get().getUsername())) {
                return null;
            }

            // Update task with review data
            if (reviewData.containsKey("status")) {
                String status = (String) reviewData.get("status");
                if ("approved".equals(status)) {
                    task.setStatus(TaskStatus.approved);
                } else if ("rejected".equals(status)) {
                    task.setStatus(TaskStatus.rejected);
                }
            }
            if (reviewData.containsKey("rating")) {
                task.setRating((Integer) reviewData.get("rating"));
            }
            if (reviewData.containsKey("feedback")) {
                task.setFeedback((String) reviewData.get("feedback"));
            }

            task.setCompletionDate(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());

            return updateTask(task);
        } catch (Exception e) {
            return null;
        }
    }

    public TaskModel reviewTaskByTeacher(Integer teacherId, Integer taskId, Map<String, Object> reviewData) {
        try {
            Optional<TeacherModel> teacherOpt = teacherRepository.findById(teacherId);
            if (!teacherOpt.isPresent()) {
                return null;
            }

            TaskModel task = getTaskById(taskId);
            if (task == null) {
                return null;
            }

            // Validate task was assigned by this teacher
            if (!task.getAssignedBy().equals(teacherOpt.get().getUsername())) {
                return null;
            }

            // Update task with review data
            if (reviewData.containsKey("status")) {
                String status = (String) reviewData.get("status");
                if ("approved".equals(status)) {
                    task.setStatus(TaskStatus.approved);
                } else if ("rejected".equals(status)) {
                    task.setStatus(TaskStatus.rejected);
                }
            }
            if (reviewData.containsKey("rating")) {
                task.setRating((Integer) reviewData.get("rating"));
            }
            if (reviewData.containsKey("feedback")) {
                task.setFeedback((String) reviewData.get("feedback"));
            }

            task.setCompletionDate(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());

            return updateTask(task);
        } catch (Exception e) {
            return null;
        }
    }



}