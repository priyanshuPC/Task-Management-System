package com.taskmanagement.tms.task.controller;

import com.taskmanagement.tms.task.dto.TaskSummary;
import com.taskmanagement.tms.task.model.Task;
import com.taskmanagement.tms.task.model.TaskPriority;
import com.taskmanagement.tms.task.model.TaskStatus;
import com.taskmanagement.tms.task.repository.TaskRepository;
import com.taskmanagement.tms.task.security.jwt.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping("/test")
    public ResponseEntity<?> testDatabaseConnection() {
        try {
            System.out.println("Testing database connection...");
            long taskCount = taskRepository.count();
            System.out.println("Database connection successful. Total task count: " + taskCount);
            
            // Log the enum values for debugging
            System.out.println("Available TaskStatus values:");
            for (TaskStatus status : TaskStatus.values()) {
                System.out.println(" - " + status.name());
            }
            
            System.out.println("Available TaskPriority values:");
            for (TaskPriority priority : TaskPriority.values()) {
                System.out.println(" - " + priority.name());
            }
            
            return ResponseEntity.ok("Database connection successful. Total task count: " + taskCount);
        } catch (Exception e) {
            System.err.println("Database connection error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Database connection error: " + e.getMessage());
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getTaskSummary(@RequestHeader("Authorization") String authHeader) {
        try {
            System.out.println("Received request to /api/dashboard/summary with auth header length: " + authHeader.length());
            
            String token = authHeader.substring(7); 
            System.out.println("Extracted token length: " + token.length());
            
            try {
                // Validate the token first
                if (!jwtUtils.validateJwtToken(token)) {
                    System.err.println("Token validation failed");
                    return ResponseEntity.status(401).body("Invalid or expired token");
                }
                
                String username = jwtUtils.getUserNameFromJwtToken(token);
                System.out.println("Username from token: " + username);
                
                Long userId = (long) username.hashCode();
                System.out.println("User ID (from hash): " + userId);
                
                TaskSummary summary = new TaskSummary();

                try {
                   
                    summary.setTotalTasks(0L);
                    summary.setTodoTasks(0L);
                    summary.setInProgressTasks(0L);
                    summary.setDoneTasks(0L);
                    summary.setBlockerTasks(0L);
                    summary.setLowPriorityTasks(0L);
                    summary.setMediumPriorityTasks(0L);
                    summary.setHighPriorityTasks(0L);
                    summary.setOverdueTasks(0L);
                    
                   
                    List<Task> allTasks = taskRepository.findByUserId(userId);
                    System.out.println("Total tasks found: " + (allTasks != null ? allTasks.size() : "null"));
                    
                    if (allTasks != null) {
                        summary.setTotalTasks((long) allTasks.size());
                        
                      
                        try {
                            summary.setTodoTasks(taskRepository.countByUserIdAndStatus(userId, TaskStatus.TODO));
                            summary.setInProgressTasks(taskRepository.countByUserIdAndStatus(userId, TaskStatus.IN_PROGRESS));
                            summary.setDoneTasks(taskRepository.countByUserIdAndStatus(userId, TaskStatus.DONE));
                            summary.setBlockerTasks(taskRepository.countByUserIdAndStatus(userId, TaskStatus.BLOCKER));
                        } catch (Exception e) {
                            System.err.println("Error counting tasks by status: " + e.getMessage());
                        }

                    
                        try {
                            summary.setLowPriorityTasks(
                                    (long) allTasks.stream().filter(task -> task.getPriority() == TaskPriority.LOW).count());
                            summary.setMediumPriorityTasks(
                                    (long) allTasks.stream().filter(task -> task.getPriority() == TaskPriority.MEDIUM).count());
                            summary.setHighPriorityTasks(
                                    (long) allTasks.stream().filter(task -> task.getPriority() == TaskPriority.HIGH).count());
                        } catch (Exception e) {
                            System.err.println("Error counting tasks by priority: " + e.getMessage());
                        }

                    
                        try {
                            List<Task> overdueTasks = taskRepository.findByUserIdAndDueDateBefore(userId, LocalDate.now());
                            if (overdueTasks != null) {
                                summary.setOverdueTasks(
                                        (long) overdueTasks.stream().filter(task -> task.getStatus() != TaskStatus.DONE).count());
                            }
                        } catch (Exception e) {
                            System.err.println("Error counting overdue tasks: " + e.getMessage());
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error accessing task repository: " + e.getMessage());
                    e.printStackTrace();
                  
                }

                return ResponseEntity.ok(summary);
            } catch (Exception e) {
                System.err.println("Error processing token: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(401).body("Invalid or expired token: " + e.getMessage());
            }
        } catch (Exception e) {
            System.err.println("General error in dashboard summary: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }
} 