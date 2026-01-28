# 🏸 Badminton Club Manager

Application web complète pour la gestion d'un club de badminton avec système d'authentification, gestion de joueurs, événements, tournois et actualités.

## 📋 Fonctionnalités

- ✅ **Authentification sécurisée** avec JWT et validation par administrateur
- 👥 **Gestion des joueurs** avec fiches détaillées, statistiques et niveaux (apéro ⭐ + technique ⭐)
- 📅 **Gestion d'événements** avec système d'inscription
- 🏆 **Gestion de tournois** (inspiré de Badminton Scorer)
- 📰 **Fil d'actualités** du club
- 🔒 **Panel d'administration** pour la validation des comptes

## 🚀 Installation rapide avec Docker

### Prérequis

- Docker et Docker Compose installés
- Port 80 et 3001 disponibles

### Installation

1. **Cloner ou télécharger le projet**
```bash
cd badminton-app
```

2. **Créer le fichier .env**
```bash
cp backend/.env.example backend/.env
```

Éditez `backend/.env` et changez le JWT_SECRET :
```env
JWT_SECRET=votre_secret_ultra_securise_changez_moi_123456789
```

3. **Lancer l'application**
```bash
docker-compose up -d
```

4. **Accéder à l'application**
- Frontend : http://localhost
- Backend API : http://localhost:3001

### Première utilisation

1. Créez votre compte administrateur en vous inscrivant
2. Le premier utilisateur devient automatiquement administrateur
3. Les utilisateurs suivants devront être approuvés via l'onglet "Utilisateurs"

## 🌐 Configuration avec DuckDNS et accès externe

### 1. Configurer DuckDNS

1. Créez un compte sur https://www.duckdns.org
2. Créez un sous-domaine (ex: `monclub.duckdns.org`)
3. Notez votre token

### 2. Installer le client DuckDNS

Créez un script de mise à jour :

```bash
# Créer le script
sudo nano /usr/local/bin/duckdns-update.sh
```

Ajoutez :
```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=VOTRE_DOMAINE&token=VOTRE_TOKEN&ip=" | curl -k -o /var/log/duckdns.log -K -
```

Remplacez `VOTRE_DOMAINE` et `VOTRE_TOKEN`.

Rendez-le exécutable :
```bash
sudo chmod +x /usr/local/bin/duckdns-update.sh
```

Ajoutez à cron pour mise à jour automatique :
```bash
crontab -e
```

Ajoutez :
```
*/5 * * * * /usr/local/bin/duckdns-update.sh >/dev/null 2>&1
```

### 3. Configuration du routeur

1. Connectez-vous à votre routeur
2. Configurez le **Port Forwarding** :
   - Port externe : 80 → Port interne : 80 (vers l'IP de votre serveur)
   - Port externe : 443 → Port interne : 443 (pour HTTPS)

### 4. Ajouter HTTPS avec Let's Encrypt (Recommandé)

Installez Certbot :
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

Obtenez un certificat SSL :
```bash
sudo certbot --nginx -d monclub.duckdns.org
```

Suivez les instructions. Certbot configurera automatiquement Nginx pour HTTPS.

### 5. Configuration Nginx pour nom de domaine

Créez `/etc/nginx/sites-available/badminton` :

```nginx
server {
    listen 80;
    server_name monclub.duckdns.org;
    
    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name monclub.duckdns.org;

    # Certificats SSL (configurés par Certbot)
    ssl_certificate /etc/letsencrypt/live/monclub.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/monclub.duckdns.org/privkey.pem;

    # Sécurité SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy vers l'application
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activez le site :
```bash
sudo ln -s /etc/nginx/sites-available/badminton /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 💻 Installation en développement (sans Docker)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Éditez .env avec vos paramètres
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur http://localhost:3000

## 📂 Structure du projet

```
badminton-app/
├── backend/
│   ├── server.js          # Serveur Express
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Application React
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── data/                  # Base de données (créé automatiquement)
└── README.md
```

## 🔒 Sécurité

### Changements importants avant la production

1. **Changez le JWT_SECRET** dans `.env`
2. **Utilisez HTTPS** (Let's Encrypt gratuit)
3. **Configurez un firewall** (UFW recommandé)
4. **Mettez à jour régulièrement** les dépendances

### Configuration firewall (UFW)

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 🔄 Commandes utiles

### Docker

```bash
# Voir les logs
docker-compose logs -f

# Redémarrer l'application
docker-compose restart

# Arrêter l'application
docker-compose down

# Rebuild après modifications
docker-compose up -d --build

# Voir les conteneurs en cours
docker-compose ps
```

### Backup de la base de données

```bash
# Créer un backup
cp data/database.sqlite data/database.backup.$(date +%Y%m%d).sqlite

# Ou automatique quotidien
crontab -e
# Ajoutez :
0 3 * * * cp /chemin/vers/badminton-app/data/database.sqlite /chemin/vers/backup/database.backup.$(date +\%Y\%m\%d).sqlite
```

## 🐛 Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs
docker-compose logs

# Vérifier que les ports sont libres
sudo netstat -tlnp | grep -E ':(80|3001)'
```

### Impossible de se connecter

1. Vérifiez que le port 80 est ouvert sur votre routeur
2. Vérifiez que DuckDNS pointe vers la bonne IP
3. Vérifiez les logs : `docker-compose logs frontend`

### Erreur de base de données

```bash
# Supprimer et recréer la DB (⚠️ perte de données)
rm -rf data/database.sqlite
docker-compose restart backend
```

## 📱 Accès mobile

Une fois configuré avec DuckDNS et HTTPS, vous pouvez accéder à l'application depuis n'importe où :
- Sur mobile : `https://monclub.duckdns.org`
- En local : `https://monclub.duckdns.org` ou `http://localhost`

## 🎯 Prochaines fonctionnalités

- [ ] Upload d'images pour les joueurs
- [ ] Génération automatique de tableaux de tournoi
- [ ] Statistiques avancées
- [ ] Export PDF des résultats
- [ ] Notifications par email
- [ ] Application mobile (PWA)

## 📄 Licence

MIT

## 🤝 Support

Pour toute question ou problème :
1. Vérifiez d'abord la section Dépannage
2. Consultez les logs : `docker-compose logs`
3. Ouvrez une issue sur GitHub

---

**Bon badminton ! 🏸**
