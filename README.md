# Task Manager

A full-stack task management application built with **Laravel 13, React 19, Inertia.js 3, TypeScript, and MySQL 8.4**.

The application allows users to organize tasks into projects, manage tasks, and reorder them using drag and drop. Task ordering is persisted in the database.

## Features

### Project Management

- Create projects.
- Select and filter tasks by project.
- Update project details.
- Delete projects and their associated tasks.

### Task Management

- Create tasks within projects.
- Edit task names.
- Delete tasks.
- View tasks by project.
- Automatically assign task priorities based on their order.

### Drag and Drop

- Reorder tasks using drag and drop.
- Persist task ordering in MySQL.
- Automatically update task priorities after reordering.
- Use database transactions to maintain consistent ordering.

### Frontend

- React 19 with TypeScript.
- Inertia.js 3 for communication between Laravel and React.
- Tailwind CSS 4.
- shadcn/ui components using Base UI.
- Lucide React icons.
- dnd-kit for drag-and-drop functionality.
- Laravel Wayfinder for type-safe route generation.
- Vite+ for frontend development and build tooling.

### Backend

- Laravel 13.
- PHP 8.4 runtime.
- MySQL 8.4.
- Laravel Form Requests for request validation.
- Eloquent ORM for database interactions.
- Database transactions for task ordering and updates.

### Docker Development Environment

- Separate Laravel, MySQL, and Vite services.
- PHP 8.4 CLI container for Laravel.
- PHP 8.4 and Node.js 24 container for Vite and Wayfinder.
- Persistent Docker volumes for MySQL, Composer dependencies, and npm dependencies.
- Docker Compose health checks for service startup dependencies.

> **Important:** The application currently does not implement authentication or user-specific task ownership. It is intended as a development/demo project and should not be exposed as a production multi-user application without appropriate authentication and authorization.

## Technology Stack

| Technology                         | Version                           |
| ---------------------------------- | --------------------------------- |
| PHP runtime                        | 8.4                               |
| PHP requirement in `composer.json` | `^8.3`                            |
| Laravel                            | `^13.17`                          |
| React                              | `^19.2`                           |
| Inertia.js                         | `^3.0`                            |
| TypeScript                         | `^5.7`                            |
| Tailwind CSS                       | `^4.0`                            |
| MySQL                              | 8.4                               |
| Node.js                            | 24                                |
| npm                                | 11.19.1                           |
| Laravel Wayfinder                  | `^0.1`                            |
| Docker                             | Docker Engine with Compose plugin |

**PHP version note:** Although the Composer PHP constraint is `^8.3`, the currently locked dependencies require PHP 8.4.1 or higher. Use PHP 8.4 to install and run this project's current dependency set.

## Prerequisites

You can run the project either using Docker or by installing the development tools directly on your machine.

### Option A: Docker (recommended)

Install:

- Docker Desktop, or Docker Engine with the Docker Compose plugin.
- Git.

Verify Docker:

```bash
docker --version
docker compose version
```

You do not need to install PHP, Composer, Node.js, npm, or MySQL separately when using the provided Docker environment.

### Option B: Native local development

Install:

1. PHP 8.4.
2. Composer 2.
3. Node.js 24.
4. npm 11.19.1.
5. MySQL 8.4.
6. Git.

Verify the installations:

```bash
php -v
composer -V
node -v
npm -v
mysql --version
```

Make sure the PHP extensions required by the Laravel application are installed, including:

- BCMath
- cURL
- Intl
- Mbstring
- PDO MySQL
- XML
- ZIP

## Getting the Project

Clone the repository:

```bash
git clone <repository-url>
```

Alternatively, extract the downloaded project ZIP file.

Navigate into the project directory:

```bash
cd task-manager
```

## Docker Installation and Setup

The Docker environment is the recommended way to run this project because it provides consistent PHP, Node.js, and MySQL versions.

### 1. Configure the environment

Make sure the project has a `.env` file.

If one does not exist, create it:

```bash
cp .env.example .env
```

The Docker Compose application service overrides the database connection settings inside the Laravel container. Therefore, you can keep your host-development database configuration in `.env` unchanged.

### 2. Build and start the containers

Run:

```bash
docker compose up -d --build
```

This starts three services:

| Service | Purpose                 | Host port |
| ------- | ----------------------- | --------- |
| `app`   | Laravel application     | 8000      |
| `mysql` | MySQL database          | 3307      |
| `vite`  | Vite development server | 5173      |

The application container installs Composer dependencies. The Vite container installs npm dependencies and starts the frontend development server.

The Vite container also has PHP and access to the Composer `vendor` volume because the Laravel Wayfinder Vite plugin executes an Artisan command during startup.

### 3. Run database migrations

After the containers are running, execute:

```bash
docker compose exec app php artisan migrate
```

This creates the application database tables.

### 4. Check container status

Run:

```bash
docker compose ps
```

View application logs:

```bash
docker compose logs --tail=100 app
```

View Vite logs:

```bash
docker compose logs --tail=100 vite
```

### 5. Open the application

Visit:

**http://localhost:8000**

The Vite development server runs on:

**http://localhost:5173**

### Docker database connection

Inside Docker, Laravel connects to MySQL using the Compose service name:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=task_manager
DB_USERNAME=developer
DB_PASSWORD=password
```

From your host machine, the MySQL server is exposed on port `3307`:

```text
Host: 127.0.0.1
Port: 3307
Database: task_manager
Username: developer
Password: password
```

The credentials shown above are for local development only. Use secure credentials and secrets management for production.

### Useful Docker commands

Check running containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

View only Laravel logs:

```bash
docker compose logs -f app
```

View only Vite logs:

```bash
docker compose logs -f vite
```

Enter the Laravel container:

```bash
docker compose exec app sh
```

Run Artisan commands:

```bash
docker compose exec app php artisan
```

Run database migrations:

```bash
docker compose exec app php artisan migrate
```

Run migrations with rollback and re-execution:

```bash
docker compose exec app php artisan migrate:refresh
```

> **Warning:** `migrate:refresh` rolls back and reruns migrations. It can delete application data. Do not run it against a database containing data you need to preserve.

Stop the services:

```bash
docker compose down
```

Start the services again:

```bash
docker compose up -d
```

Rebuild the images:

```bash
docker compose up -d --build
```

> **Important:** Avoid `docker compose down --volumes` unless you intentionally want to delete the named Docker volumes. This removes the persistent MySQL data and dependency volumes.

## Native Local Installation and Setup

Use this approach if you want to run Laravel, MySQL, and Vite directly on your machine instead of using Docker.

### 1. Install PHP dependencies

```bash
composer install
```

### 2. Configure the environment

Create your local environment file if it does not exist:

```bash
cp .env.example .env
```

Generate the Laravel application key:

```bash
php artisan key:generate
```

### 3. Create the MySQL database

Log in to MySQL:

```bash
mysql -u root -p
```

Create the database:

```sql
CREATE DATABASE task_manager
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Exit MySQL:

```sql
EXIT;
```

### 4. Configure the database connection

Update the database settings in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=task_manager
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
```

Replace the username and password with your local MySQL credentials.

### 5. Run database migrations

```bash
php artisan migrate
```

This creates the required application tables, including:

- `projects`
- `tasks`

Laravel's other application tables are also created by the available migrations.

### 6. Install frontend dependencies

If `package-lock.json` is available, use:

```bash
npm ci
```

Otherwise:

```bash
npm install
```

### 7. Generate Wayfinder routes

```bash
php artisan wayfinder:generate --with-form
```

The Wayfinder Vite plugin also runs route generation during Vite startup.

### 8. Clear application caches

```bash
php artisan optimize:clear
```

## Run the Application Locally

Start the development environment using the Composer script:

```bash
composer run dev
```

This starts the Laravel development server and the frontend development tooling configured by the project.

Open the application:

**http://127.0.0.1:8000**

## Production Build and Code Checks

### Build frontend assets

```bash
npm run build
```

### Build frontend assets with SSR

```bash
npm run build:ssr
```

### TypeScript validation

```bash
npm run types:check
```

### Frontend linting and formatting checks

```bash
npm run check
```

### Automatically fix frontend linting and formatting issues

```bash
npm run check:fix
```

### Laravel code formatting checks

```bash
composer run lint:check
```

> These commands build and validate project assets and code. They do not, by themselves, configure a production web server or make the current development Docker setup production-ready.

## Project Structure

```text
task-manager/
│
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── ProjectController.php
│   │   │   ├── TaskController.php
│   │   │   └── TaskReorderController.php
│   │   │
│   │   └── Requests/
│   │
│   ├── Models/
│   │   ├── Project.php
│   │   └── Task.php
│   │
│   └── Services/
│       └── TaskOrderingService.php
│
├── database/
│   └── migrations/
│
├── resources/
│   ├── css/
│   └── js/
│       ├── actions/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       │   └── dashboard.tsx
│       ├── routes/
│       ├── wayfinder/
│       └── app.tsx
│
├── routes/
│   └── web.php
│
├── tests/
│
├── Dockerfile
├── Dockerfile.vite
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── .env.example
├── composer.json
├── package.json
├── package-lock.json
└── README.md
```

Generated files and some framework directories may vary depending on the installed dependencies and development workflow.

## Database Design

### Projects Table

Stores project information.

| Column      | Description                  |
| ----------- | ---------------------------- |
| id          | Project ID                   |
| name        | Project name                 |
| description | Optional project description |
| created_at  | Creation timestamp           |
| updated_at  | Last update timestamp        |

### Tasks Table

Stores tasks associated with projects.

| Column     | Description           |
| ---------- | --------------------- |
| id         | Task ID               |
| project_id | Associated project ID |
| name       | Task name             |
| priority   | Numeric task ordering |
| created_at | Creation timestamp    |
| updated_at | Last update timestamp |

Each task belongs to a project. Deleting a project also deletes its associated tasks.

## Task Priority Logic

Task priority represents the position of a task within its project, not a High, Medium, or Low priority category.

For example:

| Task                   | Priority |
| ---------------------- | -------: |
| Create login page      |        1 |
| Build dashboard        |        2 |
| Add project management |        3 |

When tasks are reordered using drag and drop:

1. The frontend captures the new task order.
2. The updated ordering is sent to Laravel.
3. Laravel validates the request.
4. The task ordering service updates priorities inside a database transaction.
5. The new ordering is persisted in MySQL.

This ensures that task ordering remains consistent after refreshing the browser.

## Application Routes

| Method | URL                                 | Description            |
| ------ | ----------------------------------- | ---------------------- |
| GET    | `/`                                 | Redirects to dashboard |
| GET    | `/dashboard`                        | Displays dashboard     |
| POST   | `/projects`                         | Creates a project      |
| PUT    | `/projects/{project}`               | Updates a project      |
| DELETE | `/projects/{project}`               | Deletes a project      |
| POST   | `/tasks`                            | Creates a task         |
| PUT    | `/tasks/{task}`                     | Updates a task         |
| DELETE | `/tasks/{task}`                     | Deletes a task         |
| PUT    | `/projects/{project}/tasks/reorder` | Reorders project tasks |

## Important Notes

- Keep your `.env` file local. Never commit database credentials or application keys.
- Keep `.env.example` updated with the environment variables required by the application, without including real secrets.
- Run migrations whenever new database migrations are added.
- Run `php artisan wayfinder:generate --with-form` after changing routes when generated route types need refreshing. The Vite plugin also generates these during development server startup.
- Task ordering is stored in MySQL, so changes persist after refreshing the browser.
- Docker uses the MySQL service hostname `mysql`; native local development generally uses `127.0.0.1`.
- Docker's MySQL host port is `3307`, while its internal container port is `3306`.
- The application currently does not implement authentication or user-specific task ownership.
- Do not expose the development server or development database to public networks.
- Back up your database before performing destructive migration or Docker volume operations.

## License

This project is open-source software licensed under the [MIT License](https://opensource.org/licenses/MIT).
