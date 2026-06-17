# TeQizz

Plateforme de formation tech gamifiée. Apprends la programmation à travers deux modes de jeu interactifs : des QCM chronométrés et du Speed Matching (Smatch). Le tout avec un système de contribution communautaire, des classements globaux et un espace d'administration complet.

---

## Stack

| Couche           | Technologie                                       |
|------------------|---------------------------------------------------|
| Frontend         | React 19, Vite 7, Tailwind CSS 4, Framer Motion   |
| Backend          | Spring Boot 4, Java 21, JPA / Hibernate           |
| Base de données  | PostgreSQL 16                                     |
| Authentification | JWT + OAuth2 (Google, GitHub)                     |
| Infra            | Docker, Docker Compose                            |

---

## Structure du projet

```
TeQizz/
├── backend/           # API REST — architecture DDD hexagonale (Java / Spring Boot)
├── frontend/          # SPA React
└── docker-compose.yml # Lance l'ensemble de la stack (PostgreSQL + Backend + Frontend)
```

---

## Lancer en local

### Via Docker Compose (recommandé)

La façon la plus simple de démarrer l'intégralité du projet en une seule commande.

**Prérequis** : Docker et Docker Compose installés.

```bash
# 1. Cloner le dépôt
git clone https://github.com/LesCracks-OS/TeQizz.git
cd TeQizz

# 2. Configurer les variables d'environnement
cp backend/.env.example backend/.env
# Ouvrir backend/.env et renseigner les valeurs (DB, JWT, OAuth2…)

# 3. Démarrer toute la stack
docker compose up -d
```

Docker Compose démarre automatiquement PostgreSQL, le backend Spring Boot et le frontend React/Nginx. Aucune installation de Java, Node ou PostgreSQL requise sur la machine.

### Développement local (frontend + backend séparés)

Pour travailler sur le frontend avec hot-reload, il faut que le backend tourne en parallèle.

#### 1. Lancer le backend

**Prérequis :** Java 21 et Docker.

```bash
cd backend

# Créer le fichier de config si absent (un .env.dev prêt est déjà fourni)
cp .env.example .env.dev   # uniquement si .env.dev n'existe pas

# Démarrer PostgreSQL + MinIO
docker compose up -d

# Lancer le backend — Linux / macOS
export $(cat .env.dev | grep -v '^#' | grep -v '^$' | xargs) && ./mvnw spring-boot:run

# Lancer le backend — Windows (PowerShell)
# Get-Content .env.dev | Where-Object { $_ -notmatch '^#' -and $_ -match '=' } | ForEach-Object { $k,$v = $_ -split '=',2; [System.Environment]::SetEnvironmentVariable($k,$v) }
# ./mvnw spring-boot:run
```

L'API est disponible sur **[http://localhost:8080](http://localhost:8080)**.

Compte admin créé automatiquement : `admin@teqizz.com` / `Admin@123456`

#### 2. Lancer le frontend

**Prérequis :** Node.js 20+ et pnpm.

```bash
cd frontend

# Installer les dépendances
pnpm install

# Démarrer le serveur de développement
pnpm dev
```

Le frontend démarre sur **[http://localhost:5173](http://localhost:5173)** avec hot-reload.

---

Développé par [LesCracks-OS](https://github.com/LesCracks-OS)
