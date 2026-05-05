# Eversun

Application de gestion de dossiers clients pour installations solaires.

## 🚀 Technologies

- **Framework**: Next.js 15 (App Router)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Base de données**: MongoDB (Mongoose)
- **État**: Zustand
- **Icons**: Phosphor Icons
- **Charts**: Recharts

## 📦 Installation

```bash
# Cloner le repository
git clone <repo-url>
cd Eversun

# Installer les dépendances
npm install

# Configuration
cp .env.example .env.local
# Éditer .env.local avec vos variables

# Lancer en mode développement
npm run dev
```

## 🔧 Configuration

Créer un fichier `.env.local` :

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eversun
NEXTAUTH_SECRET=votre_secret_jwt
NEXTAUTH_URL=http://localhost:3000
```

## 📁 Structure du projet

```
app/
├── api/              # API Routes (Next.js)
│   ├── clients/
│   ├── import/
│   └── export/
├── dashboard/        # Page dashboard
├── page.tsx          # Page d'accueil
├── layout.tsx        # Layout racine
└── globals.css       # Styles globaux

components/
├── ClientTable.tsx      # Tableau des clients
├── ClientForm.tsx       # Formulaire client
├── ClientModal.tsx      # Modal détails client
├── ClientSection.tsx    # Section principale
├── Dashboard.tsx        # Layout dashboard
├── DashboardOverview.tsx # Vue d'ensemble
├── ParametersView.tsx    # Paramètres & imports/exports
├── Sidebar.tsx          # Navigation latérale
├── HomeContent.tsx      # Contenu page d'accueil
└── ui/                  # Composants UI réutilisables
    ├── Button.tsx
    ├── Input.tsx
    ├── Modal.tsx
    └── ...

lib/
├── mongo.ts         # Connexion MongoDB
├── clientModel.ts   # Modèle Mongoose Client
├── sectionConfig.ts # Configuration des sections
└── encryption.ts    # Chiffrement des données sensibles

store/
└── useAppStore.ts   # Store Zustand

types/
└── client.ts        # Types TypeScript

public/
└── ...              # Assets statiques
```

## 🎯 Fonctionnalités

### Gestion des dossiers
- **DP En cours** - Déclarations préalables en cours
- **DP Accordés** - Déclarations préalables accordées
- **DP Refusés** - Déclarations préalables refusées
- **DAACT** - Demandes d'achat d'autoconsommation collective
- **Installation** - Installations en cours
- **Consuel** - Certifications Consuel (en cours/finalisé)
- **Raccordement** - Raccordements et mises en service

### Import / Export
- Import CSV/JSON/Excel
- Export CSV/JSON
- Chiffrement des mots de passe

### Tableau de bord
- Statistiques en temps réel
- Graphiques d'activité
- Alertes et priorités

### Responsive Design
- Adapté mobile, tablette, desktop
- Sidebar collapsible
- Grilles adaptatives

## 🛠️ Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Mode développement |
| `npm run build` | Build production |
| `npm start` | Démarrer production |
| `npm run lint` | Linter ESLint |

## 📝 License

Propriétaire - Tous droits réservés
