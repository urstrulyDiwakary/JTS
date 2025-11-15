package com.app.admin.controller;

import com.app.entity.Project;
import com.app.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/projects")
public class AdminProjectApiController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        Project created = projectService.createProject(project);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project projectUpdate) {
        return projectService.getProjectById(id)
                .map(existingProject -> {
                    if (projectUpdate.getName() != null) existingProject.setName(projectUpdate.getName());
                    if (projectUpdate.getDescription() != null) existingProject.setDescription(projectUpdate.getDescription());
                    if (projectUpdate.getStatus() != null) existingProject.setStatus(projectUpdate.getStatus());
                    if (projectUpdate.getClientName() != null) existingProject.setClientName(projectUpdate.getClientName());
                    if (projectUpdate.getImageUrl() != null) existingProject.setImageUrl(projectUpdate.getImageUrl());
                    Project updated = projectService.updateProject(existingProject);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok().build();
    }
}

