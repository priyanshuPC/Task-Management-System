package com.taskmanagement.tms.task.repository;

import com.taskmanagement.tms.task.model.Task;
import com.taskmanagement.tms.task.model.TaskPriority;
import com.taskmanagement.tms.task.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserId(Long userId);
    List<Task> findByUserIdAndStatus(Long userId, TaskStatus status);
    List<Task> findByUserIdAndPriority(Long userId, TaskPriority priority);
    List<Task> findByUserIdAndDueDateBefore(Long userId, LocalDate date);
    Long countByUserIdAndStatus(Long userId, TaskStatus status);
} 