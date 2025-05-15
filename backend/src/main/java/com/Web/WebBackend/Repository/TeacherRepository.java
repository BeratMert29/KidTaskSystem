package com.Web.WebBackend.Repository;

import com.Web.WebBackend.Model.TeacherModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<TeacherModel, Integer> {
    Optional<TeacherModel> findByUsername(String username);
}