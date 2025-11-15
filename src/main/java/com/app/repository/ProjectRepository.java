package com.app.repository;

import com.app.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStatus(String status);

    @Query("SELECT p FROM Project p ORDER BY p.createdAt DESC")
    List<Project> findLatestProjects();
}

