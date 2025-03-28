package com.taskmanagement.tms.task.controller;

import com.taskmanagement.tms.task.dto.TaskRequest;
import com.taskmanagement.tms.task.dto.TaskResponse;
import com.taskmanagement.tms.task.model.Task;
import com.taskmanagement.tms.task.model.TaskPriority;
import com.taskmanagement.tms.task.model.TaskStatus;
import com.taskmanagement.tms.task.repository.TaskRepository;
import com.taskmanagement.tms.task.security.jwt.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private JwtUtils jwtUtils;

   
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String username = jwtUtils.getUserNameFromJwtToken(token);
        
        
        Long userId = (long) username.hashCode();
        
        List<Task> tasks = taskRepository.findByUserId(userId);
        List<TaskResponse> taskResponses = tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(taskResponses);
    }

   
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        String username = jwtUtils.getUserNameFromJwtToken(token);
        Long userId = (long) username.hashCode();
        
        return taskRepository.findById(id)
                .filter(task -> task.getUserId().equals(userId))
                .map(task -> ResponseEntity.ok(convertToDto(task)))
                .orElse(ResponseEntity.notFound().build());
    }

   
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody TaskRequest taskRequest,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        String username = jwtUtils.getUserNameFromJwtToken(token);
        Long userId = (long) username.hashCode();
        
        Task task = new Task();
        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setStatus(taskRequest.getStatus() != null ? taskRequest.getStatus() : TaskStatus.TODO);
        task.setPriority(taskRequest.getPriority() != null ? taskRequest.getPriority() : TaskPriority.MEDIUM);
        task.setDueDate(taskRequest.getDueDate());
        task.setUserId(userId);
        
        Task savedTask = taskRepository.save(task);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedTask));
    }


    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest taskRequest,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        String username = jwtUtils.getUserNameFromJwtToken(token);
        Long userId = (long) username.hashCode();
        
        return taskRepository.findById(id)
                .filter(task -> task.getUserId().equals(userId))
                .map(task -> {
                    task.setTitle(taskRequest.getTitle());
                    task.setDescription(taskRequest.getDescription());
                    if (taskRequest.getStatus() != null) {
                        task.setStatus(taskRequest.getStatus());
                    }
                    if (taskRequest.getPriority() != null) {
                        task.setPriority(taskRequest.getPriority());
                    }
                    task.setDueDate(taskRequest.getDueDate());
                    Task updatedTask = taskRepository.save(task);
                    return ResponseEntity.ok(convertToDto(updatedTask));
                })
                .orElse(ResponseEntity.notFound().build());
    }

   
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        String username = jwtUtils.getUserNameFromJwtToken(token);
        Long userId = (long) username.hashCode();
        
        return taskRepository.findById(id)
                .filter(task -> task.getUserId().equals(userId))
                .map(task -> {
                    taskRepository.delete(task);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

   
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TaskResponse>> getTasksByStatus(
            @PathVariable TaskStatus status,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        String username = jwtUtils.getUserNameFromJwtToken(token);
        Long userId = (long) username.hashCode();
        
        List<Task> tasks = taskRepository.findByUserIdAndStatus(userId, status);
        List<TaskResponse> taskResponses = tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(taskResponses);
    }

   
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<TaskResponse>> getTasksByPriority(
            @PathVariable TaskPriority priority,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        String username = jwtUtils.getUserNameFromJwtToken(token);
        Long userId = (long) username.hashCode();
        
        List<Task> tasks = taskRepository.findByUserIdAndPriority(userId, priority);
        List<TaskResponse> taskResponses = tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(taskResponses);
    }

    
    @GetMapping("/overdue")
    public ResponseEntity<List<TaskResponse>> getOverdueTasks(
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        String username = jwtUtils.getUserNameFromJwtToken(token);
        Long userId = (long) username.hashCode();
        
        List<Task> tasks = taskRepository.findByUserIdAndDueDateBefore(userId, LocalDate.now());
        List<TaskResponse> taskResponses = tasks.stream()
                .filter(task -> task.getStatus() != TaskStatus.DONE) 
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(taskResponses);
    }

    
    private TaskResponse convertToDto(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setDueDate(task.getDueDate());
        response.setUserId(task.getUserId());
        response.setOverdue(task.isOverdue());
        return response;
    }
} 