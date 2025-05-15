package com.Web.WebBackend.Repository;

import com.Web.WebBackend.Model.ParentModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParentRepository extends JpaRepository<ParentModel, Integer> {
    Optional<ParentModel> findByUsername(String username);
}