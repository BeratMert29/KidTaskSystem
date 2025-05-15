package com.Web.WebBackend.Repository;

import com.Web.WebBackend.Model.StudentModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<StudentModel, Integer> {
    Optional<StudentModel> findByUsername(String username);

    List<StudentModel> findByUsernameContainingIgnoreCase(String username);
}