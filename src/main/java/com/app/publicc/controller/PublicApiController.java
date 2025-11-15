package com.app.publicc.controller;

import com.app.entity.Project;
import com.app.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class PublicApiController {

    @Autowired
    private ProjectService projectService;

    @GetMapping("/latest")
    public ResponseEntity<List<Project>> getLatestProjects() {
        List<Project> projects = projectService.getLatestProjects();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Project>> getAllProjects() {
        List<Project> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }
}

