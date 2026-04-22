.PHONY: run run-dev run-prod build stop stop-dev stop-prod clean clean-dev clean-prod logs-dev logs-prod infra infra-stop infra-clean infra-logs

# Run the app with all services (local development with bundled services)
run:
	docker compose up --build app

# Run only the app service for development (uses .env for external services)
run-dev:
	@CURRENT_BRANCH=$$(git branch --show-current); \
	git checkout dev && \
	docker compose -p vantum-dev -f docker-compose.dev.yml up --build -d && \
	git checkout "$$CURRENT_BRANCH"

# Run production app (uses .env.prod for external services)
run-prod:
	@CURRENT_BRANCH=$$(git branch --show-current); \
	git checkout main && \
	docker compose -p vantum-prod -f docker-compose.prod.yml up --build -d && \
	git checkout "$$CURRENT_BRANCH"

# Build the app service
build:
	docker compose build app

# Stop the app service
stop:
	docker compose stop app\

# Stop dev app service
stop-dev:
	docker compose -p vantum-dev -f docker-compose.dev.yml stop

# Stop prod app service
stop-prod:
	docker compose -p vantum-prod -f docker-compose.prod.yml stop

# Stop and remove the app container
clean:
	docker compose down app

# Stop and remove dev app container
clean-dev:
	docker compose -p vantum-dev -f docker-compose.dev.yml down

# Stop and remove prod app container
clean-prod:
	docker compose -p vantum-prod -f docker-compose.prod.yml down

# View dev logs
logs-dev:
	docker compose -p vantum-dev -f docker-compose.dev.yml logs -f --tail=100

# View prod logs
logs-prod:
	docker compose -p vantum-prod -f docker-compose.prod.yml logs -f --tail=100

# Run infrastructure services (postgres, rabbitmq, redis, minio)
infra:
	docker compose -p vantum-infra -f docker-compose-infra.yml up -d

# Stop infrastructure services
infra-stop:
	docker compose -p vantum-infra -f docker-compose-infra.yml stop

# Stop and remove infrastructure containers
infra-clean:
	docker compose -p vantum-infra -f docker-compose-infra.yml down

# View infrastructure logs
infra-logs:
	docker compose -p vantum-infra -f docker-compose-infra.yml logs -f --tail=100
