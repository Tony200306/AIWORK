<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation
```bash
# Auto Generate Swagger
# Hot reload
# ValidationPipe
```
```bash
$ pnpm install
```



## Running the app

### Local Development
```bash
# development
$ pnpm run start

# dev run
$ pnpm run dev

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

### Docker

#### Using Docker Compose (Recommended)
```bash
# Start all services (app, postgres, rabbitmq, redis)
$ docker-compose up -d

# View logs
$ docker-compose logs -f app

# Stop all services
$ docker-compose down

# Rebuild and start
$ docker-compose up -d --build
```

#### Using Docker Directly

**Production Build:**
```bash
# Build production image
$ docker build -t vantum-app:latest .

# Run production container
$ docker run -p 8000:8000 \
  -e DATABASE_URL=your_database_url \
  -e RABBITMQ_URL=your_rabbitmq_url \
  vantum-app:latest
```

**Development Build:**
```bash
# Build development image
$ docker build -f Dockerfile.dev -t vantum-app:dev .

# Run development container with volume mounting
$ docker run -p 8000:8000 \
  -v $(pwd)/src:/app/src \
  vantum-app:dev
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```