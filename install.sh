#!/bin/bash

echo "🏸 Installation de Badminton Club Manager"
echo "========================================"
echo ""

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Installation..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installé"
fi

# Vérifier Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Installation..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installé"
fi

# Créer le fichier .env
if [ ! -f backend/.env ]; then
    echo "📝 Création du fichier .env..."
    cp backend/.env.example backend/.env
    
    # Générer un secret JWT aléatoire
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i "s/votre_secret_jwt_super_securise_changez_moi/$JWT_SECRET/" backend/.env
    echo "✅ Fichier .env créé avec un JWT_SECRET sécurisé"
fi

# Créer le dossier data
mkdir -p data
chmod 777 data

echo ""
echo "🚀 Lancement de l'application..."
docker-compose up -d --build

echo ""
echo "✅ Installation terminée !"
echo ""
echo "📱 Accès à l'application :"
echo "   - Frontend : http://localhost"
echo "   - Backend API : http://localhost:3001"
echo ""
echo "👤 Première utilisation :"
echo "   1. Ouvrez http://localhost dans votre navigateur"
echo "   2. Créez votre compte (le premier utilisateur = administrateur)"
echo "   3. Commencez à gérer votre club !"
echo ""
echo "📊 Voir les logs : docker-compose logs -f"
echo "🛑 Arrêter : docker-compose down"
echo ""
