# 🚀 Guide de Démarrage Rapide

## Installation en 3 étapes

### 1️⃣ Télécharger le projet

Téléchargez et décompressez le dossier `badminton-app/`

### 2️⃣ Lancer l'installation

Ouvrez un terminal dans le dossier `badminton-app/` et exécutez :

```bash
./install.sh
```

Le script va :
- ✅ Installer Docker si nécessaire
- ✅ Installer Docker Compose si nécessaire  
- ✅ Créer la configuration
- ✅ Générer un secret JWT sécurisé
- ✅ Lancer l'application

### 3️⃣ Accéder à l'application

Ouvrez votre navigateur et allez sur :
```
http://localhost
```

## 👤 Premier compte

Le premier utilisateur à s'inscrire devient automatiquement **administrateur**.

1. Cliquez sur "Inscription"
2. Remplissez vos informations
3. Vous serez connecté automatiquement

## 📱 Accès depuis l'extérieur avec DuckDNS

### Étape 1 : Créer un compte DuckDNS

1. Allez sur https://www.duckdns.org
2. Connectez-vous (Google, GitHub, etc.)
3. Créez un sous-domaine : `monclub.duckdns.org`
4. Notez votre **token**

### Étape 2 : Configurer la mise à jour automatique de l'IP

Créez le script :
```bash
sudo nano /usr/local/bin/duckdns-update.sh
```

Ajoutez (remplacez DOMAINE et TOKEN) :
```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=VOTRE_DOMAINE&token=VOTRE_TOKEN&ip=" | curl -k -o /var/log/duckdns.log -K -
```

Rendez-le exécutable :
```bash
sudo chmod +x /usr/local/bin/duckdns-update.sh
```

Testez-le :
```bash
/usr/local/bin/duckdns-update.sh
cat /var/log/duckdns.log
```

Vous devriez voir `OK`.

Ajoutez à cron (toutes les 5 minutes) :
```bash
crontab -e
```

Ajoutez cette ligne :
```
*/5 * * * * /usr/local/bin/duckdns-update.sh >/dev/null 2>&1
```

### Étape 3 : Configurer votre box internet

1. Trouvez l'IP locale de votre serveur :
```bash
hostname -I
```

2. Connectez-vous à votre box (généralement 192.168.1.1 ou 192.168.0.1)

3. Allez dans **NAT/PAT** ou **Port Forwarding**

4. Ajoutez ces règles :
   - Port externe `80` → IP serveur port `80` (HTTP)
   - Port externe `443` → IP serveur port `443` (HTTPS)

### Étape 4 : Installer HTTPS (Recommandé)

Installer Nginx et Certbot :
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

Créer la configuration Nginx :
```bash
sudo nano /etc/nginx/sites-available/badminton
```

Ajoutez :
```nginx
server {
    listen 80;
    server_name VOTRE_DOMAINE.duckdns.org;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
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

Installez le certificat SSL :
```bash
sudo certbot --nginx -d VOTRE_DOMAINE.duckdns.org
```

Suivez les instructions de Certbot.

### ✅ C'est fini !

Vous pouvez maintenant accéder à votre application depuis n'importe où :
```
https://monclub.duckdns.org
```

## 🔧 Commandes utiles

### Voir les logs
```bash
docker-compose logs -f
```

### Redémarrer l'application
```bash
docker-compose restart
```

### Arrêter l'application
```bash
docker-compose down
```

### Mettre à jour après modifications
```bash
docker-compose up -d --build
```

### Backup de la base de données
```bash
cp data/database.sqlite data/database.backup.$(date +%Y%m%d).sqlite
```

## 🐛 Problèmes courants

### Port 80 déjà utilisé

Vérifiez ce qui utilise le port :
```bash
sudo lsof -i :80
```

Arrêtez le service ou changez le port dans `docker-compose.yml` :
```yaml
frontend:
  ports:
    - "8080:80"  # Utiliser le port 8080 au lieu de 80
```

### L'application ne démarre pas

```bash
# Voir les logs détaillés
docker-compose logs

# Reconstruire depuis zéro
docker-compose down
docker-compose up -d --build
```

### Impossible d'accéder depuis l'extérieur

1. Vérifiez que DuckDNS a la bonne IP :
   - Allez sur https://www.duckdns.org
   - Vérifiez que l'IP correspond à votre IP publique

2. Vérifiez que le port forwarding est actif :
   ```bash
   # Depuis un autre réseau ou utilisez un site comme
   # https://www.yougetsignal.com/tools/open-ports/
   ```

3. Vérifiez votre firewall :
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

## 📞 Besoin d'aide ?

Consultez le README.md complet pour plus de détails !
