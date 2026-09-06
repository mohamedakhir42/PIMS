# PIMS - Phosboucraa Inventory Management System

Système de gestion d'inventaire complet basé sur le web, construit avec FastAPI, React et PostgreSQL.

## Architecture

```
PIMS/
├── backend/              # Application FastAPI
│   ├── app/
│   │   ├── main.py      # Point d'entrée de l'application
│   │   ├── core/        # Configuration et sécurité
│   │   ├── db/          # Configuration de la base de données
│   │   ├── models/      # Modèles SQLAlchemy
│   │   ├── schemas/     # Schémas Pydantic
│   │   ├── api/         # Points de terminaison API
│   │   ├── services/    # Logique métier
│   │   └── utils/       # Utilitaires
│   ├── alembic/         # Migrations de base de données
│   ├── requirements.txt # Dépendances Python
│   ├── Dockerfile       # Configuration Docker Backend
│   └── .env.example    # Modèle de variables d'environnement
│
├── frontend/            # Application React
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── pages/       # Composants de pages
│   │   ├── layouts/     # Composants de mise en page
│   │   ├── services/    # Services API
│   │   ├── hooks/       # Hooks personnalisés
│   │   ├── types/       # Types TypeScript
│   │   └── utils/       # Utilitaires
│   ├── package.json     # Dépendances Node
│   ├── Dockerfile       # Configuration Docker Frontend
│   └── .env.example    # Modèle de variables d'environnement
│
└── docker-compose.yml   # Configuration Docker Compose
```

## Prérequis

- Python 3.11+
- Node.js 18+
- PostgreSQL (Neon recommandé)
- Docker et Docker Compose (optionnel)

## Installation

### ÉTAPE 1 — Configuration `.env`

#### Backend (.env)
Copiez `backend/.env.example` vers `backend/.env` et remplissez les variables suivantes:

```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
JWT_SECRET=votre-clé-secrète-ici
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30
CLOUDFLARE_IMAGE_BASE_URL=https://votre-url-cloudflare.com
```

**Important:** Pour Neon PostgreSQL, votre DATABASE_URL ressemblera à:
```
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

#### Frontend (.env)
Copiez `frontend/.env.example` vers `frontend/.env` et remplissez:

```bash
VITE_API_URL=http://localhost:8000/api/v1
```

### ÉTAPE 2 — Installation des dépendances

#### Backend
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
```

### ÉTAPE 3 — Base de données Neon

1. Créez un compte Neon PostgreSQL sur https://neon.tech
2. Créez un nouveau projet/base de données
3. Copiez la chaîne de connexion depuis le tableau de bord Neon
4. Collez-la comme `DATABASE_URL` dans `backend/.env`

**Note:** La chaîne de connexion doit inclure `?sslmode=require` pour une connexion sécurisée.

### ÉTAPE 4 — Migrations

Après avoir configuré DATABASE_URL, exécutez les commandes suivantes depuis le répertoire backend:

```bash
cd backend

# Générer la migration initiale
alembic revision --autogenerate -m "Migration initiale"

# Appliquer les migrations
alembic upgrade head
```

### ÉTAPE 4.5 — Peupler la base de données (Optionnel)

Pour créer des données initiales incluant l'utilisateur administrateur, les rôles, les permissions et des données d'exemple:

```bash
cd backend
python seed.py
```

Cela créera:
- Utilisateur administrateur (nom d'utilisateur: `admin`, mot de passe: `admin123`)
- Toutes les permissions requises
- Rôles Administrateur et Manager
- Catégories d'exemple
- Fournisseur d'exemple

**⚠️ Important:** Changez le mot de passe administrateur après la première connexion!

### ÉTAPE 5 — Démarrage du Backend

Démarrez le serveur FastAPI backend:

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Le backend sera disponible à: http://localhost:8000

### ÉTAPE 6 — Démarrage du Frontend

Démarrez le serveur de développement React:

```bash
cd frontend
npm run dev
```

Le frontend sera disponible à: http://localhost:3000

### ÉTAPE 7 — Docker

Si vous préférez utiliser Docker Compose:

1. Créez un fichier `.env` à la racine du projet avec vos variables d'environnement
2. Exécutez:

```bash
docker-compose up --build
```

Cela démarrera les services backend et frontend.

### ÉTAPE 8 — Accès

Après avoir démarré les services:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Documentation API (Swagger):** http://localhost:8000/docs
- **Documentation API (ReDoc):** http://localhost:8000/redoc

## Création d'un utilisateur administrateur

Actuellement, vous devez créer des utilisateurs directement dans la base de données ou via l'API. Un script de peuplement sera fourni dans les futures mises à jour.

Pour l'instant, vous pouvez créer un utilisateur en utilisant l'API:

```bash
# D'abord, vous devrez créer des rôles et permissions via la base de données
# Ensuite, créez un utilisateur avec le rôle administrateur
```

## URLs de l'application

- **Page de connexion:** http://localhost:3000/login
- **Tableau de bord:** http://localhost:3000/dashboard
- **Articles:** http://localhost:3000/inventory/articles
- **Stock:** http://localhost:3000/inventory/stock
- **Catégories:** http://localhost:3000/categories
- **Fournisseurs:** http://localhost:3000/suppliers
- **Mouvements:** http://localhost:3000/movements
- **Demandes de stock:** http://localhost:3000/requests
- **Inventaires:** http://localhost:3000/inventories
- **Rapports:** http://localhost:3000/reports
- **Journaux d'audit:** http://localhost:3000/audit-logs
- **Utilisateurs:** http://localhost:3000/users
- **Permissions:** http://localhost:3000/permissions
- **Notifications:** http://localhost:3000/notifications
- **Sites:** http://localhost:3000/organization/sites
- **Entrepôts:** http://localhost:3000/organization/warehouses
- **Zones:** http://localhost:3000/organization/zones
- **Emplacements:** http://localhost:3000/organization/locations

## Documentation API

La documentation API est générée automatiquement et disponible à:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Principaux points de terminaison API

#### Authentification
- `POST /api/v1/auth/login` - Connexion utilisateur
- `GET /api/v1/auth/me` - Obtenir l'utilisateur actuel
- `GET /api/v1/auth/me/permissions` - Obtenir les permissions de l'utilisateur

#### Articles
- `GET /api/v1/articles` - Lister les articles
- `GET /api/v1/articles/{id}` - Obtenir les détails d'un article
- `POST /api/v1/articles` - Créer un article
- `PATCH /api/v1/articles/{id}` - Mettre à jour un article

#### Catégories
- `GET /api/v1/categories` - Lister les catégories
- `GET /api/v1/categories/{id}` - Obtenir les détails d'une catégorie
- `POST /api/v1/categories` - Créer une catégorie
- `PATCH /api/v1/categories/{id}` - Mettre à jour une catégorie

#### Fournisseurs
- `GET /api/v1/suppliers` - Lister les fournisseurs
- `GET /api/v1/suppliers/{id}` - Obtenir les détails d'un fournisseur
- `POST /api/v1/suppliers` - Créer un fournisseur
- `PATCH /api/v1/suppliers/{id}` - Mettre à jour un fournisseur

#### Stock
- `GET /api/v1/stock` - Lister le stock
- `GET /api/v1/stock/critical` - Obtenir le stock critique
- `GET /api/v1/stock/movements` - Lister les mouvements
- `POST /api/v1/stock/receipt` - Créer une réception
- `POST /api/v1/stock/issue` - Créer une sortie
- `POST /api/v1/stock/transfer` - Créer un transfert
- `POST /api/v1/stock/adjustment` - Créer un ajustement

#### Demandes de stock
- `GET /api/v1/requests` - Lister les demandes
- `POST /api/v1/requests` - Créer une demande
- `POST /api/v1/requests/{id}/submit` - Soumettre une demande
- `POST /api/v1/requests/{id}/cancel` - Annuler une demande
- `POST /api/v1/requests/{id}/approve` - Approuver une demande
- `POST /api/v1/requests/{id}/reject` - Rejeter une demande

#### Inventaires
- `GET /api/v1/inventories` - Lister les inventaires
- `POST /api/v1/inventories` - Créer un inventaire
- `POST /api/v1/inventories/{id}/validate` - Valider un inventaire

## Modèles de base de données

L'application inclut les entités principales suivantes:

- **Utilisateurs & Authentification:** users, roles, permissions, role_permissions, user_permissions
- **Organisation:** sites, warehouses, zones, locations
- **Inventaire:** categories, articles, suppliers, article_suppliers
- **Gestion de stock:** stock, stock_movements
- **Demandes:** stock_requests, stock_request_items
- **Inventaires physiques:** inventories, inventory_items
- **Système:** notifications, attachments, audit_logs

## Fonctionnalités implémentées

### Fonctionnalités MVP
- ✅ Authentification JWT
- ✅ Rôles et permissions des utilisateurs (RBAC)
- ✅ Gestion des articles (CRUD)
- ✅ Gestion des catégories (CRUD)
- ✅ Gestion des fournisseurs (CRUD)
- ✅ Gestion du stock
- ✅ Mouvements de stock (Réception, Sortie, Transfert, Ajustement)
- ✅ Tableau de bord avec KPIs et graphiques
- ✅ Interface utilisateur responsive avec Bootstrap
- ✅ Demandes de stock et workflow d'approbation
- ✅ Gestion des inventaires physiques
- ✅ Rapports avancés
- ✅ Journaux d'audit
- ✅ Système de notifications
- ✅ Gestion des utilisateurs et permissions
- ✅ Structure organisationnelle (Sites, Entrepôts, Zones, Emplacements)
- ✅ Icônes Lucide React
- ✅ Composant DataTable réutilisable
- ✅ Système de couleurs cohérent

### Fonctionnalités futures
- Scan de codes QR/code-barres
- Pièces jointes de documents
- Notifications avancées
- Interface utilisateur des journaux d'audit

## Sécurité

- Les mots de passe sont hachés avec bcrypt
- Tokens JWT pour l'authentification
- Contrôle d'accès basé sur les rôles (RBAC)
- Protection CORS
- Prévention des injections SQL via l'ORM SQLAlchemy
- Transactions pour les opérations critiques de stock
- Journalisation d'audit pour les opérations sensibles

## Développement

### Développement Backend
```bash
cd backend
uvicorn app.main:app --reload
```

### Développement Frontend
```bash
cd frontend
npm run dev
```

### Exécution des tests
```bash
# Tests backend
cd backend
pytest

# Tests frontend (à implémenter)
cd frontend
npm test
```

## Dépannage

### Problèmes de connexion à la base de données
- Assurez-vous que DATABASE_URL est correctement configuré
- Vérifiez que votre base de données Neon est active
- Vérifiez que le mode SSL est défini sur `require` pour Neon

### Problèmes CORS
- Assurez-vous que l'URL API frontend correspond à l'URL backend
- Vérifiez la configuration CORS dans le backend

### Problèmes de migration
- Assurez-vous qu'Alembic est correctement configuré
- Vérifiez que DATABASE_URL est défini avant d'exécuter les migrations

### Problèmes de permissions RBAC
- Vérifiez que les rôles et permissions sont correctement configurés
- Assurez-vous que l'utilisateur a les rôles et permissions nécessaires
- Consultez les logs du backend pour les erreurs de permission

## Règles métier critiques

### Gestion du stock
- Les mouvements de stock doivent être transactionnels pour éviter les incohérences
- Le stock ne peut pas devenir négatif sans permission explicite
- Les ajustements de stock doivent être journalisés
- Les transferts de stock doivent vérifier la disponibilité avant exécution

### Workflow des demandes
- Les nouvelles demandes commencent en statut DRAFT
- Les demandes doivent être explicitement soumises (DRAFT → SUBMITTED)
- Seules les demandes DRAFT ou SUBMITTED peuvent être annulées
- Les approbateurs sont identifiés via les permissions REQUEST_APPROVE (rôle ou direct)

### Inventaires physiques
- Seuls les inventaires en cours (IN_PROGRESS) peuvent être validés
- La validation crée automatiquement des mouvements d'ajustement
- Si le stock n'existe pour un article, il est créé pour les différences positives
- La validation est transactionnelle pour garantir la cohérence

## Licence

Ce projet est développé pour les besoins de gestion d'inventaire de Phosboucraa.

## Support

Pour les problèmes et questions, veuillez vous référer à la documentation du projet ou contacter l'équipe de développement.
