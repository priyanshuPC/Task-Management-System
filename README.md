# Task Management System

A comprehensive task management application built with microservices architecture, featuring user authentication and task management capabilities.

## Architecture

The system consists of the following components:

### Backend
- **Auth Service**: Handles user registration, authentication, and JWT token generation
- **Task Service**: Manages task creation, updating, deletion, and provides dashboard statistics

### Frontend
- **Web Application**: Provides a user interface for authentication and task management
- **Client-Side Router**: Handles navigation between views without page reloads

## Technologies

### Backend
- Java 17
- Spring Boot 3.1.5
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT Authentication

### Frontend
- HTML5
- CSS3
- JavaScript (vanilla)
- Client-side routing

## Features

- User registration and authentication
- JWT-based security
- Task creation, updating, and deletion
- Task filtering by status and priority
- Dashboard with task statistics
- Responsive design
- Clean URL navigation

## Frontend Routes

The application uses client-side routing to provide a seamless user experience with clean URLs:

- **/login** - Authentication page with login and registration tabs
- **/dashboard** - Overview of task statistics and quick actions
- **/tasks** - Complete task management with filtering options
- **/profile** - User profile information

## Setup and Running

### Prerequisites
- Java 17
- Maven
- PostgreSQL 15
- Web Browser (Chrome, Firefox, Safari, etc.)

### Backend Setup

1. **PostgreSQL Installation**:
   - download it manually from the site
   - start pgadmin
   - add path to system variable

2. **Database Setup**:
   ```bash
   # Create postgres superuser with password (if not exists)
   psql postgres -c "CREATE USER postgres WITH SUPERUSER PASSWORD 'Your Password';"
   
   # Create required databases
   psql postgres -c "CREATE DATABASE auth_db;"
   psql postgres -c "CREATE DATABASE task_db;"
   
   # Grant privileges
   psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;"
   psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE task_db TO postgres;"
   ```

   Note: Update the database credentials in each service's `application.properties` file if needed.

3. **Auth Service**:
   ```bash
   cd backend/auth-service
   mvn clean install
   mvn spring-boot:run
   ```
   Auth service will run on port 8081

4. **Task Service**:
   ```bash
   cd backend/task-service
   mvn clean install
   mvn spring-boot:run
   ```
   Task service will run on port 8082

### Frontend Setup

There are several ways to serve the frontend:

1. **Simple HTTP Server (Not recommended for client-side routing)**:
   ```bash
   cd frontend
   python -m http.server 8080
   ```
   Note: With this approach, you may get 404 errors when using client-side routing and refreshing the page.

2. **Using the included Express Server (Recommended)**:
   ```bash
   cd frontend
   npm install
   npm start
   ```
   This server will properly handle client-side routing and prevent 404 errors.

3. **Using Apache with the included .htaccess file**:
   Configure Apache to serve the frontend directory with AllowOverride All to enable the .htaccess routing rules.

4. **Using Nginx with the included configuration**:
   Adapt the nginx.conf file with your server details and use it in your Nginx setup.

Then access the application at http://localhost:8080

## API Endpoints

### Auth Service (port 8081)
- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/signin`: Authenticate a user and get JWT token

### Task Service (port 8082)
- `GET /api/tasks`: Get all tasks for authenticated user
- `POST /api/tasks`: Create a new task
- `GET /api/tasks/{id}`: Get a specific task
- `PUT /api/tasks/{id}`: Update a task
- `DELETE /api/tasks/{id}`: Delete a task
- `GET /api/tasks/status/{status}`: Filter tasks by status
- `GET /api/tasks/priority/{priority}`: Filter tasks by priority
- `GET /api/tasks/overdue`: Get overdue tasks
- `GET /api/dashboard/summary`: Get dashboard statistics

## Security

The application uses JWT for authentication. Each request to the task service requires a valid JWT token in the Authorization header.

## User Guide

1. **Registration/Login**:
   - Register a new account from the registration tab
   - Log in with your credentials

2. **Dashboard**:
   - View statistics about your tasks
   - Quickly add new tasks or navigate to the tasks view

3. **Task Management**:
   - Create new tasks with title, description, status, priority, and due date
   - Edit or delete existing tasks
   - Filter tasks by status or priority
   - View overdue tasks

4. **Profile**:
   - View your account information


## Future Enhancements

- Email notifications for task deadlines
- Team collaboration features
- File attachments for tasks
- Mobile application
- Integration with calendar applications

