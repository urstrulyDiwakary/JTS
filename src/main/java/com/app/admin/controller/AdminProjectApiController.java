package com.app.admin.controller;

import com.app.entity.Project;
import com.app.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/admin/projects")
public class AdminProjectApiController {

    @Autowired
    private ProjectService projectService;

    @Value("${app.upload.dir:uploads/projects}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        List<Project> projects = projectService.getAllProjects();
        System.out.println("📋 Returning " + projects.size() + " projects:");

        for (Project project : projects) {
            System.out.println("- Project " + project.getId() + " (" + project.getName() + "):");
            System.out.println("  FilePaths: " + project.getFilePaths());
        }

        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        System.out.println("🏗️ Creating new project:");
        System.out.println("- Name: " + project.getName());
        System.out.println("- Client: " + project.getClientName());
        System.out.println("- FilePaths received: " + project.getFilePaths());
        System.out.println("- FilePaths length: " + (project.getFilePaths() != null ? project.getFilePaths().length() : "null"));

        Project created = projectService.createProject(project);

        System.out.println("✅ Project created with ID: " + created.getId());
        System.out.println("- Saved filePaths: " + created.getFilePaths());

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
                    if (projectUpdate.getCategory() != null) existingProject.setCategory(projectUpdate.getCategory());
                    if (projectUpdate.getBudget() != null) existingProject.setBudget(projectUpdate.getBudget());
                    if (projectUpdate.getProgress() != null) existingProject.setProgress(projectUpdate.getProgress());
                    if (projectUpdate.getFilePaths() != null) existingProject.setFilePaths(projectUpdate.getFilePaths());
                    if (projectUpdate.getStartDate() != null) existingProject.setStartDate(projectUpdate.getStartDate());
                    if (projectUpdate.getEndDate() != null) existingProject.setEndDate(projectUpdate.getEndDate());
                    Project updated = projectService.updateProject(existingProject);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/upload-files")
    public ResponseEntity<Map<String, Object>> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        try {
            System.out.println("📤 File upload request received:");
            System.out.println("- Number of files: " + files.length);
            System.out.println("- Upload directory: " + uploadDir);

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            System.out.println("- Resolved upload path: " + uploadPath.toAbsolutePath());

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("✅ Created upload directory: " + uploadPath.toAbsolutePath());
            }

            java.util.List<String> filePaths = new ArrayList<>();

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    System.out.println("- Processing file: " + file.getOriginalFilename() + " (" + file.getSize() + " bytes)");

                    // Preserve original filename while ensuring uniqueness
                    String originalName = file.getOriginalFilename();
                    String cleanOriginalName = originalName != null ? originalName.replaceAll("[^a-zA-Z0-9._-]", "_") : "file";
                    String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));

                    // Extract name and extension
                    String nameWithoutExt = cleanOriginalName;
                    String extension = "";
                    if (cleanOriginalName.contains(".")) {
                        int lastDotIndex = cleanOriginalName.lastIndexOf(".");
                        nameWithoutExt = cleanOriginalName.substring(0, lastDotIndex);
                        extension = cleanOriginalName.substring(lastDotIndex);
                    }

                    // Create filename: originalName_timestamp_uniqueId.ext
                    String fileName = nameWithoutExt + "_" + timestamp + "_" + System.nanoTime() + extension;

                    System.out.println("  Generated filename: " + fileName);

                    // Save file
                    Path filePath = uploadPath.resolve(fileName);
                    Files.copy(file.getInputStream(), filePath);

                    System.out.println("  File saved to: " + filePath.toAbsolutePath());

                    // Store file metadata including original name
                    String webPath = "/uploads/projects/" + fileName;

                    // Create file metadata object
                    Map<String, String> fileInfo = new HashMap<>();
                    fileInfo.put("path", webPath);
                    fileInfo.put("originalName", originalName);
                    fileInfo.put("size", String.valueOf(file.getSize()));
                    fileInfo.put("type", file.getContentType());

                    filePaths.add(webPath); // Keep backward compatibility

                    System.out.println("  Web path: " + webPath);
                    System.out.println("  Original name preserved: " + originalName);
                }
            }

            System.out.println("✅ File upload completed successfully!");
            System.out.println("- Total files processed: " + filePaths.size());
            System.out.println("- Generated file paths: " + filePaths);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("filePaths", filePaths);
            response.put("message", filePaths.size() + " file(s) uploaded successfully");

            System.out.println("📤 Returning response: " + response);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to upload files: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/verify-file")
    public ResponseEntity<Map<String, Object>> verifyFileAccess(@RequestParam String filePath) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Remove leading slash if present
            String cleanPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;

            // Check if file exists in filesystem
            Path fullPath = Paths.get(cleanPath);
            boolean exists = Files.exists(fullPath);

            response.put("success", true);
            response.put("filePath", filePath);
            response.put("resolvedPath", fullPath.toAbsolutePath().toString());
            response.put("exists", exists);
            response.put("readable", exists && Files.isReadable(fullPath));
            response.put("size", exists ? Files.size(fullPath) : 0);

            if (exists) {
                System.out.println("✅ File verification successful: " + filePath);
            } else {
                System.out.println("❌ File not found: " + filePath + " (resolved: " + fullPath.toAbsolutePath() + ")");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            System.err.println("❌ File verification failed: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/delete-file")
    public ResponseEntity<Map<String, Object>> deleteProjectFile(
            @RequestParam Long projectId,
            @RequestParam String filePath) {

        Map<String, Object> response = new HashMap<>();

        try {
            System.out.println("🗑️ File deletion request:");
            System.out.println("- Project ID: " + projectId);
            System.out.println("- File path: " + filePath);

            // Get the project from database
            Optional<Project> projectOpt = projectService.getProjectById(projectId);
            if (!projectOpt.isPresent()) {
                response.put("success", false);
                response.put("error", "Project not found");
                return ResponseEntity.status(404).body(response);
            }

            Project project = projectOpt.get();
            String currentFilePaths = project.getFilePaths();

            if (currentFilePaths == null || currentFilePaths.isEmpty()) {
                response.put("success", false);
                response.put("error", "No files found in project");
                return ResponseEntity.status(400).body(response);
            }

            // Parse current file paths
            List<String> fileList;
            try {
                fileList = new ArrayList<>(Arrays.asList(
                    new com.fasterxml.jackson.databind.ObjectMapper().readValue(currentFilePaths, String[].class)
                ));
            } catch (Exception e) {
                System.err.println("❌ Failed to parse filePaths JSON: " + e.getMessage());
                response.put("success", false);
                response.put("error", "Invalid file paths format");
                return ResponseEntity.status(400).body(response);
            }

            // Check if file exists in the list
            if (!fileList.contains(filePath)) {
                response.put("success", false);
                response.put("error", "File not found in project");
                return ResponseEntity.status(404).body(response);
            }

            // Remove file from filesystem
            String cleanPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;
            Path fullPath = Paths.get(cleanPath);

            boolean fileDeleted = false;
            if (Files.exists(fullPath)) {
                try {
                    Files.delete(fullPath);
                    fileDeleted = true;
                    System.out.println("✅ File deleted from filesystem: " + fullPath.toAbsolutePath());
                } catch (Exception e) {
                    System.err.println("⚠️ Failed to delete file from filesystem: " + e.getMessage());
                    // Continue with database update even if file deletion fails
                }
            } else {
                System.out.println("⚠️ File not found on filesystem: " + fullPath.toAbsolutePath());
                fileDeleted = true; // Consider it deleted if it doesn't exist
            }

            // Remove file from database list
            fileList.remove(filePath);

            // Update project in database
            String updatedFilePaths = fileList.isEmpty() ? null :
                new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(fileList);
            project.setFilePaths(updatedFilePaths);

            // Update imageUrl if the deleted file was the main image
            if (filePath.equals(project.getImageUrl())) {
                project.setImageUrl(fileList.isEmpty() ? null : fileList.get(0));
            }

            Project updatedProject = projectService.updateProject(project);

            response.put("success", true);
            response.put("message", "File deleted successfully");
            response.put("deletedFile", filePath);
            response.put("remainingFiles", fileList);
            response.put("updatedProject", updatedProject);
            response.put("fileSystemDeleted", fileDeleted);

            System.out.println("✅ File deletion completed successfully");
            System.out.println("- Remaining files: " + fileList.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ File deletion failed: " + e.getMessage());
            response.put("success", false);
            response.put("error", "Failed to delete file: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok().build();
    }
}

