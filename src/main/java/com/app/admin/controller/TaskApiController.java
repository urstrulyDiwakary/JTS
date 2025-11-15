package com.app.admin.controller;

import com.app.entity.Task;
import com.app.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/tasks")
public class TaskApiController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Task>> getTasksByStatus(@PathVariable String status) {
        return ResponseEntity.ok(taskService.getTasksByStatus(status));
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<Task>> getTasksByPriority(@PathVariable String priority) {
        return ResponseEntity.ok(taskService.getTasksByPriority(priority));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getTaskStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("TODO", taskService.countTasksByStatus("TODO"));
        stats.put("IN_PROGRESS", taskService.countTasksByStatus("IN_PROGRESS"));
        stats.put("REVIEW", taskService.countTasksByStatus("REVIEW"));
        stats.put("DONE", taskService.countTasksByStatus("DONE"));
        stats.put("TOTAL", (long) taskService.getAllTasks().size());
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/create")
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        if (task.getStatus() == null || task.getStatus().isBlank()) task.setStatus("TODO");
        if (task.getPriority() == null || task.getPriority().isBlank()) task.setPriority("MEDIUM");
        Task createdTask = taskService.createTask(task);
        return ResponseEntity.ok(createdTask);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task task) {
        Task updated = taskService.updateTask(id, task);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.isBlank()) return ResponseEntity.badRequest().build();
        Task updated = taskService.updateTaskStatus(id, status);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(@PathVariable Long id) {
        boolean deleted = taskService.deleteTask(id);
        if (!deleted) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(Collections.singletonMap("message", "Task deleted successfully"));
    }
}

