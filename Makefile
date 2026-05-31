SHELL := /bin/bash

DOCKER_COMPOSE ?= docker compose
SERVICE ?= app
RUN := $(DOCKER_COMPOSE) run --rm $(SERVICE)
RUN_WITH_SERVICE_PORTS := $(DOCKER_COMPOSE) run --rm --service-ports $(SERVICE)

.DEFAULT_GOAL := help

.PHONY: all help install update-deps cli ui ui-build typecheck test lint security-audit format format-check build shell clean compose-config

all: install typecheck lint test build ## Run the local verification pipeline

help: ## Show available targets
	@awk 'BEGIN {FS = ":.*##"; printf "\nConstruct targets:\n"} /^[a-zA-Z_-]+:.*?##/ {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies from package-lock.json inside the app container
	$(RUN) npm ci

update-deps: ## Update dependencies and package-lock.json inside the app container, then sync local node_modules
	$(RUN) npm install
	npm install

cli: ## Run the Construct TUI
	$(RUN) npm run cli

ui: ## Run the Construct web UI
	$(RUN_WITH_SERVICE_PORTS) npm run ui

ui-build: ## Build the Construct web UI
	$(RUN) npm run ui:build

typecheck: ## Run TypeScript checks
	$(RUN) npm run typecheck

test: ## Run tests with coverage
	$(DOCKER_COMPOSE) run --rm -e FORCE_COLOR=1 $(SERVICE) npm test

lint: ## Run ESLint
	$(RUN) npm run lint

security-audit: ## Run npm security audit
	$(RUN) npm run security:audit

format: ## Format the repository
	$(RUN) npm run format

format-check: ## Check formatting
	$(RUN) npm run format:check

build: ## Build the CLI package
	$(RUN) npm run build

shell: ## Open a shell in the app container
	$(RUN) bash

compose-config: ## Validate the Compose configuration
	$(DOCKER_COMPOSE) config

clean: ## Remove Compose containers, networks, and volumes
	$(DOCKER_COMPOSE) down --volumes --remove-orphans
