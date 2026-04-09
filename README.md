# LIVE CODE EXECUTION PROGRAM

A scalable, asynchronous remote code execution system supporting multiple programming languages such as Node.js, Python, PHP, and Ruby. Built with a Producer-Consumer architecture to efficiently handle code execution tasks without blocking the main API thread (Asynchronous).

## Core Features

- **Polyglot Execution:** Supports Node.js, Python 3, PHP, and Ruby scripts.
- **Asynchronous Task Queue:** Uses Redis and BullMQ for managing execution jobs, ensuring high availability and responsiveness.
- **Security & Resource Constraints:**
  - **Time Limit Enforcement:** Automatically kills processes exceeding 5 seconds to prevent infinite loops and resource exhaustion.
  - **Session Persistence:** Continuously syncs code with a PostgreSQL database.
- **Containerized Deployment:** Fully Dockerized environment for consistent setup across development and production.

## System Architecture

The architecture is decoupled into the following components:

1. **API Server (Express):** Handles user requests, manages sessions, and dispatches execution tasks.
2. **Message Broker (Redis):** Stores pending execution jobs.
3. **Worker Service:** Consumes jobs, creates temporary source files, executes code via child processes, and captures output.
4. **Database (PostgreSQL):** Stores session metadata and detailed execution results (stdout, stderr, status, execution time).

## Technology Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Queue & Caching:** Redis, BullMQ
- **Containerization:** Docker, Docker Compose
- **Execution Environments:** Python 3, PHP, Ruby, Node.js

## Installation and Setup

### Prerequisites

- Docker and Docker Compose installed on your machine.

### Steps

1. Clone the repository:

```bash
git clone <your-repo-url>
cd live_code
```

2. Configure environment variables:

```bash
cp .env.example .env
```

3. Launch the application:

```bash
docker-compose up --build
```

The API will be accessible at: [http://localhost:3001](http://localhost:3001) (mapped from port 3000 inside the container).

## API Documentation

### 1. Create a New Session

- **Endpoint:** `POST /code-sessions`
- **Payload:**

```json
{
  "language": "python",
  "source_code": "..."
}
```

### 2. Update (Autosave) Code

- **Endpoint:** `PUT /code-sessions/:id`
- **Payload:**

```json
{
  "source_code": "..."
}
```

### 3. Execute Code

- **Endpoint:** `POST /code-sessions/:id/run`
- **Description:** Submits code to the execution queue. Returns an `execution_id`.

### 4. Retrieve Execution Results

- **Endpoint:** `GET /executions/:execution_id`
- **Description:** Returns execution status (`COMPLETED`, `FAILED`, `TIMEOUT`), `stdout`, `stderr`, and execution time in milliseconds.

## Design Considerations

- **Process Isolation:** Each code execution runs in a separate child process.
- **UTF-8 Support:** Ensures correct handling of non-ASCII characters by enforcing UTF-8 encoding, especially on Windows environments.
- **Automatic Cleanup:** Deletes temporary source files immediately after execution, maintaining host system integrity.
- **Timeout Handling:** Implements a race condition between process exit event and a 5-second timer to prevent indefinite runs.

---

**Author:** [Your Name] - edtronaut@gmail.com
