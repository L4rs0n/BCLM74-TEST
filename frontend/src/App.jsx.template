import React, { useState, useEffect } from 'react';
import { Camera, Calendar, Trophy, Users, Bell, TrendingUp, Plus, Search, Edit, Trash2, Medal, Award, Target, Activity, LogOut, UserPlus, CheckCircle, XCircle, Shield } from 'lucide-react';

// Utility functions for persistent storage
const storage = {
  async get(key) {
    try {
      const result = await window.storage.get(key);
      return result ? JSON.parse(result.value) : null;
    } catch {
      return null;
    }
  },
  async set(key, value) {
    try {
      await window.storage.set(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  async list(prefix) {
    try {
      const result = await window.storage.list(prefix);
      return result ? result.keys : [];
    } catch {
      return [];
    }
  },
  async delete(key) {
    try {
      await window.storage.delete(key);
      return true;
    } catch {
      return false;
    }
  }
};

// Authentication Component
function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!', { isLogin, formData });
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        console.log('Attempting login...');
        const users = await storage.get('users') || [];
        console.log('Users:', users);
        const user = users.find(u => u.email === formData.email && u.password === formData.password);
        
        if (!user) {
          setError('Email ou mot de passe incorrect');
          setLoading(false);
          return;
        }

        if (user.status === 'pending') {
          setError('Votre compte est en attente de validation par un administrateur');
          setLoading(false);
          return;
        }

        if (user.status === 'rejected') {
          setError('Votre compte a été rejeté. Contactez un administrateur.');
          setLoading(false);
          return;
        }

        console.log('Login successful!', user);
        await storage.set('currentUser', user);
        onLogin(user);
      } else {
        // Register
        console.log('Attempting registration...');
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères');
          setLoading(false);
          return;
        }

        const users = await storage.get('users') || [];
        console.log('Current users:', users);
        
        if (users.find(u => u.email === formData.email)) {
          setError('Cet email est déjà utilisé');
          setLoading(false);
          return;
        }

        const isFirstUser = users.length === 0;
        console.log('Is first user?', isFirstUser);
        
        const newUser = {
          id: Date.now(),
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: isFirstUser ? 'admin' : 'member',
          status: isFirstUser ? 'approved' : 'pending',
          createdAt: new Date().toISOString()
        };

        console.log('New user:', newUser);
        users.push(newUser);
        await storage.set('users', users);
        console.log('User saved!');

        if (isFirstUser) {
          setSuccess('✅ Premier compte créé ! Vous êtes administrateur. Connexion...');
          setTimeout(async () => {
            await storage.set('currentUser', newUser);
            onLogin(newUser);
          }, 1500);
        } else {
          setSuccess('✅ Compte créé ! En attente de validation par un administrateur.');
          setFormData({ email: '', password: '', name: '', confirmPassword: '' });
          setTimeout(() => {
            setIsLogin(true);
            setLoading(false);
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Une erreur est survenue: ' + err.message);
      setLoading(false);
    }
  };

  const resetData = async () => {
    if (confirm('⚠️ Voulez-vous vraiment réinitialiser TOUTES les données ?')) {
      try {
        await storage.delete('users');
        await storage.delete('currentUser');
        await storage.delete('players');
        await storage.delete('events');
        await storage.delete('tournaments');
        await storage.delete('news');
        setSuccess('✅ Données réinitialisées ! Créez un nouveau compte.');
        setFormData({ email: '', password: '', name: '', confirmPassword: '' });
        setIsLogin(false);
      } catch (err) {
        setError('Erreur lors de la réinitialisation');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">BADMINTON CLUB</h1>
          <p className="text-indigo-300 font-semibold">Gestion & Performance</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                isLogin 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                  : 'bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                !isLogin 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                  : 'bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Nom complet</label>
                <input
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Jean Dupont"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Mot de passe</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Confirmer le mot de passe</label>
                <input
                  type="password"
                  required={!isLogin}
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="••••••"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-3 text-green-200 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
            </button>
          </form>

          {!isLogin && (
            <p className="text-xs text-white/60 mt-4 text-center">
              Votre compte devra être validé par un administrateur avant de pouvoir accéder à l'application.
            </p>
          )}
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={resetData}
              className="w-full py-2 text-xs text-red-300 hover:text-red-200 transition-all"
            >
              🔧 Réinitialiser toutes les données
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function BadmintonClubManager() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [players, setPlayers] = useState([]);
  const [events, setEvents] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const savedUser = await storage.get('currentUser');
    if (savedUser && savedUser.status === 'approved') {
      setCurrentUser(savedUser);
      loadAllData();
    } else {
      setLoading(false);
    }
  };

  const handleLogin = async (user) => {
    await storage.set('currentUser', user);
    setCurrentUser(user);
    loadAllData();
  };

  const handleLogout = async () => {
    await storage.delete('currentUser');
    setCurrentUser(null);
  };

  const loadAllData = async () => {
    setLoading(true);
    const [playersData, eventsData, tournamentsData, newsData] = await Promise.all([
      storage.get('players'),
      storage.get('events'),
      storage.get('tournaments'),
      storage.get('news')
    ]);

    setPlayers(playersData || []);
    setEvents(eventsData || []);
    setTournaments(tournamentsData || []);
    setNews(newsData || []);
    setLoading(false);
  };

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">Chargement...</div>
      </div>
    );
  }

  const savePlayers = async (data) => {
    await storage.set('players', data);
    setPlayers(data);
  };

  const saveEvents = async (data) => {
    await storage.set('events', data);
    setEvents(data);
  };

  const saveTournaments = async (data) => {
    await storage.set('tournaments', data);
    setTournaments(data);
  };

  const saveNews = async (data) => {
    await storage.set('news', data);
    setNews(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">BADMINTON CLUB</h1>
                <p className="text-xs text-indigo-300 font-medium">Gestion & Performance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-2">
                <div className="text-sm font-semibold text-white">{currentUser.name}</div>
                <div className="text-xs text-indigo-300 flex items-center gap-1 justify-end">
                  {currentUser.role === 'admin' && (
                    <>
                      <Shield className="w-3 h-3" />
                      <span>Administrateur</span>
                    </>
                  )}
                  {currentUser.role === 'member' && <span>Membre</span>}
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-200 backdrop-blur-sm border border-red-500/20 flex items-center gap-2 font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: Activity },
              { id: 'players', label: 'Joueurs', icon: Users },
              { id: 'events', label: 'Événements', icon: Calendar },
              { id: 'tournaments', label: 'Tournois', icon: Trophy },
              { id: 'news', label: 'Actualités', icon: Bell },
              ...(currentUser.role === 'admin' ? [{ id: 'users', label: 'Utilisateurs', icon: Shield }] : [])
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 whitespace-nowrap font-semibold ${
                  activeView === item.id
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeView === 'dashboard' && <Dashboard players={players} events={events} tournaments={tournaments} news={news} />}
        {activeView === 'players' && <PlayersView players={players} savePlayers={savePlayers} />}
        {activeView === 'events' && <EventsView events={events} saveEvents={saveEvents} players={players} />}
        {activeView === 'tournaments' && <TournamentsView tournaments={tournaments} saveTournaments={saveTournaments} players={players} />}
        {activeView === 'news' && <NewsView news={news} saveNews={saveNews} currentUser={currentUser} />}
        {activeView === 'users' && currentUser.role === 'admin' && <UsersView />}
      </main>
    </div>
  );
}

// Dashboard Component
function Dashboard({ players, events, tournaments, news }) {
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).slice(0, 3);
  const recentNews = news.slice(0, 3);
  const activeTournaments = tournaments.filter(t => t.status === 'En cours').slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Joueurs actifs" value={players.length} color="from-blue-500 to-cyan-500" />
        <StatCard icon={Calendar} label="Événements à venir" value={upcomingEvents.length} color="from-purple-500 to-pink-500" />
        <StatCard icon={Trophy} label="Tournois actifs" value={activeTournaments.length} color="from-yellow-400 to-orange-500" />
        <StatCard icon={Bell} label="Actualités" value={news.length} color="from-green-500 to-emerald-500" />
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-yellow-400" />
            Prochains événements
          </h2>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? upcomingEvents.map((event, idx) => (
              <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h3 className="font-semibold text-white">{event.name}</h3>
                <p className="text-sm text-indigo-300 mt-1">{new Date(event.date).toLocaleDateString('fr-FR')}</p>
                <p className="text-xs text-white/60 mt-1">{event.participants?.length || 0} inscrits</p>
              </div>
            )) : (
              <p className="text-white/60 text-sm">Aucun événement à venir</p>
            )}
          </div>
        </div>

        {/* Recent News */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-6 h-6 text-yellow-400" />
            Actualités récentes
          </h2>
          <div className="space-y-3">
            {recentNews.length > 0 ? recentNews.map((item, idx) => (
              <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-white/60 mt-1">{new Date(item.date).toLocaleDateString('fr-FR')}</p>
              </div>
            )) : (
              <p className="text-white/60 text-sm">Aucune actualité</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:scale-105 transition-transform duration-200">
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      <div className="text-sm text-indigo-300 font-medium">{label}</div>
    </div>
  );
}

// Players View Component
function PlayersView({ players, savePlayers }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addPlayer = (player) => {
    savePlayers([...players, { ...player, id: Date.now() }]);
    setShowAddModal(false);
  };

  const updatePlayer = (updatedPlayer) => {
    savePlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    setEditingPlayer(null);
  };

  const deletePlayer = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
      savePlayers(players.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white">Gestion des joueurs</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-2xl transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Ajouter un joueur
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
        <input
          type="text"
          placeholder="Rechercher un joueur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers.map(player => (
          <PlayerCard 
            key={player.id} 
            player={player} 
            onEdit={setEditingPlayer}
            onDelete={deletePlayer}
          />
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/60">Aucun joueur trouvé</p>
        </div>
      )}

      {/* Modals */}
      {showAddModal && <PlayerModal onSave={addPlayer} onClose={() => setShowAddModal(false)} />}
      {editingPlayer && <PlayerModal player={editingPlayer} onSave={updatePlayer} onClose={() => setEditingPlayer(null)} />}
    </div>
  );
}

function PlayerCard({ player, onEdit, onDelete }) {
  const [showDetails, setShowDetails] = useState(false);

  const StarDisplay = ({ rating, color = 'yellow' }) => {
    const fillColor = color === 'yellow' ? 'fill-yellow-400 text-yellow-400' : 
                      color === 'orange' ? 'fill-orange-400 text-orange-400' : 
                      'fill-blue-400 text-blue-400';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? fillColor : 'fill-gray-600 text-gray-600'
            }`}
            stroke="currentColor"
            strokeWidth="1"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden hover:scale-105 transition-all duration-200 cursor-pointer"
           onClick={() => setShowDetails(true)}>
        {/* Avatar */}
        <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative">
          {player.avatar ? (
            <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-6xl font-black text-white">{player.name.charAt(0)}</div>
          )}
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-white mb-1">{player.name}</h3>
          <p className="text-sm text-indigo-300 mb-3">{player.email}</p>
          
          {/* Dual Star Ratings */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">🍺 Apéro</span>
              <div className="flex items-center gap-2">
                <StarDisplay rating={typeof player.level === 'number' ? player.level : 0} color="orange" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">🏸 Technique</span>
              <div className="flex items-center gap-2">
                <StarDisplay rating={player.rating || 0} color="yellow" />
              </div>
            </div>
          </div>
          
          {/* Stats Preview */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/5 p-2 rounded-lg text-center">
              <div className="text-lg font-bold text-white">{player.stats?.matchesPlayed || 0}</div>
              <div className="text-xs text-white/60">Matchs</div>
            </div>
            <div className="bg-white/5 p-2 rounded-lg text-center">
              <div className="text-lg font-bold text-green-400">{player.stats?.wins || 0}</div>
              <div className="text-xs text-white/60">Victoires</div>
            </div>
            <div className="bg-white/5 p-2 rounded-lg text-center">
              <div className="text-lg font-bold text-yellow-400">{player.stats?.winRate || 0}%</div>
              <div className="text-xs text-white/60">Ratio</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(player); }}
              className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(player.id); }}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed View Modal */}
      {showDetails && (
        <PlayerDetailsModal player={player} onClose={() => setShowDetails(false)} />
      )}
    </>
  );
}

function PlayerModal({ player, onSave, onClose }) {
  const [formData, setFormData] = useState(player || {
    name: '',
    email: '',
    phone: '',
    level: '',
    rating: 0,
    avatar: '',
    stats: { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0 }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const StarRating = ({ rating, onRatingChange }) => {
    const [hover, setHover] = useState(0);

    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-all duration-200 transform hover:scale-110"
          >
            <svg
              className={`w-10 h-10 ${
                star <= (hover || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-600 text-gray-600'
              }`}
              stroke="currentColor"
              strokeWidth="1"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
        <span className="ml-3 text-white font-semibold self-center">
          {rating > 0 ? `${rating} étoile${rating > 1 ? 's' : ''}` : 'Non évalué'}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl p-8 max-w-2xl w-full border border-white/20 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-6">{player ? 'Modifier' : 'Ajouter'} un joueur</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Nom complet</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Téléphone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-3">🍺 Niveau d'apéro</label>
            <StarRating 
              rating={formData.level || 0} 
              onRatingChange={(level) => setFormData({...formData, level})}
            />
            <p className="text-xs text-white/50 mt-2">
              1⭐ = Petit verre • 5⭐ = Légende de l'apéro !
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-3">🏸 Niveau technique</label>
            <StarRating 
              rating={formData.rating || 0} 
              onRatingChange={(rating) => setFormData({...formData, rating})}
            />
            <p className="text-xs text-white/50 mt-2">
              Niveau de jeu au badminton (1⭐ = Débutant • 5⭐ = Expert)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">URL de l'avatar (optionnel)</label>
            <input
              type="url"
              value={formData.avatar}
              onChange={e => setFormData({...formData, avatar: e.target.value})}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Matchs joués</label>
              <input
                type="number"
                min="0"
                value={formData.stats?.matchesPlayed || 0}
                onChange={e => setFormData({...formData, stats: {...formData.stats, matchesPlayed: parseInt(e.target.value) || 0}})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Victoires</label>
              <input
                type="number"
                min="0"
                value={formData.stats?.wins || 0}
                onChange={e => {
                  const wins = parseInt(e.target.value) || 0;
                  const matches = formData.stats?.matchesPlayed || 0;
                  const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
                  setFormData({...formData, stats: {...formData.stats, wins, losses: matches - wins, winRate}});
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-2xl transition-all duration-200"
            >
              {player ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlayerDetailsModal({ player, onClose }) {
  const StarDisplay = ({ rating, size = 'normal', color = 'yellow' }) => {
    const sizeClass = size === 'large' ? 'w-8 h-8' : 'w-5 h-5';
    const fillColor = color === 'yellow' ? 'fill-yellow-400 text-yellow-400' : 
                      color === 'orange' ? 'fill-orange-400 text-orange-400' : 
                      'fill-blue-400 text-blue-400';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClass} ${
              star <= rating ? fillColor : 'fill-gray-600 text-gray-600'
            }`}
            stroke="currentColor"
            strokeWidth="1"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full border border-white/20 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header with Avatar */}
        <div className="relative h-64 bg-gradient-to-br from-indigo-500 to-purple-600">
          {player.avatar ? (
            <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-9xl font-black text-white/30">{player.name.charAt(0)}</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="p-8 -mt-16 relative">
          {/* Player Info Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
            <h2 className="text-4xl font-black text-white mb-2">{player.name}</h2>
            <p className="text-indigo-300 mb-3">{player.email}</p>
            {player.phone && <p className="text-white/70 mb-3">📱 {player.phone}</p>}
            
            {/* Dual Star Rating Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <div className="text-sm text-white/60 mb-2">🍺 Niveau d'apéro</div>
                <div className="flex items-center gap-3">
                  <StarDisplay rating={typeof player.level === 'number' ? player.level : 0} size="large" color="orange" />
                  <span className="text-white font-semibold">
                    {(typeof player.level === 'number' && player.level > 0) ? `${player.level}/5 étoiles` : 'Non évalué'}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-white/60 mb-2">🏸 Niveau technique</div>
                <div className="flex items-center gap-3">
                  <StarDisplay rating={player.rating || 0} size="large" color="yellow" />
                  <span className="text-white font-semibold">
                    {player.rating > 0 ? `${player.rating}/5 étoiles` : 'Non évalué'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-yellow-400" />
            Statistiques
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatBox label="Matchs joués" value={player.stats?.matchesPlayed || 0} icon={Activity} color="blue" />
            <StatBox label="Victoires" value={player.stats?.wins || 0} icon={Trophy} color="green" />
            <StatBox label="Défaites" value={player.stats?.losses || 0} icon={Target} color="red" />
            <StatBox label="Ratio victoires" value={`${player.stats?.winRate || 0}%`} icon={Award} color="yellow" />
          </div>

          {/* Performance Chart Placeholder */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Évolution des performances</h3>
            <div className="h-48 flex items-center justify-center text-white/50">
              Graphique de performances (à venir)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon: Icon, color }) {
  const colors = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    red: 'from-red-500 to-pink-500',
    yellow: 'from-yellow-400 to-orange-500'
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <div className={`w-10 h-10 bg-gradient-to-br ${colors[color]} rounded-lg flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-black text-white mb-1">{value}</div>
      <div className="text-xs text-white/60">{label}</div>
    </div>
  );
}

// Events View Component
function EventsView({ events, saveEvents, players }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const addEvent = (event) => {
    saveEvents([...events, { ...event, id: Date.now(), participants: [] }]);
    setShowAddModal(false);
  };

  const updateEvent = (updatedEvent) => {
    saveEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  const deleteEvent = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      saveEvents(events.filter(e => e.id !== id));
    }
  };

  const registerPlayer = (eventId, playerId) => {
    const event = events.find(e => e.id === eventId);
    if (!event.participants.includes(playerId)) {
      updateEvent({ ...event, participants: [...event.participants, playerId] });
    }
  };

  const unregisterPlayer = (eventId, playerId) => {
    const event = events.find(e => e.id === eventId);
    updateEvent({ ...event, participants: event.participants.filter(id => id !== playerId) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white">Gestion des événements</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-2xl transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Créer un événement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{event.name}</h3>
                <p className="text-sm text-indigo-300">{new Date(event.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <Calendar className="w-6 h-6 text-yellow-400" />
            </div>

            <p className="text-white/70 mb-4 text-sm">{event.description}</p>

            <div className="bg-white/5 p-3 rounded-lg mb-4">
              <div className="text-sm text-white/60 mb-1">Participants inscrits</div>
              <div className="text-2xl font-bold text-white">{event.participants?.length || 0} / {event.maxParticipants || '∞'}</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedEvent(event)}
                className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all duration-200 font-semibold"
              >
                Gérer inscriptions
              </button>
              <button
                onClick={() => deleteEvent(event.id)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/60">Aucun événement créé</p>
        </div>
      )}

      {showAddModal && <EventModal onSave={addEvent} onClose={() => setShowAddModal(false)} />}
      {selectedEvent && (
        <EventRegistrationModal
          event={selectedEvent}
          players={players}
          onRegister={registerPlayer}
          onUnregister={unregisterPlayer}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

function EventModal({ onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    location: '',
    maxParticipants: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl p-8 max-w-2xl w-full border border-white/20" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-6">Créer un événement</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Nom de l'événement</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Participants max (optionnel)</label>
              <input
                type="number"
                min="1"
                value={formData.maxParticipants}
                onChange={e => setFormData({...formData, maxParticipants: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Lieu</label>
            <input
              type="text"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows="3"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-2xl transition-all duration-200"
            >
              Créer l'événement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EventRegistrationModal({ event, players, onRegister, onUnregister, onClose }) {
  const registeredPlayers = players.filter(p => event.participants?.includes(p.id));
  const availablePlayers = players.filter(p => !event.participants?.includes(p.id));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl p-8 max-w-4xl w-full border border-white/20 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-2">{event.name}</h2>
        <p className="text-indigo-300 mb-6">{new Date(event.date).toLocaleDateString('fr-FR')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Registered Players */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Inscrits ({registeredPlayers.length})</h3>
            <div className="space-y-2">
              {registeredPlayers.map(player => (
                <div key={player.id} className="bg-white/10 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{player.name}</div>
                    <div className="text-sm text-indigo-300">{player.level || 'N/A'}</div>
                  </div>
                  <button
                    onClick={() => onUnregister(event.id, player.id)}
                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all text-sm font-semibold"
                  >
                    Retirer
                  </button>
                </div>
              ))}
              {registeredPlayers.length === 0 && (
                <p className="text-white/60 text-sm">Aucun participant inscrit</p>
              )}
            </div>
          </div>

          {/* Available Players */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Disponibles ({availablePlayers.length})</h3>
            <div className="space-y-2">
              {availablePlayers.map(player => (
                <div key={player.id} className="bg-white/10 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{player.name}</div>
                    <div className="text-sm text-indigo-300">{player.level || 'N/A'}</div>
                  </div>
                  <button
                    onClick={() => onRegister(event.id, player.id)}
                    className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-all text-sm font-semibold"
                  >
                    Inscrire
                  </button>
                </div>
              ))}
              {availablePlayers.length === 0 && (
                <p className="text-white/60 text-sm">Tous les joueurs sont inscrits</p>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-2xl transition-all duration-200"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

// Tournaments View Component
function TournamentsView({ tournaments, saveTournaments, players }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);

  const addTournament = (tournament) => {
    saveTournaments([...tournaments, { 
      ...tournament, 
      id: Date.now(), 
      participants: [],
      matches: [],
      status: 'À venir'
    }]);
    setShowAddModal(false);
  };

  const deleteTournament = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce tournoi ?')) {
      saveTournaments(tournaments.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white">Gestion des tournois</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-2xl transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Créer un tournoi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map(tournament => (
          <div key={tournament.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{tournament.name}</h3>
                <p className="text-sm text-indigo-300">{tournament.format}</p>
              </div>
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Statut:</span>
                <span className={`px-3 py-1 rounded-full font-semibold ${
                  tournament.status === 'En cours' ? 'bg-green-500/20 text-green-300' :
                  tournament.status === 'Terminé' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {tournament.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Date:</span>
                <span className="text-white">{new Date(tournament.date).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Participants:</span>
                <span className="text-white font-bold">{tournament.participants?.length || 0}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTournament(tournament)}
                className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all duration-200 font-semibold"
              >
                Gérer le tournoi
              </button>
              <button
                onClick={() => deleteTournament(tournament.id)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tournaments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/60">Aucun tournoi créé</p>
        </div>
      )}

      {showAddModal && <TournamentModal onSave={addTournament} onClose={() => setShowAddModal(false)} />}
      {selectedTournament && (
        <TournamentDetailsModal
          tournament={selectedTournament}
          players={players}
          onClose={() => setSelectedTournament(null)}
          onUpdate={(updated) => {
            saveTournaments(tournaments.map(t => t.id === updated.id ? updated : t));
            setSelectedTournament(updated);
          }}
        />
      )}
    </div>
  );
}

function TournamentModal({ onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    format: 'Simple élimination',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl p-8 max-w-2xl w-full border border-white/20" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-6">Créer un tournoi</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Nom du tournoi</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Format</label>
              <select
                value={formData.format}
                onChange={e => setFormData({...formData, format: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="Simple élimination">Simple élimination</option>
                <option value="Double élimination">Double élimination</option>
                <option value="Poules + élimination">Poules + élimination</option>
                <option value="Round-robin">Round-robin (tous contre tous)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows="3"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-2xl transition-all duration-200"
            >
              Créer le tournoi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TournamentDetailsModal({ tournament, players, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('participants');

  const registeredPlayers = players.filter(p => tournament.participants?.includes(p.id));
  const availablePlayers = players.filter(p => !tournament.participants?.includes(p.id));

  const registerPlayer = (playerId) => {
    onUpdate({ ...tournament, participants: [...tournament.participants, playerId] });
  };

  const unregisterPlayer = (playerId) => {
    onUpdate({ ...tournament, participants: tournament.participants.filter(id => id !== playerId) });
  };

  const startTournament = () => {
    onUpdate({ ...tournament, status: 'En cours' });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl max-w-6xl w-full border border-white/20 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-black mb-2">{tournament.name}</h2>
              <p className="text-black/70 font-semibold">{tournament.format}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-black/20 hover:bg-black/30 rounded-full flex items-center justify-center text-black transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10">
          <div className="flex gap-1 px-8 pt-6">
            {[
              { id: 'participants', label: 'Participants' },
              { id: 'bracket', label: 'Tableau' },
              { id: 'matches', label: 'Matchs' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-t-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white border-t border-x border-white/20'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'participants' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Inscrits ({registeredPlayers.length})</h3>
                  {tournament.status === 'À venir' && registeredPlayers.length >= 2 && (
                    <button
                      onClick={startTournament}
                      className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-all font-semibold"
                    >
                      Démarrer le tournoi
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {registeredPlayers.map(player => (
                    <div key={player.id} className="bg-white/10 p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{player.name}</div>
                        <div className="text-sm text-indigo-300">{player.level || 'N/A'}</div>
                      </div>
                      {tournament.status === 'À venir' && (
                        <button
                          onClick={() => unregisterPlayer(player.id)}
                          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all text-sm font-semibold"
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {tournament.status === 'À venir' && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Disponibles ({availablePlayers.length})</h3>
                  <div className="space-y-2">
                    {availablePlayers.map(player => (
                      <div key={player.id} className="bg-white/10 p-4 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">{player.name}</div>
                          <div className="text-sm text-indigo-300">{player.level || 'N/A'}</div>
                        </div>
                        <button
                          onClick={() => registerPlayer(player.id)}
                          className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-all text-sm font-semibold"
                        >
                          Inscrire
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bracket' && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <p className="text-white/60 mb-2">Tableau de tournoi</p>
              <p className="text-white/40 text-sm">Le tableau sera généré automatiquement lors du démarrage du tournoi</p>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="text-center py-12">
              <Medal className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <p className="text-white/60 mb-2">Gestion des matchs</p>
              <p className="text-white/40 text-sm">Inspiré de Badminton Scorer - Scores, sets, et statistiques en temps réel</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// News View Component
function NewsView({ news, saveNews, currentUser }) {
  const [showAddModal, setShowAddModal] = useState(false);

  const addNews = (newsItem) => {
    saveNews([{ ...newsItem, id: Date.now(), date: new Date().toISOString() }, ...news]);
    setShowAddModal(false);
  };

  const deleteNews = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
      saveNews(news.filter(n => n.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white">Fil d'actualités</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-2xl transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Publier une actualité
        </button>
      </div>

      <div className="space-y-4">
        {news.map(item => (
          <div key={item.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:scale-[1.02] transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-indigo-300 mb-4">{new Date(item.date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              <button
                onClick={() => deleteNews(item.id)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{item.content}</p>
            
            {item.image && (
              <img src={item.image} alt={item.title} className="mt-4 rounded-xl w-full max-h-96 object-cover" />
            )}
          </div>
        ))}
      </div>

      {news.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/60">Aucune actualité publiée</p>
        </div>
      )}

      {showAddModal && <NewsModal onSave={addNews} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function NewsModal({ onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl p-8 max-w-2xl w-full border border-white/20" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-6">Publier une actualité</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Titre</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Contenu</label>
            <textarea
              required
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              rows="6"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">URL de l'image (optionnel)</label>
            <input
              type="url"
              value={formData.image}
              onChange={e => setFormData({...formData, image: e.target.value})}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-2xl transition-all duration-200"
            >
              Publier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// Users Management View (Admin only)
function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const usersData = await storage.get('users') || [];
    setUsers(usersData);
    setLoading(false);
  };

  const approveUser = async (userId) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, status: 'approved' } : u
    );
    await storage.set('users', updatedUsers);
    setUsers(updatedUsers);
  };

  const rejectUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir rejeter cet utilisateur ?')) return;
    
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, status: 'rejected' } : u
    );
    await storage.set('users', updatedUsers);
    setUsers(updatedUsers);
  };

  const deleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?')) return;
    
    const updatedUsers = users.filter(u => u.id !== userId);
    await storage.set('users', updatedUsers);
    setUsers(updatedUsers);
  };

  const toggleAdmin = async (userId) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, role: u.role === 'admin' ? 'member' : 'admin' } : u
    );
    await storage.set('users', updatedUsers);
    setUsers(updatedUsers);
  };

  const pendingUsers = users.filter(u => u.status === 'pending');
  const approvedUsers = users.filter(u => u.status === 'approved');
  const rejectedUsers = users.filter(u => u.status === 'rejected');

  if (loading) {
    return <div className="text-white text-center py-12">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white">Gestion des utilisateurs</h2>
        <div className="flex items-center gap-2 text-sm">
          <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 font-semibold">
            {pendingUsers.length} en attente
          </div>
          <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 font-semibold">
            {approvedUsers.length} approuvés
          </div>
        </div>
      </div>

      {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <div className="bg-yellow-500/10 backdrop-blur-md rounded-2xl p-6 border border-yellow-500/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-yellow-400" />
            Demandes en attente ({pendingUsers.length})
          </h3>
          <div className="space-y-3">
            {pendingUsers.map(user => (
              <div key={user.id} className="bg-white/10 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-lg">{user.name}</div>
                  <div className="text-sm text-indigo-300">{user.email}</div>
                  <div className="text-xs text-white/60 mt-1">
                    Demande envoyée le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveUser(user.id)}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-all font-semibold flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </button>
                  <button
                    onClick={() => rejectUser(user.id)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all font-semibold flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Users */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-green-400" />
          Utilisateurs approuvés ({approvedUsers.length})
        </h3>
        <div className="space-y-3">
          {approvedUsers.map(user => (
            <div key={user.id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="font-bold text-white text-lg">{user.name}</div>
                  {user.role === 'admin' && (
                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-xs font-bold flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>
                <div className="text-sm text-indigo-300">{user.email}</div>
                <div className="text-xs text-white/60 mt-1">
                  Membre depuis le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAdmin(user.id)}
                  className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                    user.role === 'admin'
                      ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300'
                      : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
                  }`}
                >
                  {user.role === 'admin' ? 'Retirer admin' : 'Promouvoir admin'}
                </button>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {approvedUsers.length === 0 && (
            <p className="text-white/60 text-center py-4">Aucun utilisateur approuvé</p>
          )}
        </div>
      </div>

      {/* Rejected Users */}
      {rejectedUsers.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <XCircle className="w-6 h-6 text-red-400" />
            Utilisateurs rejetés ({rejectedUsers.length})
          </h3>
          <div className="space-y-3">
            {rejectedUsers.map(user => (
              <div key={user.id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-lg">{user.name}</div>
                  <div className="text-sm text-indigo-300">{user.email}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveUser(user.id)}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-all font-semibold"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/60">Aucun utilisateur enregistré</p>
        </div>
      )}
    </div>
  );
}
