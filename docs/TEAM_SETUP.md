# NeoBank Lebanon Team Setup

This guide shows each teammate how to install the basics, clone the repository, switch to the correct branch, and pull the latest work.

## 1. Install these tools first

Everyone should install:

- Git
- Node.js LTS
- Python 3.11 or newer
- VS Code or another code editor

Optional for later backend or ML work:

- PostgreSQL
- Redis

## 2. Clone the repository

Run:

```bash
git clone https://github.com/malakfaour/neobank-lebanon.git
cd neobank-lebanon
```

## 3. Check available remote branches

Run:

```bash
git branch -r
```

You should see these project branches:

- `origin/main`
- `origin/develop`
- `origin/feature/auth`
- `origin/feature/accounts`
- `origin/feature/transactions`
- `origin/feature/exchange`
- `origin/feature/kyc`
- `origin/feature/notifications`
- `origin/feature/frontend`
- `origin/feature/ml-fraud`
- `origin/feature/ml-exchange`
- `origin/feature/ml-kyc`
- `origin/feature/ml-chatbot`
- `origin/feature/ml-categories`
- `origin/feature/docker-setup`
- `origin/feature/ci-cd`

## 4. Switch to your assigned branch

Each teammate must work only on their assigned feature branch.

Example:

```bash
git checkout feature/auth
```

Replace `feature/auth` with the branch assigned to you.

## 5. Pull the latest version of your branch

Run:

```bash
git pull origin feature/auth
```

Replace `feature/auth` with your own branch name.

## 6. Daily workflow

Every time you start work:

```bash
git checkout feature/auth
git pull origin feature/auth
```

Replace `feature/auth` with your own branch.

## 7. If you need the latest updates from develop

Run:

```bash
git checkout develop
git pull origin develop
git checkout feature/auth
git merge develop
```

Replace `feature/auth` with your own branch.

## 8. Team rules

- Do not work directly on `main`
- Do not delete branches
- Do not push to someone else's branch
- Do not create extra branches unless the team agrees first
- Always pull before starting new work

## 9. Current project folders

The repository currently includes:

- `frontend/` for the Next.js frontend
- `backend/` for the FastAPI backend
- `ml/` for machine learning services
- `docs/` for project documentation

## 10. Important note

The branch structure is ready, but the repository does not yet include full setup files like `package.json`, `requirements.txt`, or dedicated setup READMEs for each app area.

That means the Git workflow is ready now, but some project-specific install commands may still need to be added by the team as development continues.
