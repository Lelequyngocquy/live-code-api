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
git clone https://github.com/Lelequyngocquy/live-code-api
cd live-code-api
```

2. Configure environment variables:

```bash
cp .env.example .env
```

`or create a new one copying this form`

```bash
PORT=3000
NODE_ENV=development
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=livecode_db
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

3. Launch the application:

```bash
docker-compose up --build
```

The API will be accessible at: [http://localhost:3000](http://localhost:3000).

## API Documentation

### 1. Create a New Session

- **Endpoint:** `POST /code-sessions`
- **Payload:**

```json
{
  "language": "python", // Content-Type: application/json (this header is required)
  "source_code": ""
}
```

`receive a new session_id from server (backend) with status 201`

```json
{
  //respond
  "session_id": "sesion_id",
  "status": "ACTIVE"
}
```

![1. Create a new sesion](/images/1.new_session.png)

### 2. Update (Autosave) Code

- **Endpoint:** `PATCH /code-sessions/:id`
- **Payload:**

```json
{
  "language": "javascript",
  "source_code": "console.log('Whatsup, my name is Ngoc Quy');"
}
```

- **Respond:**

```json
{
  //respond
  "session_id": "session_id",
  "status": "ACTIVE"
}
```

### 3. Execute Code

- **Endpoint:** `POST /code-sessions/:id/run`
- **Description:** Submits code to the execution queue. Returns an `execution_id`.
- **Respond:**

```json
{
  //respond
  "execution_id": "execution_id",
  "status": "QUEUED"
}
```

### 4. Retrieve Execution Results

- **Endpoint:** `GET /executions/:execution_id`
- **Description:** Returns execution status (`COMPLETED`, `FAILED`, `TIMEOUT`), `stdout`, `stderr`, and execution time in milliseconds.
- **Respond:**

```json
{
  //respond
  "execution_id": "execution_id",
  "status": "COMPLETED",
  "stdout": "YOUR_OUT_PUT_AFTER_SERVER_PROCESSES_AND_RETURNED",
  "stderr": "",
  "execution_time_ms": 123
}
```

### 5. Results for one session! (of course, it works with any new session)

- **Javascript Examples:**
  `auto save:`
  ![2. Auto save WITH JS](/images/2.auto_save_js.png)
  `run code:`
  ![3. run code WITH JS](/images/3.run_js.png)
  `get result:`
  ![4. get result WITH JS](/images/4.result_js.png)

- **Pyhton Examples:**
  `auto save:`
  ![5. Auto save WITH PYTHON](/images/2.auto_save_python.png)
  `run code:`
  ![6. run code WITH PYTHON](/images/3.run_python.png)
  `get result:`
  ![7. get result WITH PYTHON](/images/4.result_python.png)

- **PHP Examples:**
  `auto save:`
  ![8. Auto save WITH PHP](/images/2.auto_save_php.png)
  `run code:`
  ![9. run code WITH PHP](/images/3.run_php.png)
  `get result:`
  ![10. get result WITH PHP](/images/4.result_php.png)

- **Ruby Examples:**
  `auto save:`
  ![11. Auto save WITH RUBY](/images/2.auto_save_ruby.png)
  `run code:`
  ![12. run code WITH RUBY](/images/3.run_ruby.png)
  `get result:`
  ![13. get result WITH RUBY](/images/4.result_ruby.png)

- **TIMEOUT Examples:**
  `try an infinity loop:`
  ![14. create an infinity loop](/images/5.timeout1.png)
  `get result:`
  ![15. result of an infinity loop](/images/5.timeout3.png)

## Design Considerations

- **Process Isolation:** Each code execution runs in a separate child process.
- **UTF-8 Support:** Ensures correct handling of non-ASCII characters by enforcing UTF-8 encoding, especially on Windows environments.
- **Automatic Cleanup:** Deletes temporary source files immediately after execution, maintaining host system integrity.
- **Timeout Handling:** Implements a race condition between process exit event and a 5-second timer to prevent indefinite runs.

---

**Author:** Le Ngoc Quy - lengocquytdts@gmail.com
