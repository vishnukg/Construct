SHELL := /bin/bash

DOCKER_COMPOSE ?= docker compose
SERVICE ?= app
RUN := $(DOCKER_COMPOSE) run --rm $(SERVICE)

.DEFAULT_GOAL := help

.PHONY: all help install cli typecheck test lint format format-check build shell clean compose-config

all: install typecheck lint test build ## Run the local verification pipeline

help: ## Show available targets
	@awk 'BEGIN {FS = ":.*##"; printf "\nConstruct targets:\n"} /^[a-zA-Z_-]+:.*?##/ {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies inside the app container
	$(RUN) npm install

cli: ## Run the Construct TUI
	$(RUN) npm run cli

typecheck: ## Run TypeScript checks
	$(RUN) npm run typecheck

test: ## Run tests with coverage
	$(RUN) npm test

lint: ## Run ESLint
	$(RUN) npm run lint

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
