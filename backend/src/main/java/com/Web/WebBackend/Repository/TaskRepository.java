package com.Web.WebBackend.Repository;

import com.Web.WebBackend.Model.TaskModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<TaskModel, Integer> {
        List<TaskModel> findAllByAssignedToId(Integer studentId);
        List<TaskModel> findByAssignedBy(String username);

        List<TaskModel> findAllByAssignedToIdAndAssignedBy(Integer id, String username);

        List<TaskModel> findAllByAssignedBy(String username);
}