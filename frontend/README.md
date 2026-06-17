# TeQizz — Frontend

SPA React pour la plateforme de formation tech gamifiée TeQizz. Interface utilisateur pour les modes de jeu QCM et Speed Matching, le tableau de bord, les classements et l'espace d'administration.

---

## Stack

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 19 | Framework UI |
| Vite | 7 | Bundler & dev server |
| Tailwind CSS | 4 | Styling utilitaire |
| React Router | 7 | Routing SPA |
| Framer Motion | 12 | Animations |
| Radix UI | — | Composants UI accessibles |
| Recharts | 3 | Graphiques de performance |
| Lucide React | — | Icônes |
| Sonner | — | Notifications toast |

---

## Structure

```
src/
├── pages/
│   ├── Home.jsx               # Landing page
│   ├── Login.jsx              # Connexion
│   ├── Signup.jsx             # Inscription
│   ├── OAuthCallback.jsx      # Callback OAuth2
│   ├── dashboard/
│   │   ├── Play.jsx           # Sélection du jeu
│   │   ├── QcmGame*.jsx       # Flux de jeu QCM (config → jeu → résultat)
│   │   ├── SmatchGame*.jsx    # Flux Speed Matching (config → jeu → résultat)
│   │   ├── Performance.jsx    # Statistiques personnelles
│   │   ├── Leaderboard.jsx    # Classement global
│   │   ├── Contribute.jsx     # Soumission de questions
│   │   └── Settings.jsx       # Paramètres du compte
│   └── admin/
│       ├── qcm/               # Gestion catégories, questions, tags, sessions, contributions
│       └── smatch/            # Gestion decks, éditeur de deck, sessions
├── components/
│   ├── ui/                    # Composants Radix UI (Button, Card, Select, Tabs, Badge…)
│   ├── layout/                # Navbar, Sidebar, Footer
│   ├── dashboard/             # Composants spécifiques Play et Performance
│   ├── admin/                 # Composants admin réutilisables (tableaux, formulaires)
│   └── auth/                  # Route guards, formulaires d'authentification
├── contexts/
│   ├── AuthContext.jsx        # Gestion de la session utilisateur (JWT, OAuth2)
│   └── ThemeContext.jsx       # Mode sombre / clair
├── services/
│   ├── api/
│   │   ├── apiClient.js       # Instance Axios + intercepteurs JWT
│   │   ├── endpoints.js       # Centralisation des URLs d'API
│   │   └── errorHandler.js    # Gestion globale des erreurs HTTP
│   ├── auth.service.js
│   ├── qcmGame.service.js
│   ├── smatchGame.service.js
│   ├── contribution.service.js
│   └── admin.service.js
├── layouts/
│   ├── DashboardLayout.jsx    # Layout avec sidebar pour les utilisateurs
│   └── AdminLayout.jsx        # Layout admin
└── lib/
    └── utils.js               # Utilitaires (cn, formatDate…)
```

---

## Lancer le projet

### Option 1 — Docker Compose global (recommandé)

Lance l'ensemble de la stack depuis la racine du projet :

```bash
cd ..   # depuis le dossier frontend/
docker compose up -d
```

Le frontend est servi par Nginx et accessible dès que le backend est prêt.

### Option 2 — Développement local

Pour travailler sur le frontend seul avec hot-reload :

```bash
# Prérequis : Node.js 20+ et pnpm

# 1. Installer les dépendances
pnpm install

# 2. Configurer la variable d'environnement
cp .env.example .env
# ou créer un fichier .env avec :
# VITE_API_BASE_URL=http://localhost:8080

# 3. Démarrer le serveur de développement
pnpm dev
```

Le backend doit tourner en parallèle pour que les appels API fonctionnent (voir [backend/README.md](../backend/README.md)).

### Autres commandes utiles

```bash
pnpm build      # Build de production dans dist/
pnpm preview    # Prévisualiser le build de production
pnpm lint       # Vérification ESLint
```

---

Développé par [LesCracks-OS](https://github.com/LesCracks-OS)
