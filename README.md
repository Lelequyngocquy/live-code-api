# LIVE CODE EXECUTION PROGRAM (Backend)

A scalable, asynchronous remote code execution system supporting multiple programming languages such as Node.js, Python, PHP, and Ruby. Built with a Producer-Consumer architecture to efficiently handle code execution tasks without blocking the main API thread (Asynchronous).

## Core Features

- **Polyglot Execution:** Supports Node.js, Python 3, PHP, and Ruby scripts.
- **Asynchronous Task Queue:** Uses Redis and BullMQ for managing execution jobs, ensuring high availability and responsiveness.
- **Security & Resource Constraints:**
  - **Time Limit Enforcement:** Automatically kills processes exceeding 5 seconds to prevent infinite loops and resource exhaustion.
  - **Session Persistence:** Continuously syncs code with a PostgreSQL database.
- **Containerized Deployment:** Fully Dockerized environment for consistent setup across development and production.

## Technology Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Queue & Caching:** Redis, BullMQ
- **Containerization:** Docker, Docker Compose
- **Execution Environments:** Python 3, PHP, Ruby, Node.js

## System Architecture

MVC Model:

- **Model Layer:** Encapsulates database logic using Classes to interact with PostgreSQL, ensuring data integrity for sessions and executions.

- **Controller Layer:** Orchestrates the flow between the client and the system, validating inputs and triggering the background processing queue.

- **View Layer:** In this RESTful API project, the View layer is represented by the JSON response payloads. By decoupling the data logic (Model) from the presentation format (JSON), the system ensures that any client—whether it be a web dashboard or a mobile application—can consistently consume and display code execution results.

- **Architecture Strategy:** Combines MVC with a Producer-Consumer pattern to handle long-running code execution tasks asynchronously without impacting API performance.

### 1. High-Level Diagram

The system consists of four primary components working in orchestration:

- **API Server (Producer):** Handles incoming source code, manages sessions, and dispatches execution tasks to the queue.

- **Redis (Message Broker):** Acts as a buffer, storing execution jobs reliably until a worker is available.

- **Worker (Consumer):** Listens for jobs in Redis, coordinates the execution process, and updates the final results.

- **PostgreSQL (Database):** Provides persistent storage for session metadata and detailed execution history.

### 2. Request Flow

The end-to-end flow of a code execution request is as follows:

- **Submit:** The user sends source code via `POST /code-sessions/:id/run`.

- **Queueing:** The API creates an execution record with a `QUEUED` status and pushes a Job into BullMQ.

- **Processing:** A Worker picks up the Job, transitions the status to `RUNNING`, and invokes the Executor Service.

- **Execution:** The Executor generates a temporary file and runs the code in an isolated child process with strict Timeout and Memory Limits.

- **Result:** Upon completion, the Worker captures stdout/stderr, calculates execution time, and updates the status to `COMPLETED` or `FAILED`.

- **Polling:** The client retrieves the final result via the `GET /executions/:id` endpoint.

---

## Folder Structure Explanation

The project follows a modular structure to ensure clear Separation of Concerns:

- **src/config/**: Contains system configurations, including Database and Redis connection setups.

- **src/controllers/**: Handles the API layer logic, managing request inputs and formatting responses.

- **src/routes/**: Defines the API endpoints as specified in the technical requirements.
- **src/models/**: Defines the data schema for PostgreSQL (Sessions and Executions).
- **src/queues/**: Manages BullMQ initialization and producer logic for job dispatching.
- **src/services/**: The core engine responsible for spawning child processes and enforcing resource constraints.

- **src/workers/**: Contains the consumer logic that processes jobs in the background.

- **src/app.js**: Initializes the Express application and global middlewares (e.g., Rate Limiting for abuse protection).

---

## Design Decisions & Safety

- **Asynchronous Reliability:** By offloading execution to background workers, the system remains responsive even under heavy load.

- **Resource Sandboxing:** Strict enforcement of time and memory limits prevents infinite loops and excessive resource usage from crashing the server.

- **Observability:** Every stage of the execution lifecycle (`QUEUED` → `RUNNING` → `COMPLETED`) is logged and tracked with timestamps for debugging and monitoring.

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

- **Response:**
  receive a new `session_id` from server (backend) with status 201

```json
{
  //response
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

- **Response:**

```json
{
  //response
  "session_id": "session_id",
  "status": "ACTIVE"
}
```

### 3. Execute Code

- **Endpoint:** `POST /code-sessions/:id/run`
- **Description:** Submits code to the execution queue. Returns an `execution_id`.
- **Response:**

```json
{
  //response
  "execution_id": "execution_id",
  "status": "QUEUED"
}
```

### 4. Retrieve Execution Results

- **Endpoint:** `GET /executions/:execution_id`
- **Description:** Returns execution status (`COMPLETED`, `FAILED`, `TIMEOUT`), `stdout`, `stderr`, and execution time in milliseconds.
- **Response:**

```json
{
  //response
  "execution_id": "execution_id",
  "status": "COMPLETED",
  "stdout": "YOUR_OUT_PUT_AFTER_SERVER_PROCESSES_AND_RETURNED",
  "stderr": "",
  "execution_time_ms": 123
}
```

### 5. Results for one session! (of course, it works with any new session)

- **Javascript Examples:**
  - **_auto save:_**
    ![2. Auto save WITH JS](/images/2.auto_save_js.png)
  - **_run code:_**
    ![3. run code WITH JS](/images/3.run_js.png)
  - **_get result:_**
    ![4. get result WITH JS](/images/4.result_js.png)

- **Pyhton Examples:**
  - **_auto save:_**
    ![5. Auto save WITH PYTHON](/images/2.auto_save_python.png)
  - **_run code:_**
    ![6. run code WITH PYTHON](/images/3.run_python.png)
  - **_get result:_**
    ![7. get result WITH PYTHON](/images/4.result_python.png)

- **PHP Examples:**
  - **_auto save:_**
    ![8. Auto save WITH PHP](/images/2.auto_save_php.png)
  - **_run code:_**
    ![9. run code WITH PHP](/images/3.run_php.png)
  - **_get result:_**
    ![10. get result WITH PHP](/images/4.result_php.png)

- **Ruby Examples:**
  - **_auto save:_**
    ![11. Auto save WITH RUBY](/images/2.auto_save_ruby.png)
  - **_run code:_**
    ![12. run code WITH RUBY](/images/3.run_ruby.png)
  - **_get result:_**
    ![13. get result WITH RUBY](/images/4.result_ruby.png)

- **TIMEOUT Examples:**
  - **_try an infinite loop:_**
    ![14. create an infinite loop](/images/5.timeout1.png)
  - **_get result:_**
    ![15. result of an infinite loop](/images/5.timeout3.png)

## Database Access

- **Note:** When successfully running the docker-compose.yml (with 3 containers inside), then it is able to access the database through docker image
- **Bash Command:**

```bash
docker exec -it CONTAINER_NAME psql -U DB_USER -d DB_NAME
# check on your .env file and docker-compose.yml to use the right parameters here! EX:
# docker exec -it live-code-db psql -U postgres -d livecode_db
```

![16. postgresql inside docker image](/images/6.db_check.png)

```bash
#sql query example:
select * from code_sessions;
```

![17. table check](/images/6.db_table_check.png)

## Design Considerations

- **Process Isolation:** Each code execution runs in a separate child process.
- **UTF-8 Support:** Ensures correct handling of non-ASCII characters by enforcing UTF-8 encoding, especially on Windows environments.
- **Automatic Cleanup:** Deletes temporary source files immediately after execution, maintaining host system integrity.
- **Timeout Handling:** Implements a race condition between process exit event and a 5-second timer to prevent indefinite runs.

---

**Author:** Ngoc Quy Le - lengocquytdts@gmail.com
