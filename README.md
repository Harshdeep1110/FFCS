# Fully Flexible Credit System (FFCS)

A production-ready web application designed to manage course registrations, credit tracking, and academic scheduling. Built to handle complex business logic including real-time clash detection, credit limits, seat availability, and prerequisite checks.

## Key Features

- **Student Portal**: A dedicated portal for students to browse courses, verify prerequisites, and seamlessly register or drop courses while automatically preventing schedule clashes and exceeding credit limits.
- **Organizer Portal**: A premium, responsive interface for academic organizers to manage the course catalog and monitor seat availability in real time.
- **Real-Time Synchronization**: Utilizes a shared in-memory data store (Redis) to accurately handle high-concurrency registration events and prevent seat overbooking.
- **Robust Business Logic**: Comprehensive validation for prerequisites, time slot clashes, and capacity constraints.
- **Rigorously Tested**: Core business logic is strictly validated through extensive whitebox testing suites.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) with [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **In-Memory Store**: [Redis](https://redis.io/) (via `ioredis`) for real-time state and caching
- **Authentication**: JWT-based auth using `jose` and `bcryptjs`
- **Testing**: [Vitest](https://vitest.dev/) for fast, reliable unit and integration tests

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v20 or higher recommended)
- **npm** or **yarn**
- **Redis** server running locally or accessible remotely
- **Database** (e.g., PostgreSQL, MySQL) properly configured and running

### Installation & Setup

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy the example environment file and update it with your database credentials, Redis URL, and secret keys.
   ```bash
   cp .env.example .env
   ```

3. **Database Setup:**
   Run Prisma migrations to set up your database schema.
   ```bash
   npx prisma db push
   # or npx prisma migrate dev
   ```
   *Optional: Seed the database if a seed script is provided.*

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Docker Deployment

This project includes a `Dockerfile` and `docker-compose.yml` for easy containerized deployment.

To spin up the entire stack (including the app, database, and Redis cache):
```bash
docker-compose up -d --build
```

## Testing

The application uses Vitest for rigorous whitebox testing of the core business logic.

- **Run tests:**
  ```bash
  npm run test
  ```
- **Run tests in watch mode:**
  ```bash
  npm run test:watch
  ```
- **Generate test coverage report:**
  ```bash
  npm run test:coverage
  ```

## License

This project is proprietary and confidential.
