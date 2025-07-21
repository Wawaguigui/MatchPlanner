import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';

// Contexte pour la gestion des données locales
const LocalDataContext = createContext(null);

// Fournisseur de données locales
const LocalDataProvider = ({ children }) => {
  const [players, setPlayers] = useState(() => {
    // Initialiser les joueurs depuis localStorage ou avec des données par défaut
    const savedPlayers = localStorage.getItem('matchplanner_players');
    if (savedPlayers) {
      return JSON.parse(savedPlayers);
    }
    // Données par défaut pour le "Groupe Test"
    return [
      { id: 'p1', name: 'Alice', level: 8, groupId: 'g1' },
      { id: 'p2', name: 'Bob', level: 5, groupId: 'g1' },
      { id: 'p3', name: 'Charlie', level: 7, groupId: 'g1' },
      { id: 'p4', name: 'Diana', level: 4, groupId: 'g1' },
      { id: 'p5', name: 'Eve', level: 9, groupId: 'g1' },
      { id: 'p6', name: 'Frank', level: 6, groupId: 'g1' },
      { id: 'p7', name: 'Grace', level: 3, groupId: 'g1' },
      { id: 'p8', name: 'Heidi', level: 7, groupId: 'g1' },
      { id: 'p9', name: 'Ivan', level: 6, groupId: 'g1' },
      { id: 'p10', name: 'Julia', level: 8, groupId: 'g1' },
      { id: 'p11', name: 'Kevin', level: 5, groupId: 'g1' },
      { id: 'p12', name: 'Laura', level: 7, groupId: 'g1' },
      { id: 'p13', name: 'Mike', level: 4, groupId: 'g1' },
      { id: 'p14', name: 'Nora', level: 9, groupId: 'g1' },
      { id: 'p15', name: 'Oscar', level: 6, groupId: 'g1' },
    ];
  });

  const [playerGroups, setPlayerGroups] = useState(() => {
    // Initialiser les groupes depuis localStorage ou avec des données par défaut
    const savedGroups = localStorage.getItem('matchplanner_playerGroups');
    if (savedGroups) {
      return JSON.parse(savedGroups);
    }
    // Données par défaut pour le "Groupe Test"
    return [{ id: 'g1', name: 'Groupe Test' }];
  });

  const [tournaments, setTournaments] = useState(() => {
    const savedTournaments = localStorage.getItem('matchplanner_tournaments');
    return savedTournaments ? JSON.parse(savedTournaments) : [];
  });

  // Pour les matchs, nous les stockerons par tournoiId pour une meilleure organisation
  const [allMatches, setAllMatches] = useState(() => {
    const savedMatches = localStorage.getItem('matchplanner_allMatches');
    return savedMatches ? JSON.parse(savedMatches) : {}; // { tournamentId: [match1, match2, ...] }
  });

  // Nouveau état pour stocker les plannings générés par tournoi
  const [generatedSchedules, setGeneratedSchedules] = useState(() => {
    const savedSchedules = localStorage.getItem('matchplanner_generatedSchedules');
    return savedSchedules ? JSON.parse(savedSchedules) : {};
  });

  // Simuler un userId pour le stockage local
  // eslint-disable-next-line no-unused-vars
  const userId = 'local-user-id'; // This userId is used internally for data paths, not directly displayed.

  // Sauvegarder les données dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('matchplanner_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('matchplanner_playerGroups', JSON.stringify(playerGroups));
  }, [playerGroups]);

  useEffect(() => {
    localStorage.setItem('matchplanner_tournaments', JSON.stringify(tournaments));
  }, [tournaments]);

  useEffect(() => {
    localStorage.setItem('matchplanner_allMatches', JSON.stringify(allMatches));
  }, [allMatches]);

  useEffect(() => {
    localStorage.setItem('matchplanner_generatedSchedules', JSON.stringify(generatedSchedules));
  }, [generatedSchedules]);

  // Memoize shuffleArray to prevent it from changing on every render
  const shuffleArray = useCallback((array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }, []); // Empty dependency array means it's created once

  // Fonctions de simulation des opérations Firestore
  const addPlayer = (playerData) => {
    const newPlayer = { id: crypto.randomUUID(), ...playerData, createdAt: new Date().toISOString() };
    setPlayers(prev => [...prev, newPlayer]);
    return newPlayer;
  };

  const deletePlayer = (playerId) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const updatePlayer = (playerId, newData) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, ...newData } : p));
  };

  const addGroup = (groupData) => {
    const newGroup = { id: crypto.randomUUID(), ...groupData, createdAt: new Date().toISOString() };
    setPlayerGroups(prev => [...prev, newGroup]);
    return newGroup;
  };

  const deleteGroup = (groupId) => {
    setPlayerGroups(prev => prev.filter(g => g.id !== groupId));
    // Dissocier les joueurs du groupe supprimé
    setPlayers(prev => prev.map(p => p.groupId === groupId ? { ...p, groupId: null } : p));
  };

  const addTournament = (tournamentData) => {
    const newTournament = { id: crypto.randomUUID(), ...tournamentData, createdAt: new Date().toISOString() };
    setTournaments(prev => [...prev, newTournament]);
    return newTournament;
  };

  const updateTournament = (tournamentId, newData) => {
    setTournaments(prev => prev.map(t => t.id === tournamentId ? { ...t, ...newData, updatedAt: new Date().toISOString() } : t));
  };

  const deleteTournament = (tournamentId) => {
    setTournaments(prev => prev.filter(t => t.id !== tournamentId));
    setAllMatches(prev => {
      const newAllMatches = { ...prev };
      delete newAllMatches[tournamentId];
      return newAllMatches;
    });
    setGeneratedSchedules(prev => {
      const newSchedules = { ...prev };
      delete newSchedules[tournamentId];
      return newSchedules;
    });
  };

  // eslint-disable-next-line no-unused-vars
  const getTournamentById = (tournamentId) => {
    return tournaments.find(t => t.id === tournamentId);
  };

  const getMatchesForTournament = (tournamentId) => {
    return allMatches[tournamentId] || [];
  };

  const saveMatchesForTournament = (tournamentId, matchesData) => {
    setAllMatches(prev => ({
      ...prev,
      [tournamentId]: matchesData
    }));
  };

  const updateMatchScore = (tournamentId, matchId, team, score) => {
    setAllMatches(prev => {
      const tournamentMatches = [...(prev[tournamentId] || [])];
      const matchIndex = tournamentMatches.findIndex(m => m.id === matchId);
      if (matchIndex > -1) {
        const updatedMatch = { ...tournamentMatches[matchIndex] };
        if (team === 'team1') {
          updatedMatch.scoreTeam1 = score;
        } else {
          updatedMatch.scoreTeam2 = score;
        }
        updatedMatch.timestamp = new Date().toISOString(); // Update timestamp
        tournamentMatches[matchIndex] = updatedMatch;
      }
      return {
        ...prev,
        [tournamentId]: tournamentMatches
      };
    });
  };

  const getGeneratedSchedule = (tournamentId) => {
    return generatedSchedules[tournamentId] || [];
  };

  const saveGeneratedSchedule = (tournamentId, scheduleData) => {
    setGeneratedSchedules(prev => ({
      ...prev,
      [tournamentId]: scheduleData
    }));
  };


  return (
    <LocalDataContext.Provider
      value={{
        players, setPlayers, addPlayer, deletePlayer, updatePlayer,
        playerGroups, setPlayerGroups, addGroup, deleteGroup,
        tournaments, setTournaments, addTournament, updateTournament, deleteTournament, getTournamentById,
        allMatches, getMatchesForTournament, saveMatchesForTournament, updateMatchScore,
        generatedSchedules, getGeneratedSchedule, saveGeneratedSchedule, // Add schedule functions
        userId, // Simulé
        isAuthReady: true, // Toujours prêt en mode local
        shuffleArray // Provide shuffleArray via context
      }}
    >
      {children}
    </LocalDataContext.Provider>
  );
};

// Hook personnalisé pour utiliser les données locales
const useLocalData = () => useContext(LocalDataContext);

// Composant de la page d'accueil
const HomePage = ({ onNavigate }) => {
  // userId is not directly used in the HomePage's render, so it's removed from destructuring.

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 sm:p-8 flex flex-col items-center justify-center font-inter">
      <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 sm:p-10 max-w-2xl w-full text-center border border-white border-opacity-30">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-shadow-lg">MatchPlanner</h1>
        <p className="text-lg sm:text-xl mb-8 opacity-90">Votre solution ultime pour organiser des rencontres sportives personnalisées !</p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          <FeatureButton
            icon="👥"
            title="Gérez vos joueurs" /* Renamed */
            onClick={() => onNavigate('playerManagement')}
          />
          <p className="text-lg font-bold flex items-center justify-center">Puis</p> {/* Added text */}
          <FeatureButton
            icon="➕"
            title="Créer une rencontre"
            onClick={() => onNavigate('tournamentSetup')}
          />
          <FeatureButton
            icon="🗓️"
            title="Mes Rencontres"
            onClick={() => onNavigate('manageTournaments')}
          />
          <FeatureButton
            icon="📜"
            title="Résultats & Historique"
            onClick={() => onNavigate('results')}
          />
        </div>
      </div>
    </div>
  );
};

const FeatureButton = ({ icon, title, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 flex flex-col items-center justify-center min-w-[180px] min-h-[120px] text-center"
  >
    <span className="text-4xl mb-2">{icon}</span>
    <span>{title}</span>
  </button>
);

// Nouveau composant pour les champs numériques avec boutons d'incrémentation/décrémentation
const NumberInputWithControls = ({ label, value, onChange, min, max, placeholder, id, readOnly = false }) => {
  const handleIncrement = () => {
    if (readOnly) return;
    const numValue = parseInt(value || 0);
    if (isNaN(numValue)) return;
    const newValue = numValue + 1;
    if (max === undefined || newValue <= max) {
      onChange(String(newValue));
    }
  };

  const handleDecrement = () => {
    if (readOnly) return;
    const numValue = parseInt(value || 0);
    if (isNaN(numValue)) return;
    const newValue = numValue - 1;
    if (min === undefined || newValue >= min) {
      onChange(String(newValue));
    }
  };

  return (
    <div className="w-full"> {/* Added w-full here for alignment */}
      <label htmlFor={id} className="block text-lg font-medium mb-1">{label}</label>
      <div className="flex items-center bg-white bg-opacity-30 rounded-lg border border-white border-opacity-40 focus-within:ring-2 focus-within:ring-white">
        <button
          type="button"
          onClick={handleDecrement}
          className="py-2 px-5 rounded-l-lg bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xl transition duration-300 focus:outline-none focus:ring-2 focus:ring-white" /* px-5 for wider buttons */
          disabled={readOnly || (min !== undefined && parseInt(value || 0) <= min)}
        >
          -
        </button>
        <input
          type="number"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          className="flex-grow py-2 text-center bg-transparent text-white placeholder-gray-200 focus:outline-none custom-number-input" /* py-2 for vertical alignment */
          placeholder={placeholder}
          readOnly={readOnly} // Ajout de la propriété readOnly
        />
        <button
          type="button"
          onClick={handleIncrement}
          className="py-2 px-5 rounded-r-lg bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xl transition duration-300 focus:outline-none focus:ring-2 focus:ring-white" /* px-5 for wider buttons */
          disabled={readOnly || (max !== undefined && parseInt(value || 0) >= max)}
        >
          +
        </button>
      </div>
    </div>
  );
};

// Nouveau composant pour la sélection des joueurs dans une modale
const PlayerSelectionModal = ({
  allPlayers, // Tous les joueurs disponibles
  selectedGroupId, // L'ID du groupe actuellement sélectionné dans TournamentSetup
  initialSelectedPlayerIds, // IDs des joueurs déjà sélectionnés pour cette rencontre
  onSave, // Callback pour sauvegarder les IDs des joueurs sélectionnés
  onClose // Callback pour fermer la modale
}) => {
  const { playerGroups } = useLocalData();

  // Filtrer les joueurs en fonction du groupe sélectionné
  const playersInScope = selectedGroupId
    ? allPlayers.filter(p => p.groupId === selectedGroupId)
    : allPlayers; // Si aucun groupe sélectionné, afficher tous les joueurs

  const [currentSelection, setCurrentSelection] = useState(initialSelectedPlayerIds);
  // eslint-disable-next-line no-unused-vars
  const [message, setMessage] = useState('');

  const handlePlayerToggle = (playerId) => {
    setCurrentSelection(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  const handleSave = () => {
    // No strict validation on targetNumPlayers anymore
    onSave(currentSelection);
    onClose();
  };

  const getGroupName = (groupId) => {
    const group = playerGroups.find(g => g.id === groupId);
    return group ? group.name : 'Non assigné';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white bg-opacity-95 rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-gray-900 relative">
        <h3 className="text-2xl font-bold mb-4 text-center">Sélectionner les joueurs</h3>
        <p className="text-center mb-2">
          Sélectionnés: <span className="font-bold">{currentSelection.length}</span>
        </p>
        {selectedGroupId && (
          <p className="text-center text-sm text-gray-600 mb-4">
            (Du groupe: <span className="font-semibold">{getGroupName(selectedGroupId)}</span>)
          </p>
        )}

        {message && (
          <p className="text-center text-yellow-600 mb-4">{message}</p>
        )}

        <div className="max-h-60 overflow-y-auto pr-2 mb-4">
          {playersInScope.length === 0 ? (
            <p className="text-center text-gray-700">Aucun joueur disponible dans ce groupe.</p>
          ) : (
            <ul className="space-y-2">
              {playersInScope.map(player => (
                <li
                  key={player.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition duration-200
                    ${currentSelection.includes(player.id) ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-100 hover:bg-gray-200'}
                  `}
                  onClick={() => handlePlayerToggle(player.id)}
                >
                  <span>{player.name} (Niveau: {player.level})</span>
                  {currentSelection.includes(player.id) && (
                    <span className="text-green-600">✓</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleSave}
            className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500"
          >
            Sauvegarder la sélection
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 text-gray-800 font-bold py-2 px-5 rounded-full shadow-lg hover:bg-gray-500 transition duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};


// Composant de configuration du tournoi
const TournamentSetup = ({
  onNavigate,
  tournamentName, setTournamentName,
  numPlayers, setNumPlayers, // numPlayers is still passed but will be readOnly
  numCourts, setNumCourts,
  matchDuration, setMatchDuration,
  breakDuration, setBreakDuration,
  tournamentStartTime, setTournamentStartTime, // New prop
  tournamentEndTime, setTournamentEndTime,      // New prop
  balanceTeamsByLevel, setBalanceTeamsByLevel,
  selectedGroupForTournament, setSelectedGroupForTournament,
  numPlayersPerTeam, setNumPlayersPerTeam,
  selectedPlayerIdsForCurrentTournament, setSelectedPlayerIdsForCurrentTournament, // Nouvelle prop
  onOpenPlayerSelectionModal // New prop for opening the modal from App
}) => {
  const { addTournament, updateTournament, tournaments, playerGroups, players } = useLocalData();
  const [message, setMessage] = useState('');

  // Efface le message après 3 secondes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handle group selection to pre-fill numPlayers and reset selected players
  const handleGroupSelect = (e) => {
    const groupId = e.target.value;
    setSelectedGroupForTournament(groupId); // Update the selected group ID

    if (groupId) {
      const playersInGroup = players.filter(p => p.groupId === groupId);
      setNumPlayers(String(playersInGroup.length)); // Pre-fill numPlayers with group size
      setSelectedPlayerIdsForCurrentTournament(playersInGroup.map(p => p.id)); // Select all players in group by default
    } else {
      setNumPlayers(''); // Clear numPlayers if "Select a group" is chosen
      setSelectedPlayerIdsForCurrentTournament([]); // Clear selected players
    }
  };

  const handleSaveSelectedPlayers = (selectedIds) => {
    setSelectedPlayerIdsForCurrentTournament(selectedIds);
    setNumPlayers(String(selectedIds.length)); // Update numPlayers based on actual selection
    setMessage("Joueurs sélectionnés avec succès !");
  };


  const handleCreateTournament = () => {
    // Convertir les valeurs en nombres pour la validation et la sauvegarde
    const parsedNumPlayers = selectedPlayerIdsForCurrentTournament.length; // Now directly from selected players
    const parsedNumCourts = parseInt(numCourts);
    const parsedMatchDuration = parseInt(matchDuration);
    const parsedBreakDuration = parseInt(breakDuration);
    const parsedNumPlayersPerTeam = parseInt(numPlayersPerTeam); // Nouvelle parsing

    // Validation des champs: vérifier si la chaîne est vide ou si la valeur parsée est invalide/non positive
    if (
      !tournamentName.trim() ||
      isNaN(parsedNumPlayers) || parsedNumPlayers <= 0 ||
      isNaN(parsedNumCourts) || parsedNumCourts <= 0 ||
      isNaN(parsedMatchDuration) || parsedMatchDuration <= 0 ||
      isNaN(parsedBreakDuration) || parsedBreakDuration < 0 || // La durée de pause peut être 0
      !tournamentStartTime.trim() || !tournamentEndTime.trim() || // New validation for start/end times
      isNaN(parsedNumPlayersPerTeam) || parsedNumPlayersPerTeam <= 0 // Nouvelle validation
    ) {
      setMessage("Veuillez remplir tous les champs obligatoires avec des valeurs numériques valides et positives (la durée de pause peut être zéro) et spécifier les heures de début et de fin.");
      return;
    }

    if (selectedPlayerIdsForCurrentTournament.length === 0) {
        setMessage("Veuillez sélectionner au moins un joueur pour la rencontre.");
        return;
    }

    if (parsedNumPlayersPerTeam * 2 * parsedNumCourts > parsedNumPlayers) {
        setMessage(`Le nombre de joueurs (${parsedNumPlayers}) est insuffisant pour un tour complet avec ${parsedNumPlayersPerTeam} joueurs par équipe sur ${parsedNumCourts} terrains (${parsedNumPlayersPerTeam * 2 * parsedNumCourts} joueurs requis).`);
        return;
    }

    // Validate start time is before end time
    const startDateTime = new Date(`2000-01-01T${tournamentStartTime}`);
    const endDateTime = new Date(`2000-01-01T${tournamentEndTime}`);
    if (endDateTime <= startDateTime) {
      setMessage("L'heure de fin doit être après l'heure de début.");
      return;
    }


    try {
      // Vérifier si une rencontre avec ce nom existe déjà
      const existingTournament = tournaments.find(t => t.name.trim() === tournamentName.trim());

      const tournamentData = {
        name: tournamentName.trim(),
        numPlayers: parsedNumPlayers, // This is now the count of selectedPlayerIds
        numCourts: parsedNumCourts,
        matchDuration: parsedMatchDuration,
        breakDuration: parsedBreakDuration,
        startTime: tournamentStartTime, // Save start time string
        endTime: tournamentEndTime,      // Save end time string
        balanceTeamsByLevel,
        selectedGroupForTournament: selectedGroupForTournament || null, // Save selected group ID
        numPlayersPerTeam: parsedNumPlayersPerTeam, // Sauvegarde de la nouvelle prop
        selectedPlayerIds: selectedPlayerIdsForCurrentTournament // Sauvegarde des IDs des joueurs sélectionnés
      };

      if (existingTournament) {
        // La rencontre avec ce nom existe, la mettre à jour
        updateTournament(existingTournament.id, tournamentData);
        setMessage(`Rencontre "${tournamentName}" mise à jour avec succès !`);
      } else {
        // Aucune rencontre avec ce nom, en créer une nouvelle
        addTournament(tournamentData);
        setMessage("Nouvelle rencontre créée avec succès !");
      }

      // Naviguer vers la page de planification des rencontres
      onNavigate('matchSchedule');
    } catch (error) {
      console.error("Erreur lors de la création/mise à jour du tournoi :", error);
      setMessage("Erreur lors de la création/mise à jour du tournoi. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-4 sm:p-8 flex flex-col items-center justify-center font-inter">
      {/* Top "Retour à l'accueil" button */}
      <div className="w-full flex justify-start mb-4">
        <button
          onClick={() => onNavigate('home')}
          className="bg-transparent border border-white text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
        >
          Retour à l'accueil
        </button>
      </div>
      <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 sm:p-10 max-w-2xl w-full text-center border border-white border-opacity-30">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Configurer une nouvelle rencontre</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="tournamentName" className="block text-lg font-medium mb-1">Saisissez le Nom de la rencontre</label> {/* Updated label */}
            <input
              type="text"
              id="tournamentName"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)} // Permet la chaîne vide
              className="w-full p-3 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <div>
            <label htmlFor="selectGroup" className="block text-lg font-medium mb-1">Sélectionner le groupe de joueurs et choisissez qui joue</label> {/* Updated label */}
            <select
              id="selectGroup"
              value={selectedGroupForTournament || ''}
              onChange={handleGroupSelect}
              className="w-full p-3 rounded-lg bg-white bg-opacity-30 border border-white bg-opacity-40 text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="" className="bg-indigo-700 text-white">Sélectionner un groupe</option>
              {playerGroups.map(group => (
                <option key={group.id} value={group.id} className="bg-indigo-700 text-white">{group.name} ({players.filter(p => p.groupId === group.id).length} joueurs)</option>
              ))}
            </select>
          </div>
          {/* Removed NumberInputWithControls for numPlayers as requested */}
          {selectedGroupForTournament && (
            <button
              onClick={() => onOpenPlayerSelectionModal(selectedGroupForTournament, selectedPlayerIdsForCurrentTournament, handleSaveSelectedPlayers)} // Pass data to App's modal handler
              className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
            >
              Sélectionner les joueurs ({selectedPlayerIdsForCurrentTournament.length} joueurs)
            </button>
          )}

          {/* Reorganized fields into a 2x2 grid */}
          <div className="grid grid-cols-2 gap-4 w-full"> {/* Added w-full here for alignment */}
            <NumberInputWithControls
              id="numPlayersPerTeam"
              label="Joueurs par équipe"
              value={numPlayersPerTeam}
              onChange={setNumPlayersPerTeam}
              min={1}
              placeholder="Ex: 2"
            />
            <NumberInputWithControls
              id="numCourts"
              label="Nombre de terrains"
              value={numCourts}
              onChange={setNumCourts}
              min={1}
              placeholder="Ex: 2"
            />
            <NumberInputWithControls
              id="matchDuration"
              label="Durée match (min)"
              value={matchDuration}
              onChange={setMatchDuration}
              min={1}
              placeholder="Ex: 15"
            />
            <NumberInputWithControls
              id="breakDuration"
              label="Durée pause (min)"
              value={breakDuration}
              onChange={setBreakDuration}
              min={0}
              placeholder="Ex: 5"
            />
          </div>

          <div>
            <label htmlFor="tournamentStartTime" className="block text-lg font-medium mb-1">Heure de début de la rencontre</label>
            <input
              type="time"
              id="tournamentStartTime"
              value={tournamentStartTime}
              onChange={(e) => setTournamentStartTime(e.target.value)}
              className="w-full p-3 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <div>
            <label htmlFor="tournamentEndTime" className="block text-lg font-medium mb-1">Heure de fin de la rencontre</label>
            <input
              type="time"
              id="tournamentEndTime"
              value={tournamentEndTime}
              onChange={(e) => setTournamentEndTime(e.target.value)}
              className="w-full p-3 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 text-white focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          {/* Replaced checkbox with a button */}
          <button
            onClick={() => setBalanceTeamsByLevel(prev => !prev)}
            className={`w-full font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50
              ${balanceTeamsByLevel ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}
            `}
          >
            Équilibrage par niveau: {balanceTeamsByLevel ? 'Activé' : 'Désactivé'}
          </button>
        </div>

        {message && (
          <p className="text-center text-yellow-300 mb-4">{message}</p>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={handleCreateTournament}
            className="bg-white text-indigo-700 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            Créer la rencontre
          </button>
        </div>
      </div>
      {/* Bottom "Retour à l'accueil" button */}
      <div className="w-full flex justify-center mt-8">
        <button
          onClick={() => onNavigate('home')}
          className="bg-transparent border border-white text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

// Composant de gestion des joueurs
const PlayerManagement = ({ onNavigate }) => { // Removed fromHome and setPlayerCountForTournamentSetup props
  const { players, addPlayer, deletePlayer, updatePlayer, playerGroups, addGroup, deleteGroup } = useLocalData();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerLevel, setNewPlayerLevel] = useState('5'); // Niveau par défaut 5
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false); // State for new group modal
  const [selectedGroupId, setSelectedGroupId] = useState(''); // Groupe sélectionné pour le nouveau joueur
  const [message, setMessage] = useState('');
  const [showGroupPlayersModal, setShowGroupPlayersModal] = useState(false);
  const [currentGroupToManage, setCurrentGroupToManage] = useState(null);
  const [playersInCurrentGroup, setPlayersInCurrentGroup] = useState([]);
  const [filterGroupId, setFilterGroupId] = useState('');

  // Efface le message après 3 secondes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Mettre à jour les joueurs dans le modal quand currentGroupToManage ou players change
  useEffect(() => {
    if (currentGroupToManage && players.length > 0) {
      const filteredPlayers = players.filter(p => p.groupId === currentGroupToManage.id);
      setPlayersInCurrentGroup(filteredPlayers);
    } else {
      setPlayersInCurrentGroup([]);
    }
  }, [currentGroupToManage, players]);


  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      setMessage("Le nom du joueur ne peut pas être vide.");
      return;
    }
    addPlayer({
      name: newPlayerName.trim(),
      level: parseInt(newPlayerLevel), // Convertir le niveau en nombre
      groupId: selectedGroupId || null, // Associer le joueur au groupe sélectionné
    });
    setNewPlayerName('');
    setNewPlayerLevel('5'); // Réinitialiser au niveau par défaut
    setMessage("Joueur ajouté !");
  };

  const handleDeletePlayer = (playerId) => {
    deletePlayer(playerId);
    setMessage("Joueur supprimé !");
  };

  const handleCreateGroupSubmit = () => { // Function to handle group creation from modal
    if (!newGroupName.trim()) {
      setMessage("Le nom du groupe ne peut pas être vide.");
      return;
    }
    addGroup({ name: newGroupName.trim() });
    setNewGroupName('');
    setShowCreateGroupModal(false); // Close modal
    setMessage("Groupe ajouté !");
  };

  const handleDeleteGroup = (groupId) => {
    deleteGroup(groupId);
    setMessage("Groupe supprimé !");
  };

  const getGroupName = (groupId) => {
    const group = playerGroups.find(g => g.id === groupId);
    return group ? group.name : 'Aucun groupe';
  };

  const handleManageGroupPlayers = (group) => {
    setCurrentGroupToManage(group);
    setShowGroupPlayersModal(true);
  };

  const handleAddPlayerToGroup = (playerId, groupId) => {
    updatePlayer(playerId, { groupId: groupId });
    setMessage("Joueur ajouté au groupe !");
  };

  const handleRemovePlayerFromGroup = (playerId) => {
    updatePlayer(playerId, { groupId: null });
    setMessage("Joueur retiré du groupe !");
  };

  const handleAddAllUnassignedToGroup = () => {
    if (!currentGroupToManage) {
      setMessage("Aucun groupe sélectionné.");
      return;
    }
    const unassignedPlayers = players.filter(p => p.groupId === null || p.groupId === undefined);
    unassignedPlayers.forEach(player => {
      updatePlayer(player.id, { groupId: currentGroupToManage.id });
    });
    setMessage(`${unassignedPlayers.length} joueurs ajoutés au groupe ${currentGroupToManage.name} !`);
  };

  // Filtrer les joueurs affichés en fonction du groupe sélectionné
  const filteredPlayers = filterGroupId
    ? players.filter(player => player.groupId === filterGroupId)
    : players;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 sm:p-8 flex flex-col items-center font-inter">
      {/* Top "Retour à l'accueil" button */}
      <div className="w-full flex justify-start mb-4">
        <button
          onClick={() => onNavigate('home')}
          className="bg-transparent border border-white text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
        >
          Retour à l'accueil
        </button>
      </div>
      <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 sm:p-10 max-w-2xl w-full border border-white border-opacity-30">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Gérer les joueurs et les groupes</h2>

        {message && (
          <p className="text-center text-yellow-300 mb-4">{message}</p>
        )}

        {/* Section de gestion des groupes */}
        <div className="mb-8 p-4 bg-white bg-opacity-15 rounded-lg border border-white border-opacity-20">
          <h3 className="text-2xl font-bold mb-4">Créer et gérer les groupes</h3>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Replaced input and button with a single button to open modal */}
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="bg-white text-indigo-700 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
            >
              Créer un groupe
            </button>
          </div>
          <h4 className="text-xl font-semibold mb-2">Groupes existants</h4>
          {playerGroups.length === 0 ? (
            <p className="opacity-80 text-sm">Aucun groupe créé pour le moment.</p>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {playerGroups.map(group => (
                <li key={group.id} className="flex items-center justify-between bg-white bg-opacity-10 p-2 rounded-lg">
                  <span>{group.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleManageGroupPlayers(group)}
                      className="bg-blue-500 text-white py-1 px-3 rounded-full text-xs hover:bg-blue-600 transition duration-300"
                    >
                      Gérer joueurs du groupe
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="bg-red-500 text-white py-1 px-3 rounded-full text-xs hover:bg-red-600 transition duration-300"
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Section d'ajout de joueur */}
        <div className="mb-6">
          {/* Removed "Nombre de joueurs actuellement créés..." phrase */}
          <h3 className="text-2xl font-bold mb-4">Liste des joueurs <span className="text-lg opacity-80">({players.length} Joueurs totaux)</span></h3> {/* Added total players */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="flex-grow p-3 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Nom du nouveau joueur"
            />
            <select
              value={newPlayerLevel}
              onChange={(e) => setNewPlayerLevel(e.target.value)}
              className="p-3 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={String(i + 1)} className="bg-indigo-700 text-white">Niveau {i + 1}</option>
              ))}
            </select>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="p-3 rounded-lg bg-white bg-opacity-30 border border-white bg-opacity-40 text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="" className="bg-indigo-700 text-white">Aucun groupe</option>
              {playerGroups.map(group => (
                <option key={group.id} value={group.id} className="bg-indigo-700 text-white">{group.name}</option>
              ))}
            </select>
            <button
              onClick={handleAddPlayer}
              className="bg-white text-indigo-700 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
            >
              Ajouter Joueur
            </button>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-4">Liste des joueurs</h3>
        <div className="mb-4">
          <label htmlFor="filterGroup" className="block text-lg font-medium mb-1">Filtrer par groupe</label>
          <select
            id="filterGroup"
            value={filterGroupId}
            onChange={(e) => setFilterGroupId(e.target.value)}
            className="w-full p-3 rounded-lg bg-white bg-opacity-30 border border-white bg-opacity-40 text-white focus:outline-none focus:ring-2 focus:ring-white"
          >
            <option value="" className="bg-indigo-700 text-white">Tous les joueurs</option>
            {playerGroups.map(group => (
              <option key={group.id} value={group.id} className="bg-indigo-700 text-white">{group.name}</option>
            ))}
          </select>
        </div>

        {filteredPlayers.length === 0 ? (
          <p className="text-center opacity-80">Aucun joueur ajouté pour le moment ou aucun joueur dans ce groupe.</p>
        ) : (
          <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {filteredPlayers.map((player) => (
              <li key={player.id} className="flex items-center justify-between bg-white bg-opacity-15 p-3 rounded-lg shadow-md border border-white border-opacity-20">
                <span className="text-lg">{player.name} (Niveau: {player.level}) {player.groupId && <span className="text-sm opacity-70"> - Groupe: {getGroupName(player.groupId)}</span>}</span>
                <button
                  onClick={() => handleDeletePlayer(player.id)}
                  className="bg-red-500 text-white py-1 px-3 rounded-full text-sm hover:bg-red-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Bottom "Retour à l'accueil" button */}
      <div className="w-full flex justify-center mt-8">
        <button
          onClick={() => onNavigate('home')}
          className="bg-transparent border border-white text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
        >
          Retour à l'accueil
        </button>
      </div>

      {/* Modal pour créer un nouveau groupe */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white bg-opacity-95 rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-gray-900 relative">
            <h3 className="text-2xl font-bold mb-4 text-center">Créer un nouveau groupe</h3>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              placeholder="Nom du groupe"
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCreateGroupSubmit}
                className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500"
              >
                Créer
              </button>
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="bg-gray-400 text-gray-800 font-bold py-2 px-5 rounded-full shadow-lg hover:bg-gray-500 transition duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour gérer les joueurs d'un groupe */}
      {showGroupPlayersModal && currentGroupToManage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white bg-opacity-95 rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-gray-900 relative">
            <h3 className="text-2xl font-bold mb-4 text-center">Joueurs du groupe: {currentGroupToManage.name}</h3>
            <button
              onClick={() => setShowGroupPlayersModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
            >
              &times;
            </button>

            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Joueurs dans ce groupe ({playersInCurrentGroup.length}) :</h4>
              {playersInCurrentGroup.length === 0 ? (
                <p className="text-sm text-gray-700">Aucun joueur dans ce groupe.</p>
              ) : (
                <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {playersInCurrentGroup.map(player => (
                    <li key={player.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                      <span>{player.name} (Niveau: {player.level})</span>
                      <button
                        onClick={() => handleRemovePlayerFromGroup(player.id)}
                        className="bg-red-500 text-white py-1 px-3 rounded-full text-xs hover:bg-red-600 transition duration-300"
                      >
                        Retirer
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2">Ajouter des joueurs à ce groupe :</h4>
              <select
                onChange={(e) => {
                  if (e.target.value) { // S'assurer qu'une option valide est sélectionnée
                    handleAddPlayerToGroup(e.target.value, currentGroupToManage.id);
                    e.target.value = ""; // Réinitialiser le select après sélection
                  }
                }}
                value="" // Contrôler la valeur du select pour qu'elle soit toujours vide après sélection
                className="w-full p-2 rounded-lg bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sélectionner un joueur</option>
                {players.filter(p => p.groupId !== currentGroupToManage.id).map(player => (
                  <option key={player.id} value={player.id}>{player.name} (Niveau: {player.level})</option>
                ))}
              </select>
              <button
                onClick={handleAddAllUnassignedToGroup}
                className="mt-4 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500"
              >
                Ajouter tous les joueurs non-assignés à ce groupe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to compare tournament configurations
const areTournamentConfigsEqual = (config1, config2) => {
  // Helper function to compare tournament configurations
  if (!config1 || !config2) return false; // One or both are null/undefined

  // Compare basic properties
  const basicPropsEqual = (
    config1.name === config2.name &&
    config1.numPlayers === config2.numPlayers &&
    config1.numCourts === config2.numCourts &&
    config1.matchDuration === config2.matchDuration &&
    config1.breakDuration === config2.breakDuration &&
    config1.startTime === config2.startTime && // New comparison
    config1.endTime === config2.endTime &&      // New comparison
    config1.balanceTeamsByLevel === config2.balanceTeamsByLevel &&
    config1.numPlayersPerTeam === config2.numPlayersPerTeam
  );

  if (!basicPropsEqual) return false;

  // Compare selectedPlayerIds arrays
  const selectedPlayersEqual = (
    Array.isArray(config1.selectedPlayerIds) &&
    Array.isArray(config2.selectedPlayerIds) &&
    config1.selectedPlayerIds.length === config2.selectedPlayerIds.length &&
    config1.selectedPlayerIds.every(id => config2.selectedPlayerIds.includes(id))
  );

  return selectedPlayersEqual;
};


// Composant de planification des matchs
const MatchSchedule = ({ onNavigate,
  selectedTournament, // Now passed as a prop
  generatedScheduleTours, setGeneratedScheduleTours,
  currentTourIndex, setCurrentTourIndex,
  generatedForTournamentId, setGeneratedForTournamentId,
  lastGeneratedTournamentConfig, setLastGeneratedTournamentConfig,
  onSelectTournament, // New prop to notify App of tournament selection
  selectedPlayerIdsForCurrentTournament // IDs des joueurs sélectionnés pour la rencontre active
}) => {
  const { tournaments, players, getMatchesForTournament, saveMatchesForTournament, saveGeneratedSchedule, updateMatchScore, shuffleArray } = useLocalData();

  const [timer, setTimer] = useState(0); // Global timer
  const [isRunning, setIsRunning] = useState(false); // Global timer running state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null); // 'nextTour' or 'endMatches'
  const [showTimerOptionsModal, setShowTimerOptionsModal] = useState(false);

  const [timerMode, setTimerMode] = useState('global'); // 'global' or 'individual'
  // { matchId: { timeLeft: seconds, isRunning: boolean } }
  const [matchTimers, setMatchTimers] = useState({});

  // Use useMemo for currentTour to ensure it's always defined or null
  const currentTour = useMemo(() => {
    if (Array.isArray(generatedScheduleTours) && currentTourIndex >= 0 && currentTourIndex < generatedScheduleTours.length) {
      return generatedScheduleTours[currentTourIndex];
    }
    return null;
  }, [generatedScheduleTours, currentTourIndex]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const generateSingleTourMatches = useCallback((currentPlayersPool, availablePlayersBase, selectedTourney, lastTourActualEndTimeISO) => {
    const numPlayersPerTeam = parseInt(selectedTourney.numPlayersPerTeam); // Utiliser la nouvelle prop
    const numPlayersPerMatch = numPlayersPerTeam * 2; // Deux équipes par match
    const configuredNumCourts = parseInt(selectedTourney.numCourts);

    let tempPlayersPool = [...currentPlayersPool];
    let newPlayersPool = [];
    let playersPlayedThisTour = [];

    // Si le pool actuel est insuffisant pour au moins un match, recharger à partir de la base des joueurs disponibles et mélanger
    if (tempPlayersPool.length < numPlayersPerMatch) {
      console.log("DEBUG_SINGLE_TOUR: Not enough players in current pool for one match. Shuffling available players base."); // Debug log
      tempPlayersPool = shuffleArray([...availablePlayersBase]);
    }

    let playersForCourtDistribution = [];
    // Tenter de sélectionner suffisamment de joueurs pour tous les terrains configurés
    for (let i = 0; i < configuredNumCourts * numPlayersPerMatch; i++) {
        if (tempPlayersPool.length === 0) {
            console.warn(`DEBUG_SINGLE_TOUR: Player pool exhausted while trying to select players for courts. Remaining players: ${tempPlayersPool.length}`);
            break; // Arrêter si plus de joueurs dans le pool
        }
        playersForCourtDistribution.push(tempPlayersPool.shift());
    }
    newPlayersPool = tempPlayersPool; // Joueurs restants dans le pool après la sélection

    let tourMatches = [];

    for (let court = 1; court <= configuredNumCourts; court++) {
      // Ne générer un match que s'il y a suffisamment de joueurs pour un match complet
      if (playersForCourtDistribution.length < numPlayersPerMatch) {
        console.warn(`DEBUG_SINGLE_TOUR: Not enough players remaining for a full match on court ${court}. Skipping this court.`); // Debug log
        break; // Arrêter la génération de matchs pour les terrains restants
      }

      let matchPlayers = [];
      for (let j = 0; j < numPlayersPerMatch; j++) {
        matchPlayers.push(playersForCourtDistribution.shift());
      }

      let team1 = [];
      let team2 = [];

      if (selectedTourney.balanceTeamsByLevel) {
        // Pour équilibrer par niveau avec N joueurs par équipe
        // Trier les joueurs par niveau
        const sortedMatchPlayers = [...matchPlayers].sort((a, b) => parseInt(a.level) - parseInt(b.level));
        // Distribuer les joueurs pour équilibrer les équipes
        for (let i = 0; i < numPlayersPerMatch; i++) {
            if (i % 2 === 0) { // Alterner pour la première équipe
                team1.push(sortedMatchPlayers[i]);
            } else { // Alterner pour la deuxième équipe
                team2.push(sortedMatchPlayers[i]);
            }
        }
        // Ajuster si les équipes n'ont pas la bonne taille (peut arriver si numPlayersPerTeam est impair)
        while (team1.length > numPlayersPerTeam) {
            team2.push(team1.pop());
        }
        while (team2.length > numPlayersPerTeam) {
            team1.push(team2.pop());
        }

      } else {
        // Distribution aléatoire pour les équipes
        team1 = matchPlayers.slice(0, numPlayersPerTeam);
        team2 = matchPlayers.slice(numPlayersPerTeam, numPlayersPerMatch);
      }
      console.log(`DEBUG_SINGLE_TOUR: Court ${court} - Team 1: ${team1.map(p => p.name).join(', ')} vs Team 2: ${team2.map(p => p.name).join(', ')}`); // Debug log

      tourMatches.push({
        id: crypto.randomUUID(),
        court: court,
        team1: team1.map(p => p.name),
        team2: team2.map(p => p.name),
        scoreTeam1: null,
        scoreTeam2: null,
        status: 'upcoming'
      });
      playersPlayedThisTour.push(...matchPlayers); // Ajouter les joueurs qui ont effectivement participé aux matchs de ce tour
    }

    // Les joueurs restants dans le pool sont ceux qui n'ont pas été utilisés pour former des matchs
    const finalRemainingPlayersPool = [...playersForCourtDistribution, ...newPlayersPool];

    let tourStartTime;
    if (lastTourActualEndTimeISO) {
      tourStartTime = new Date(new Date(lastTourActualEndTimeISO).getTime() + selectedTourney.breakDuration * 60 * 1000);
    } else {
      // If no lastTourActualEndTime, it's the very first tour of the schedule.
      // Use the tournament's configured start time, but for "today".
      const [hours, minutes] = selectedTourney.startTime.split(':').map(Number);
      tourStartTime = new Date(); // Get current date
      tourStartTime.setHours(hours, minutes, 0, 0); // Set time
    }
    const tourEndTime = new Date(tourStartTime.getTime() + selectedTourney.matchDuration * 60 * 1000);

    return {
      tour: null,
      startTime: tourStartTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      endTime: tourEndTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      actualStartTime: tourStartTime.toISOString(),
      actualEndTime: tourEndTime.toISOString(),
      matches: tourMatches,
      playersPlayed: playersPlayedThisTour, // Joueurs qui ont effectivement participé aux matchs de ce tour
      remainingPlayersPool: finalRemainingPlayersPool
    };
  }, [shuffleArray]); // Added shuffleArray to dependencies


  const isTournamentFinishedState = useMemo(() => {
    if (!selectedTournament || generatedScheduleTours.length === 0) {
        console.log("DEBUG: isTournamentFinishedState - No tournament or no schedule. Returning true.");
        return true;
    }

    const now = new Date(); // Current date and time
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    // Tournament start and end times for TODAY
    const [startHours, startMinutes] = selectedTournament.startTime.split(':').map(Number);
    const tournamentStartDateTimeToday = new Date(currentYear, currentMonth, currentDay, startHours, startMinutes, 0, 0);

    const [endHours, endMinutes] = selectedTournament.endTime.split(':').map(Number);
    const tournamentEndDateTimeToday = new Date(currentYear, currentMonth, currentDay, endHours, endMinutes, 0, 0);

    // If the current time is already past the tournament's end time for today, it's finished.
    // This handles cases where the user opens the app after the tournament should have ended for the day.
    if (now.getTime() > tournamentEndDateTimeToday.getTime()) {
        console.log("DEBUG: isTournamentFinishedState - Current time is past tournament end time today. Returning true.");
        return true;
    }

    // Calculate the total duration available for matches + breaks in the tournament window
    const totalAvailableDurationMillis = tournamentEndDateTimeToday.getTime() - tournamentStartDateTimeToday.getTime();
    if (totalAvailableDurationMillis <= 0) { // Tournament window is invalid or zero length
        console.log("DEBUG: isTournamentFinishedState - Invalid or zero length tournament window. Returning true.");
        return true;
    }

    // Calculate the duration of one tour including its break
    const durationPerTourWithBreakMillis = (selectedTournament.matchDuration + selectedTournament.breakDuration) * 60 * 1000;

    // Calculate how many tours can fit in the total available duration
    const maxPossibleTours = Math.floor(totalAvailableDurationMillis / durationPerTourWithBreakMillis);

    // If the currentTourIndex (0-based) plus the next tour (1) exceeds the max possible tours, then no more tours can fit.
    // This implicitly means the time is "up" for generating another full tour within the defined window.
    if (currentTourIndex + 1 > maxPossibleTours) {
        console.log("DEBUG: isTournamentFinishedState - No more tours can fit within the time window. Current tours:", currentTourIndex + 1, "Max possible:", maxPossibleTours, ". Returning true.");
        return true;
    }

    console.log("DEBUG: isTournamentFinishedState - Tournament is NOT finished. Time available. Returning false.");
    return false;
  }, [selectedTournament, generatedScheduleTours.length, currentTourIndex]); // Depend on selectedTournament, generatedScheduleTours.length, currentTourIndex


  const handleNextTourLogic = useCallback(() => {
    if (!selectedTournament) return;

    const updatedSchedule = [...generatedScheduleTours];
    const currentTourData = updatedSchedule[currentTourIndex];

    // 1. Mark current tour as completed and ensure scores are not null
    if (currentTourIndex < updatedSchedule.length) {
        const updatedMatches = currentTourData.matches.map(match => {
            const newMatch = { ...match };
            if (newMatch.scoreTeam1 === null) newMatch.scoreTeam1 = 0;
            if (newMatch.scoreTeam2 === null) newMatch.scoreTeam2 = 0;
            return newMatch;
        });

        updatedSchedule[currentTourIndex] = {
            ...currentTourData,
            matches: updatedMatches,
            isCompleted: true
        };
        // Also update individual match scores in allMatches for history page
        updatedMatches.forEach(match => {
            updateMatchScore(selectedTournament.id, match.id, 'team1', match.scoreTeam1);
            updateMatchScore(selectedTournament.id, match.id, 'team2', match.scoreTeam2);
        });
    }

    // Get current date components for accurate time calculations
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    // Construct tournament end time using current date
    const [endHours, endMinutes] = selectedTournament.endTime.split(':').map(Number);
    const tournamentEndDateTime = new Date(currentYear, currentMonth, currentDay, endHours, endMinutes, 0, 0);

    // Determine the actual end time of the tour that just finished (or current actual time)
    // If no tours exist yet, use the tournament's configured start time (for today)
    const actualCurrentTourEndTime = currentTourData ? new Date(currentTourData.actualEndTime) : now;


    // Check if there's a next pre-generated tour
    if (currentTourIndex < generatedScheduleTours.length - 1) {
        const nextTourIndex = currentTourIndex + 1;
        const nextTourData = updatedSchedule[nextTourIndex];

        // Recalculate start and end times for the NEXT tour based on actualCurrentTourEndTime
        const newNextTourActualStartTime = new Date(actualCurrentTourEndTime.getTime() + selectedTournament.breakDuration * 60 * 1000);
        const newNextTourActualEndTime = new Date(newNextTourActualStartTime.getTime() + selectedTournament.matchDuration * 60 * 1000);

        // Before moving to the next pre-generated tour, check if it would exceed the tournament's overall end time
        if (newNextTourActualEndTime.getTime() > tournamentEndDateTime.getTime()) {
            console.log("DEBUG: Next pre-generated tour would exceed tournament end time. Stopping.");
            setIsRunning(false);
            setTimer(0);
            setShowConfirmationModal(false); // Close modal
            // Do not advance currentTourIndex, effectively ending the active play
            return;
        }

        updatedSchedule[nextTourIndex] = {
            ...nextTourData,
            actualStartTime: newNextTourActualStartTime.toISOString(),
            actualEndTime: newNextTourActualEndTime.toISOString(),
            startTime: newNextTourActualStartTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            endTime: newNextTourActualEndTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        };

        setGeneratedScheduleTours(updatedSchedule); // Update App's state with new times
        saveGeneratedSchedule(selectedTournament.id, updatedSchedule);

        setCurrentTourIndex(nextTourIndex);
        setTimer(selectedTournament.matchDuration * 60);
        setIsRunning(false);
        setTimerMode('global'); // Reset to global timer mode for the new tour

    } else {
      // We are at the end of the pre-generated schedule. Attempt dynamic generation.
      const playersForTournament = players.filter(p => selectedPlayerIdsForCurrentTournament.includes(p.id));

      // Calculate prospective times for the *next* tour before generating matches
      const prospectiveNextTourStartTime = new Date(actualCurrentTourEndTime.getTime() + selectedTournament.breakDuration * 60 * 1000);
      const prospectiveNextTourEndTime = new Date(prospectiveNextTourStartTime.getTime() + selectedTournament.matchDuration * 60 * 1000);

      // Check if the new tour would exceed the tournament's overall end time
      if (prospectiveNextTourEndTime.getTime() > tournamentEndDateTime.getTime()) {
          console.log("DEBUG: New tour would exceed tournament end time. Stopping dynamic generation.");
          setIsRunning(false);
          setTimer(0);
          setShowConfirmationModal(false); // Close modal
          return; // EXIT, as tournament time is truly over
      }

      console.log("DEBUG: End of pre-generated schedule, attempting to generate new tour dynamically.");
      const currentPlayersPoolForNextTour = [...currentTourData.remainingPlayersPool, ...currentTourData.playersPlayed];

      // Generate matches for the next tour. It might return an empty array if not enough players for a full match.
      const newTourData = generateSingleTourMatches(
          currentPlayersPoolForNextTour,
          playersForTournament, // Always use the full selected player list as base
          selectedTournament,
          actualCurrentTourEndTime.toISOString() // Pass the actual end time of the last tour
      );

      // ALWAYS add the new tour if time permits, even if it has no matches.
      const newTour = {
          ...newTourData, // This will include matches (possibly empty), playersPlayed, remainingPlayersPool
          tour: generatedScheduleTours.length + 1,
          actualStartTime: prospectiveNextTourStartTime.toISOString(),
          actualEndTime: prospectiveNextTourEndTime.toISOString(),
          startTime: prospectiveNextTourStartTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          endTime: prospectiveNextTourEndTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          isCompleted: false,
          // Ensure these are saved for future dynamic generation
          remainingPlayersPool: newTourData.remainingPlayersPool,
          playersPlayed: newTourData.playersPlayed,
      };

      const updatedScheduleWithNewTour = [...updatedSchedule, newTour];
      setGeneratedScheduleTours(updatedScheduleWithNewTour);
      saveGeneratedSchedule(selectedTournament.id, updatedScheduleWithNewTour);

      // Only save matches if there are any to save
      if (newTour.matches.length > 0) {
          const newMatchesToSave = newTour.matches.map(match => ({
              ...match,
              tour: newTour.tour,
              tournamentId: selectedTournament.id,
              startTime: newTour.startTime,
              endTime: newTour.endTime,
              actualStartTime: newTour.actualStartTime,
              actualEndTime: newTour.actualEndTime,
              timestamp: new Date().toISOString(),
          }));
          saveMatchesForTournament(selectedTournament.id, [...getMatchesForTournament(selectedTournament.id), ...newMatchesToSave]);
          console.log("DEBUG: Dynamically generated new tour with matches and added to schedule.");
      } else {
          console.log("DEBUG: Dynamically generated new tour, but no matches could be formed. Added empty tour to schedule.");
      }

      setCurrentTourIndex(updatedScheduleWithNewTour.length - 1); // Move to the newly added tour
      setTimer(selectedTournament.matchDuration * 60);
      setIsRunning(false);
      setTimerMode('global'); // Reset to global timer mode for the new tour
    }
    setShowConfirmationModal(false); // Close modal after action
  }, [currentTourIndex, generatedScheduleTours, selectedTournament, setCurrentTourIndex, setTimer, setIsRunning, saveGeneratedSchedule, setGeneratedScheduleTours, updateMatchScore, players, selectedPlayerIdsForCurrentTournament, saveMatchesForTournament, getMatchesForTournament, generateSingleTourMatches]);


  // Effect to manage global timer and running state when currentTourIndex or selectedTournament changes
  useEffect(() => {
    if (!selectedTournament || generatedScheduleTours.length === 0) {
      setTimer(0);
      setIsRunning(false);
      setTimerMode('global'); // Default to global mode
      return;
    }

    if (currentTourIndex < generatedScheduleTours.length) {
      const currentTourData = generatedScheduleTours[currentTourIndex];
      if (currentTourData.isCompleted) {
        setTimer(0);
        setIsRunning(false);
        setTimerMode('global'); // Default to global mode
      } else {
        setTimer(selectedTournament.matchDuration * 60);
        setIsRunning(false);
        setTimerMode('global'); // Default to global mode
      }
    } else {
      setTimer(0);
      setIsRunning(false);
      setTimerMode('global'); // Default to global mode
    }
    // When tour changes, reset individual timers
    setMatchTimers({});
  }, [currentTourIndex, generatedScheduleTours, selectedTournament]);


  // Timer for current time (display in corner)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global timer effect
  useEffect(() => {
    let interval;
    if (isRunning && timerMode === 'global') {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 0) {
            clearInterval(interval);
            setIsRunning(false);
            handleNextTourLogic(); // Call the logic directly when timer ends
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timer, handleNextTourLogic, timerMode]);


  // Individual match timers effect
  useEffect(() => {
    let intervals = {};
    if (timerMode === 'individual' && currentTour && currentTour.matches) {
      currentTour.matches.forEach(match => {
        if (matchTimers[match.id]?.isRunning) {
          intervals[match.id] = setInterval(() => {
            setMatchTimers(prev => {
              const newTimers = { ...prev };
              if (newTimers[match.id] && newTimers[match.id].timeLeft > 0) {
                newTimers[match.id] = { ...newTimers[match.id], timeLeft: newTimers[match.id].timeLeft - 1 };
              } else if (newTimers[match.id]) {
                newTimers[match.id] = { ...newTimers[match.id], isRunning: false }; // Stop if 0
              }
              return newTimers;
            });
          }, 1000);
        }
      });
    }
    return () => {
      for (const key in intervals) {
        clearInterval(intervals[key]);
      }
    };
  }, [timerMode, matchTimers, currentTour, selectedTournament]);


  const generateMatchSchedule = () => {
    if (!selectedTournament) {
      console.log("DEBUG: No tournament selected."); // Debug log
      return;
    }

    // Utiliser les joueurs réellement sélectionnés pour la rencontre
    const playersForTournament = players.filter(p => selectedPlayerIdsForCurrentTournament.includes(p.id));

    const configuredNumPlayers = parseInt(selectedTournament.numPlayers);
    const numPlayersPerTeam = parseInt(selectedTournament.numPlayersPerTeam); // Utiliser la nouvelle prop
    const numPlayersPerMatch = numPlayersPerTeam * 2; // Deux équipes par match
    const configuredNumCourts = parseInt(selectedTournament.numCourts);
    const playersNeededForFullTour = configuredNumCourts * numPlayersPerMatch;

    console.log(`DEBUG: Configured Num Players (from tournament config): ${configuredNumPlayers}`); // Debug log
    console.log(`DEBUG: Num Players Per Team: ${numPlayersPerTeam}`); // Debug log
    console.log(`DEBUG: Num Players Per Match: ${numPlayersPerMatch}`); // Debug log
    console.log(`DEBUG: Configured Num Courts: ${configuredNumCourts}`); // Debug log
    console.log(`DEBUG: Players Needed For Full Tour: ${playersNeededForFullTour}`); // Debug log
    console.log(`DEBUG: Actual players selected for tournament: ${playersForTournament.length}`); // Debug log

    if (playersForTournament.length < configuredNumPlayers) {
        console.warn("DEBUG: Selected players count is less than configured numPlayers. Using selected players.");
    }
    if (playersForTournament.length < numPlayersPerMatch) { // Check if enough players for at least one match
      console.log("DEBUG: Not enough selected players for even one match. The schedule will be empty.");
      // We will still proceed to generate, but it will result in an empty schedule.
    }


    let currentPlayersPool = shuffleArray([...playersForTournament]);
    let allGeneratedTours = [];
    let lastTourActualEndTime = null; // Will store ISO string of actual end time of previous tour

    // Get current date components
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    // Construct tournament start and end times using current date
    const [startHours, startMinutes] = selectedTournament.startTime.split(':').map(Number);
    const tournamentStartDateTime = new Date(currentYear, currentMonth, currentDay, startHours, startMinutes, 0, 0);

    const [endHours, endMinutes] = selectedTournament.endTime.split(':').map(Number);
    const tournamentEndDateTime = new Date(currentYear, currentMonth, currentDay, endHours, endMinutes, 0, 0);


    let tourCounter = 1;

    while (true) {
        console.log(`DEBUG: Starting Tour ${tourCounter} generation.`);
        // Pass null for first tour's lastTourActualEndTime to use tournamentStartDateTime
        const tourData = generateSingleTourMatches(currentPlayersPool, playersForTournament, selectedTournament, lastTourActualEndTime);

        const tourActualStartTime = lastTourActualEndTime
            ? new Date(new Date(lastTourActualEndTime).getTime() + selectedTournament.breakDuration * 60 * 1000)
            : tournamentStartDateTime; // Use configured start time for the very first tour

        const tourActualEndTime = new Date(tourActualStartTime.getTime() + selectedTournament.matchDuration * 60 * 1000);

        // Check if the end time of the *current* prospective tour exceeds the tournament's end time
        if (tourActualEndTime.getTime() > tournamentEndDateTime.getTime()) {
            console.log("DEBUG: Prospective tour exceeds total play time limit. Breaking loop."); // Debug log
            break;
        }

        allGeneratedTours.push({
            ...tourData,
            tour: tourCounter,
            actualStartTime: tourActualStartTime.toISOString(),
            actualEndTime: tourActualEndTime.toISOString(),
            startTime: tourActualStartTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            endTime: tourActualEndTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            isCompleted: false,
            // Ensure these are saved for future dynamic generation
            remainingPlayersPool: tourData.remainingPlayersPool,
            playersPlayed: tourData.playersPlayed,
        });

        lastTourActualEndTime = tourActualEndTime.toISOString(); // Update for the next iteration
        currentPlayersPool = [...tourData.remainingPlayersPool, ...tourData.playersPlayed];
        tourCounter++;

        if (tourCounter > 50) {
            console.warn("DEBUG: Reached maximum tour generation limit (50 tours). Stopping."); // Debug log
            break;
        }
    }

    if (allGeneratedTours.length === 0) {
        console.log("DEBUG: No tours generated at all. Returning."); // Debug log
        return;
    }

    // Update App's state via props
    setGeneratedScheduleTours(allGeneratedTours);
    setCurrentTourIndex(0);
    setTimer(selectedTournament.matchDuration * 60);
    setIsRunning(false);
    setTimerMode('global'); // Reset to global timer mode
    setGeneratedForTournamentId(selectedTournament.id);
    setLastGeneratedTournamentConfig({ ...selectedTournament });

    saveGeneratedSchedule(selectedTournament.id, allGeneratedTours);

    const allMatchesToSave = allGeneratedTours.flatMap(tour =>
      tour.matches.map(match => ({
        ...match,
        tour: tour.tour,
        tournamentId: selectedTournament.id,
        startTime: tour.startTime,
        endTime: tour.endTime,
        actualStartTime: tour.actualStartTime,
        actualEndTime: tour.actualEndTime,
        timestamp: new Date().toISOString(),
      }))
    );
    saveMatchesForTournament(selectedTournament.id, allMatchesToSave);
    console.log("DEBUG: Match schedule generated and saved successfully."); // Debug log
  };


  const handleMatchScoreChange = (matchIdx, team, score) => {
    const newScheduleTours = [...generatedScheduleTours];
    const currentTourMatches = newScheduleTours[currentTourIndex].matches;
    const scoreValue = score === '' ? null : parseInt(score);

    const matchIdToUpdate = currentTourMatches[matchIdx].id;

    if (team === 'team1') {
        currentTourMatches[matchIdx].scoreTeam1 = scoreValue;
    } else {
        currentTourMatches[matchIdx].scoreTeam2 = scoreValue;
    }
    setGeneratedScheduleTours(newScheduleTours); // Update App's state

    // Now, persist the change using the granular updateMatchScore from context
    updateMatchScore(selectedTournament.id, matchIdToUpdate, team, scoreValue);
  };

  const toggleStartPauseResume = () => {
    if (!selectedTournament || generatedScheduleTours.length === 0 || currentTourIndex >= generatedScheduleTours.length) {
      return;
    }

    if (timerMode === 'global') {
      setIsRunning(prev => !prev); // Toggle global timer
    } else { // timerMode === 'individual'
      setShowTimerOptionsModal(true); // Show options to switch mode or re-select
    }
  };

  const handleStartTourTimer = () => {
    if (selectedTournament) { // Check if selectedTournament is not null
      if (timer <= 0) {
          setTimer(selectedTournament.matchDuration * 60);
      }
      setIsRunning(true);
      setTimerMode('global');
      setMatchTimers({}); // Clear individual timers
      setShowTimerOptionsModal(false);
    }
  };

  const handleManageIndividualMatches = () => {
    setIsRunning(false); // Stop global timer
    setTimerMode('individual');
    // Initialize individual timers for all matches in the current tour
    if (currentTour && selectedTournament) {
      const initialMatchTimers = {};
      currentTour.matches.forEach(match => {
        initialMatchTimers[match.id] = {
          timeLeft: selectedTournament.matchDuration * 60,
          isRunning: false
        };
      });
      setMatchTimers(initialMatchTimers);
    } else {
      // If no currentTour or selectedTournament, ensure matchTimers is empty
      setMatchTimers({});
    }
    setShowTimerOptionsModal(false);
  };


  const resetMatchTimer = () => { // Global timer reset
    if (selectedTournament) {
      setTimer(selectedTournament.matchDuration * 60);
      setIsRunning(false);
      setTimerMode('global'); // Ensure we are back in global mode
      setMatchTimers({}); // Clear individual timers
    }
  };

  const handleIndividualTimerToggle = (matchId) => {
    setMatchTimers(prev => {
      const newTimers = { ...prev };
      if (newTimers[matchId]) {
        newTimers[matchId] = {
          ...newTimers[matchId],
          isRunning: !newTimers[matchId].isRunning
        };
        // If starting, ensure time is not 0
        if (newTimers[matchId].isRunning && newTimers[matchId].timeLeft <= 0) {
          newTimers[matchId].timeLeft = selectedTournament.matchDuration * 60;
        }
      }
      return newTimers;
    });
  };

  const handleIndividualTimerReset = (matchId) => {
    if (selectedTournament) { // Check if selectedTournament is not null
      setMatchTimers(prev => ({
        ...prev,
        [matchId]: {
          timeLeft: selectedTournament.matchDuration * 60,
          isRunning: false
        }
      }));
    }
  };

  const requestNextTour = () => {
    setConfirmationAction('nextTour');
    setShowConfirmationModal(true);
  };

  const handleConfirmAction = () => {
    if (confirmationAction === 'nextTour') {
      handleNextTourLogic();
    }
    setShowConfirmationModal(false);
    setConfirmationAction(null);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmationModal(false);
    setConfirmationAction(null);
  };


  const handlePreviousTour = () => {
    if (currentTourIndex > 0) {
      setCurrentTourIndex(prev => prev - 1);
      if (selectedTournament) {
        setTimer(selectedTournament.matchDuration * 60);
      }
      setIsRunning(false);
      setTimerMode('global'); // Reset to global timer mode
      setMatchTimers({}); // Clear individual timers
    }
  };


  // Calculate players on bench: players selected for the tournament but not currently playing
  const allSelectedPlayersInTournament = players.filter(p => selectedPlayerIdsForCurrentTournament.includes(p.id));
  let playersCurrentlyPlayingInTour = new Set();
  if (currentTour && currentTour.matches) {
    currentTour.matches.forEach(match => {
      match.team1.forEach(playerName => playersCurrentlyPlayingInTour.add(playerName));
      match.team2.forEach(playerName => playersCurrentlyPlayingInTour.add(playerName));
    });
  }

  const playersOnBenchNames = allSelectedPlayersInTournament
    .filter(p => !playersCurrentlyPlayingInTour.has(p.name))
    .map(p => p.name);


  let mainButtonText = "Démarrer le Chrono";
  if (isRunning) {
    mainButtonText = "Pause";
  } else if (timer > 0) {
    mainButtonText = "Démarrer le Chrono";
  }

  const hasGeneratedBefore = selectedTournament && generatedForTournamentId === selectedTournament.id && generatedScheduleTours.length > 0;
  const configHasChanged = selectedTournament && lastGeneratedTournamentConfig && !areTournamentConfigsEqual(selectedTournament, lastGeneratedTournamentConfig);

  const showGenerateButton = !selectedTournament || !hasGeneratedBefore || configHasChanged;
  const generateButtonText = hasGeneratedBefore && configHasChanged ? "Re Générer le tableau des matchs" : "Générer le tableau des matchs";


  let nextButtonText = "Match Suivant";
  const isNextButtonDisabled = isTournamentFinishedState; // Now only depends on time

  if (isTournamentFinishedState) {
      nextButtonText = "Rencontre Terminée";
  } else if (currentTourIndex === generatedScheduleTours.length - 1) {
      // If we are at the last pre-generated tour, and time is NOT up, we can generate more.
      nextButtonText = "Générer le prochain tour";
  }


  const displayMessage = useCallback(() => {
    if (!selectedTournament) {
        return "Veuillez sélectionner une rencontre.";
    }
    if (generatedScheduleTours.length === 0) {
        return "Aucun tableau des matchs généré."; // Updated text
    }

    // Use the memoized currentTour
    if (!currentTour) {
        return "Aucun tour en cours ou à venir."; // Fallback if currentTour is null
    }

    // Case 1: Tournament is truly finished based on time
    if (isTournamentFinishedState) {
        return "Rencontre terminée ! Le temps de jeu est écoulé.";
    }

    // Case 2: Current tour is completed, and there are more pre-generated tours
    if (currentTour && currentTour.isCompleted && currentTourIndex < generatedScheduleTours.length - 1) {
        return "Tour terminé ! Pensez à saisir les scores et passez au tour suivant.";
    }

    // Case 3: All pre-generated tours are done, but more can be generated (time allows)
    if (currentTourIndex >= generatedScheduleTours.length - 1 && !isTournamentFinishedState) {
        // This means we are at the last pre-generated tour, or beyond, and time still permits
        return "Prêt à générer le prochain tour.";
    }

    // Default cases for active/paused tour
    if (timerMode === 'global') {
      if (isRunning) {
          return "Match en cours...";
      } else if (timer > 0) {
          return "Tour en pause.";
      } else {
          return "Tour prêt à démarrer."; // This covers the initial state of a tour
      }
    } else { // individual mode
      const anyMatchRunning = Object.values(matchTimers).some(t => t.isRunning);
      if (anyMatchRunning) {
        return "Matchs individuels en cours...";
      } else {
        return "Mode matchs individuels : prêts à démarrer ou en pause.";
      }
    }
  }, [selectedTournament, generatedScheduleTours.length, currentTourIndex, isRunning, timer, isTournamentFinishedState, timerMode, matchTimers, currentTour]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-4 sm:p-8 flex flex-col items-center font-inter">
      {/* Top "Retour à l'accueil" button */}
      <div className="w-full flex justify-start mb-4">
        <button
          onClick={() => onNavigate('home')}
          className="bg-transparent border border-white text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
        >
          Retour à l'accueil
        </button>
      </div>
      <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 sm:p-10 max-w-4xl w-full border border-white border-opacity-30">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Planification des rencontres</h2>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full sm:w-1/2">
            <label htmlFor="selectTournament" className="block text-lg font-medium mb-1">Sélectionner une rencontre</label>
            <select
              id="selectTournament"
              value={selectedTournament ? selectedTournament.id : ''}
              onChange={(e) => {
                // Notify App component of the selection
                onSelectTournament(tournaments.find(t => t.id === e.target.value));
              }}
              className="w-full p-3 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              {tournaments.length === 0 ? (
                <option value="" className="bg-indigo-700 text-white">Aucune rencontre disponible</option>
              ) : (
                tournaments.map(t => (
                  <option key={t.id} value={t.id} className="bg-indigo-700 text-white">{t.name}</option>
                ))
              )}
            </select>
          </div>
          {showGenerateButton && (
            <button
              onClick={generateMatchSchedule}
              className="bg-white text-indigo-700 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
            >
              {generateButtonText}
            </button>
          )}
        </div>

        <p className="text-center text-yellow-300 mb-4">{displayMessage()}</p>

        {/* Display players on bench only when a tournament is selected AND (timer is running OR timer is paused) AND a schedule exists */}
        {(isRunning || timer > 0 || (currentTourIndex < generatedScheduleTours.length && !isTournamentFinishedState)) && selectedTournament && generatedScheduleTours.length > 0 && (
          <div className="bg-yellow-400 text-yellow-900 p-3 rounded-lg mb-4 text-center">
            {playersOnBenchNames.length > 0 ? (
              <p className="font-semibold">Joueurs sur le banc : {playersOnBenchNames.join(', ')}</p>
            ) : (
              <p className="font-semibold">Aucun joueur sur le banc.</p>
            )}
          </div>
        )}

        {/* Timer management buttons moved here */}
        {(selectedTournament && generatedScheduleTours.length > 0 && currentTourIndex < generatedScheduleTours.length) && (
          <div className="flex flex-wrap justify-center gap-4 mt-4 mb-8">
            {timerMode === 'global' && (
              <button
                onClick={toggleStartPauseResume}
                className={`font-bold py-2 px-5 rounded-full shadow-md transition duration-300 focus:outline-none focus:ring-2
                  ${isRunning ? 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400' : 'bg-green-500 hover:bg-green-600 focus:ring-green-400'}
                  text-white`}
              >
                {mainButtonText}
              </button>
            )}
            <button
              onClick={resetMatchTimer}
              className="bg-gray-500 text-white font-bold py-2 px-5 rounded-full shadow-md hover:bg-gray-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Réinitialiser le tour
            </button>
            <button
              onClick={() => setShowTimerOptionsModal(true)}
              className="bg-purple-500 text-white font-bold py-2 px-5 rounded-full shadow-md hover:bg-purple-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {timerMode === 'global' ? 'Gérer les chronos' : 'Changer de mode Chrono'}
            </button>
          </div>
        )}


        {currentTour ? ( /* Use currentTour here */
          <div className="mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-center">Tour {currentTourIndex + 1} : Match en cours</h3>
            <div className="bg-white bg-opacity-15 p-6 rounded-lg shadow-md border border-white border-opacity-20 text-center">
              <p className="text-xl mb-2">Heure de début: <span className="font-bold">{currentTour.startTime}</span> - Heure de fin: <span className="font-bold">{currentTour.endTime}</span></p>

              {timerMode === 'global' ? (
                <div className="my-6">
                  <p className="text-5xl font-extrabold text-shadow-lg">{formatTime(timer)}</p>
                  {selectedTournament && (
                    <p className="text-lg opacity-80 mt-2">Temps de pause entre les tours: {selectedTournament.breakDuration} minutes</p>
                  )}
                </div>
              ) : (
                <p className="text-lg opacity-80 mt-2 mb-4">Gestion des chronos individuels</p>
              )}


              {currentTour.matches.length > 0 ? (
                  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${selectedTournament.numCourts > 3 ? 3 : selectedTournament.numCourts} gap-4 mt-4`}>
                      {currentTour.matches.map((matchItem, idx) => { /* Renamed 'match' to 'matchItem' to avoid potential ESLint confusion */
                          const isMatchCompleted = matchItem.scoreTeam1 !== null && matchItem.scoreTeam2 !== null;
                          const currentMatchTimer = matchTimers[matchItem.id];
                          const isMatchTimerRunning = currentMatchTimer?.isRunning || false;
                          const matchTimeLeft = currentMatchTimer?.timeLeft ?? (selectedTournament ? selectedTournament.matchDuration * 60 : 0); // Fallback if selectedTournament is null

                          return (
                          <div key={matchItem.id} className="bg-white bg-opacity-20 p-4 rounded-lg shadow-inner relative">
                              {isMatchCompleted && (
                                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">Terminé</span>
                              )}
                              <p className="text-lg font-semibold mb-2 flex items-center justify-center">
                                Terrain {matchItem.court}
                                <img
                                  src={`/86637.png`}
                                  alt="Terrain de sport"
                                  className="w-6 h-6 ml-2 inline-block"
                                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/24x24/cccccc/ffffff?text=?" }}
                                />
                              </p>
                              <div className="flex flex-col gap-2">
                                  <div className="bg-blue-700 bg-opacity-70 p-2 rounded-md">
                                      <p className="font-bold text-lg">{matchItem.team1.join(' & ')}</p>
                                  </div>
                                  <p className="text-xl font-bold text-gray-200">Contre</p>
                                  <div className="bg-red-700 bg-opacity-70 p-2 rounded-md">
                                      <p className="font-bold text-lg">{matchItem.team2.join(' & ')}</p>
                                  </div>
                                  {/* Score input fields */}
                                  <div className="mt-2">
                                    <p className="text-sm font-semibold mb-1">Score</p>
                                    <div className="flex justify-center items-center gap-2">
                                        <input
                                            type="number"
                                            value={matchItem.scoreTeam1 !== null ? matchItem.scoreTeam1 : ''}
                                            onChange={(e) => handleMatchScoreChange(idx, 'team1', e.target.value)}
                                            className="w-16 p-1 rounded-md bg-white bg-opacity-30 border border-white border-opacity-40 text-white focus:outline-none focus:ring-1 focus:ring-white custom-number-input"
                                            placeholder=""
                                            disabled={isMatchTimerRunning}
                                        />
                                        <span className="xl">-</span>
                                        <input
                                            type="number"
                                            value={matchItem.scoreTeam2 !== null ? matchItem.scoreTeam2 : ''}
                                            onChange={(e) => handleMatchScoreChange(idx, 'team2', e.target.value)}
                                            className="w-16 p-1 rounded-md bg-white bg-opacity-30 border border-white border-opacity-40 text-white focus:outline-none focus:ring-1 focus:ring-white custom-number-input"
                                            placeholder=""
                                            disabled={isMatchTimerRunning}
                                        />
                                    </div>
                                  </div>
                                  {/* Individual Timer and Controls */}
                                  {timerMode === 'individual' && (
                                    <div className="mt-4">
                                      <p className="text-3xl font-extrabold text-shadow-lg">{formatTime(matchTimeLeft)}</p>
                                      <div className="flex justify-center gap-2 mt-2">
                                        <button
                                          onClick={() => handleIndividualTimerToggle(matchItem.id)}
                                          className={`font-bold py-1 px-3 rounded-full text-xs shadow-md transition duration-300
                                            ${isMatchTimerRunning ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'}
                                            text-white`}
                                        >
                                          {isMatchTimerRunning ? 'Pause' : 'Démarrer'}
                                        </button>
                                        <button
                                          onClick={() => handleIndividualTimerReset(matchItem.id)}
                                          className="bg-gray-500 text-white font-bold py-1 px-3 rounded-full text-xs shadow-md hover:bg-gray-600 transition duration-300"
                                        >
                                          Réinitialiser
                                        </button>
                                      </div>
                                    </div>
                                  )}
                              </div>
                          </div>
                          );})}
                  </div>
              ) : (
                  <p className="text-center text-lg opacity-80 mt-4">Aucun match n'a pu être formé pour ce tour.</p>
              )}


              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePreviousTour}
                  disabled={currentTourIndex === 0}
                  className={`bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-md ${currentTourIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-800'} transition duration-300`}
                >
                  Match Précédent
                </button>
                <button
                  onClick={requestNextTour} // Use confirmation
                  disabled={isNextButtonDisabled} // Use the new derived state
                  className={`bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-md ${isNextButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-800'} transition duration-300`}
                >
                  {nextButtonText}
                </button>
              </div>
            </div>
          </div>
        ) : (
            <p className="text-center opacity-80">Aucun tableau des matchs généré ou la rencontre est terminée.</p>
        )}


        <div className="flex justify-center mt-8">
          <button
            onClick={() => onNavigate('matchHistory')}
            className="bg-white text-indigo-700 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            Matchs à venir & Historique
          </button>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => onNavigate('tournamentSetup')} // Changed navigation
            className="bg-transparent border border-white text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            Retour à la configuration des rencontres
          </button>
          <button
            onClick={() => onNavigate('results')}
            className="bg-white text-indigo-700 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            Voir les résultats
          </button>
        </div>
      </div>
      <div className="fixed bottom-4 right-4 bg-white bg-opacity-30 text-white text-sm py-2 px-4 rounded-full shadow-lg">
        {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white bg-opacity-95 rounded-xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-gray-900 text-center">
            <h3 className="text-xl font-bold mb-4">Confirmer l'action</h3>
            <p className="mb-6">
              {confirmationAction === 'nextTour'
                ? "Êtes-vous sûr de vouloir passer au tour suivant ? Le tour actuel sera marqué comme terminé. N'oubliez pas de saisir les scores !"
                : "Cette action n'est pas disponible." // Should not be reached
              }
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirmAction}
                className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500"
              >
                Confirmer
              </button>
              <button
                onClick={handleCancelConfirmation}
                className="bg-gray-400 text-gray-800 font-bold py-2 px-5 rounded-full shadow-lg hover:bg-gray-500 transition duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timer Options Modal */}
      {showTimerOptionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white bg-opacity-95 rounded-xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-gray-900 text-center">
            <h3 className="text-xl font-bold mb-4">Options du Chrono</h3>
            <p className="mb-6">Comment souhaitez-vous gérer le temps des matchs ?</p>
            <div className="flex flex-col gap-4">
              <button
                onClick={handleStartTourTimer}
                className="bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-green-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-green-500"
              >
                Démarrer le chrono du tour (Global)
              </button>
              <button
                onClick={handleManageIndividualMatches}
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500"
              >
                Gérer les matchs individuellement (Multi-Chrono)
              </button>
              <button
                onClick={() => setShowTimerOptionsModal(false)}
                className="bg-gray-400 text-gray-800 font-bold py-2 px-5 rounded-full shadow-lg hover:bg-gray-500 transition duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour les résultats
const ResultsPage = ({ onNavigate }) => {
  const { tournaments, getMatchesForTournament, updateMatchScore } = useLocalData();
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [matches, setMatches] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [message, setMessage] = useState('');

  // Efface le message après 3 secondes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Charger les tournois disponibles
  useEffect(() => {
    if (tournaments.length > 0 && !selectedTournamentId) {
      setSelectedTournamentId(tournaments[0].id);
    }
  }, [tournaments, selectedTournamentId]);

  // Charger les matchs et calculer le classement pour le tournoi sélectionné
  useEffect(() => {
    if (selectedTournamentId) {
      const fetchedMatches = getMatchesForTournament(selectedTournamentId);
      setMatches(fetchedMatches);
      calculateRanking(fetchedMatches);
    } else {
      setMatches([]);
      setRanking([]);
    }
  }, [selectedTournamentId, tournaments, getMatchesForTournament]); // Added tournaments to trigger re-render on tournament changes

  const calculateRanking = (matchesData) => {
    const playerStats = {}; // { playerName: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 } }

    matchesData.forEach(match => {
      if (match.scoreTeam1 !== null && match.scoreTeam2 !== null) {
        const team1Players = match.team1;
        const team2Players = match.team2;
        const score1 = parseInt(match.scoreTeam1);
        const score2 = parseInt(match.scoreTeam2);

        // Mettre à jour les statistiques pour chaque joueur de l'équipe 1
        team1Players.forEach(player => {
          if (!playerStats[player]) {
            playerStats[player] = { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 };
          }
          playerStats[player].pointsFor += score1;
          playerStats[player].pointsAgainst += score2;
          if (score1 > score2) {
            playerStats[player].wins += 1;
          } else if (score1 < score2) {
            playerStats[player].losses += 1;
          }
        });

        // Mettre à jour les statistiques pour chaque joueur de l'équipe 2
        team2Players.forEach(player => {
          if (!playerStats[player]) {
            playerStats[player] = { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 };
          }
          playerStats[player].pointsFor += score2;
          playerStats[player].pointsAgainst += score1;
          if (score2 > score1) {
            playerStats[player].wins += 1;
          } else if (score2 < score1) {
            playerStats[player].losses += 1;
          }
        });
      }
    });

    const sortedRanking = Object.keys(playerStats).map(playerName => ({
      name: playerName,
      ...playerStats[playerName],
      scoreDifference: playerStats[playerName].pointsFor - playerStats[playerName].pointsAgainst
    })).sort((a, b) => {
      // Trier par victoires (décroissant), puis par différence de score (décroissant), puis par points marqués (décroissant)
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.scoreDifference !== a.scoreDifference) return b.scoreDifference - a.scoreDifference;
      return b.pointsFor - a.pointsFor;
    });

    setRanking(sortedRanking);
  };

  const handleScoreChange = (matchId, team, score) => {
    // Permettre une chaîne vide pour l'édition temporaire, mais convertir en null pour le stockage si vide
    const scoreValue = score === '' ? null : parseInt(score);

    if (score !== '' && isNaN(scoreValue)) { // Vérifier si ce n'est pas vide et pas un nombre valide
      setMessage("Veuillez entrer un nombre valide.");
      return;
    }
    updateMatchScore(selectedTournamentId, matchId, team, scoreValue);
    setMessage("Score mis à jour !");
  };

  const shareResults = (platform) => {
    try {
      let resultsHtml = '';
      let resultsText = '';

      // Tournament Name
      const tournamentName = tournaments.find(t => t.id === selectedTournamentId)?.name || 'N/A';
      resultsText += `*Résultats de la rencontre "${tournamentName}"*\n\n`; // Bold for WhatsApp
      resultsHtml += `<h1 style="color:#333; text-align:center; margin-bottom:20px; font-family:'Inter', sans-serif;">Résultats de la rencontre: ${tournamentName}</h1>`;

      // Player Ranking
      resultsText += "📊 *Classement des joueurs :*\n";
      resultsHtml += `<h2 style="color:#4a4a4a; margin-top:30px; margin-bottom:15px; text-align:center; font-family:'Inter', sans-serif;">Classement des joueurs</h2>`;
      if (ranking.length === 0) {
        resultsText += "Aucun classement disponible.\n";
        resultsHtml += `<p style="text-align:center; color:#666; font-family:'Inter', sans-serif;">Aucun classement disponible.</p>`;
      } else {
        resultsHtml += `<table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-family:'Inter', sans-serif;">`;
        resultsHtml += `<thead><tr style="background-color:#e0e7ff;"><th style="padding:10px; border:1px solid #ccc; text-align:left;">Rang</th><th style="padding:10px; border:1px solid #ccc; text-align:left;">Joueur</th><th style="padding:10px; border:1px solid #ccc; text-align:left;">Victoires</th><th style="padding:10px; border:1px solid #ccc; text-align:left;">Défaites</th><th style="padding:10px; border:1px solid #ccc; text-align:left;">Diff. Score</th></tr></thead><tbody>`;
        ranking.forEach((player, index) => {
          resultsText += `${index + 1}. ${player.name} - Victoires: ${player.wins}, Diff. Score: ${player.scoreDifference}\n`;
          resultsHtml += `<tr style="background-color:${index % 2 === 0 ? '#f0f4ff' : '#ffffff'};"><td style="padding:10px; border:1px solid #ccc;">${index + 1}</td><td style="padding:10px; border:1px solid #ccc;">${player.name}</td><td style="padding:10px; border:1px solid #ccc;">${player.wins}</td><td style="padding:10px; border:1px solid #ccc;">${player.losses}</td><td style="padding:10px; border:1px solid #ccc;">${player.scoreDifference}</td></tr>`;
        });
        resultsHtml += `</tbody></table>`;
      }

      if (platform === 'whatsapp') {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(resultsText)}`;
        window.open(whatsappUrl, '_blank');
      } else if (platform === 'pdf') {
        const newWindow = window.open();
        newWindow.document.write(`
          <html>
            <head>
              <title>MatchPlanner - Résultats</title>
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">
              <style>
                body { font-family: 'Inter', sans-serif; padding: 20px; color: #333; line-height: 1.6; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;}
                th, td { padding: 12px 15px; border: 1px solid #e0e0e0; text-align: left; }
                th { background-color: #6366f1; color: white; font-weight: 700; text-transform: uppercase; }
                tr:nth-child(even) { background-color: #f8faff; }
                tr:hover { background-color: #eef2ff; }
                h1, h2 { color: #333; text-align: center; margin-bottom: 15px; font-weight: 800; }
                h1 { font-size: 28px; color: #4338ca; }
                h2 { font-size: 22px; color: #4f46e5; border-bottom: 2px solid #a5b4fc; padding-bottom: 5px; display: inline-block; }
                .container { max-width: 800px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
              </style>
            </head>
            <body>
              <div class="container">
                ${resultsHtml}
              </div>
            </body>
          </html>
        `);
        newWindow.document.close();
        newWindow.print();
      } else if (platform === 'clipboard') {
        try {
          const tempTextArea = document.createElement('textarea');
          tempTextArea.value = resultsText;
          document.body.appendChild(tempTextArea);
          tempTextArea.select();
          document.execCommand('copy');
          document.body.removeChild(tempTextArea);
          setMessage("Résultats copiés dans le presse-papiers !");
        } catch (err) {
          console.error('Impossible de copier les résultats', err);
          setMessage("Échec de la copie des résultats.");
        }
      }
    } catch (error) {
      console.error("Erreur lors du partage des résultats:", error);
      setMessage(`Erreur lors du partage des résultats: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 sm:p-8 flex flex-col items-center font-inter">
      {/* Top "Retour à l'accueil" button */}
      <div className="w-full flex justify-start mb-4">
        <button
          onClick={() => onNavigate('home')}
          className="bg-transparent border border-white text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
        >
          Retour à l'accueil
        </button>
      </div>
      <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 sm:p-10 max-w-4xl w-full text-center border border-white border-opacity-30">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Résultats et Classement</h2>

        <div className="mb-6">
          <label htmlFor="selectTournamentResults" className="block text-lg font-medium mb-1">Sélectionner une rencontre</label>
          <select
            id="selectTournamentResults"
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="w-full p-3 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 text-white focus:outline-none focus:ring-2 focus:ring-white"
          >
            {tournaments.length === 0 ? (
              <option value="" className="bg-indigo-700 text-white">Aucune rencontre disponible</option>
            ) : (
              tournaments.map(t => (
                <option key={t.id} value={t.id} className="bg-indigo-700 text-white">{t.name}</option>
              ))
            )}
          </select>
        </div>

        {message && (
          <p className="text-center text-yellow-300 mb-4">{message}</p>
        )}

        {selectedTournamentId && (
          <>
            <h3 className="text-2xl font-bold mb-4 text-center">Scores des matchs</h3>
            {matches.length === 0 ? (
              <p className="text-center opacity-80 mb-6">Aucun match enregistré pour cette rencontre.</p>
            ) : (
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full bg-white bg-opacity-15 rounded-lg shadow-md">
                  <thead>
                    <tr className="bg-white bg-opacity-20">
                      <th className="py-3 px-4 text-left text-sm font-semibold">Tour</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Terrain</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Équipe 1</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Score</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Équipe 2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map(match => (
                      <tr key={match.id} className="border-t border-white border-opacity-10">
                        <td className="py-3 px-4">{match.tour}</td>
                        <td className="py-3 px-4">{match.court}</td>
                        <td className="py-3 px-4">{match.team1.join(' & ')}</td>
                        <td className="py-3 px-4 flex items-center gap-2">
                          <input
                            type="number"
                            value={match.scoreTeam1 !== null ? match.scoreTeam1 : ''} // Afficher vide si null
                            onChange={(e) => handleScoreChange(match.id, 'team1', e.target.value)}
                            className="w-16 p-1 rounded-md bg-white bg-opacity-30 border border-white border-opacity-40 text-white focus:outline-none focus:ring-1 focus:ring-white custom-number-input"
                            placeholder=""
                          />
                          <span>-</span>
                          <input
                            type="number"
                            value={match.scoreTeam2 !== null ? match.scoreTeam2 : ''} // Afficher vide si null
                            onChange={(e) => handleScoreChange(match.id, 'team2', e.target.value)}
                            className="w-16 p-1 rounded-md bg-white bg-opacity-30 border border-white border-opacity-40 text-white focus:outline-none focus:ring-1 focus:ring-white custom-number-input"
                            placeholder=""
                          />
                        </td>
                        <td className="py-3 px-4">{match.team2.join(' & ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h3 className="text-2xl font-bold mb-4 text-center">Classement des joueurs</h3>
            {ranking.length === 0 ? (
              <p className="text-center opacity-80 mb-6">Aucun classement disponible. Saisissez les scores des matchs.</p>
            ) : (
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full bg-white bg-opacity-15 rounded-lg shadow-md">
                  <thead>
                    <tr className="bg-white bg-opacity-20">
                      <th className="py-3 px-4 text-left text-sm font-semibold">Rang</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Joueur</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Victoires</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Défaites</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Points Pour</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Points Contre</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Diff. Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((player, index) => (
                      <tr key={player.name} className="border-t border-white border-opacity-10">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 font-semibold">{player.name}</td>
                        <td className="py-3 px-4">{player.wins}</td>
                        <td className="py-3 px-4">{player.losses}</td>
                        <td className="py-3 px-4">{player.pointsFor}</td>
                        <td className="py-3 px-4">{player.pointsAgainst}</td>
                        <td className="py-3 px-4">{player.scoreDifference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button
                onClick={() => shareResults('whatsapp')}
                className="bg-green-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-green-600 transition duration-300 focus:outline-none focus:ring-4 focus:ring-green-400"
              >
                Partager sur WhatsApp
              </button>
              <button
                onClick={() => shareResults('pdf')}
                className="bg-red-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-red-600 transition duration-300 focus:outline-none focus:ring-4 focus:ring-red-400"
              >
                Exporter en PDF
              </button>
              <button
                onClick={() => shareResults('clipboard')}
                className="bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400"
              >
                Copier les résultats
              </button>
            </div>
          </>
        )}

        <div className="flex justify-center mt-8 gap-4">
          <button
            onClick={() => onNavigate('matchSchedule')}
            className="bg-white text-indigo-700 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            Planification des rencontres
          </button>
        </div>
      </div>
      {/* Bottom "Retour à l'accueil" button */}
      <div className="w-full flex justify-center mt-8">
        <button
          onClick={() => onNavigate('home')}
          className="bg-transparent border border-white text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};


// Composant pour l'historique des matchs
const MatchHistoryPage = ({ onNavigate }) => {
  const { tournaments, getMatchesForTournament } = useLocalData();
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [allMatches, setAllMatches] = useState([]);
  const [message, setMessage] = useState('');

  // Efface le message après 3 secondes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (tournaments.length > 0 && !selectedTournamentId) {
      setSelectedTournamentId(tournaments[0].id);
    }
  }, [tournaments, selectedTournamentId]);

  useEffect(() => {
    if (selectedTournamentId) {
      const fetchedMatches = getMatchesForTournament(selectedTournamentId);
      // Sort by tour then by court
      setAllMatches(fetchedMatches.sort((a, b) => a.tour - b.tour || a.court - b.court));
    } else {
      setAllMatches([]);
    }
  }, [selectedTournamentId, tournaments, getMatchesForTournament]);

  const pastMatches = allMatches.filter(match => {
    // A match is considered "past" if both scores are entered.
    return match.scoreTeam1 !== null && match.scoreTeam2 !== null;
  });

  const upcomingMatches = allMatches.filter(match => {
    // A match is considered "upcoming" if at least one score is null.
    return match.scoreTeam1 === null || match.scoreTeam2 === null;
  });


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-4 sm:p-8 flex flex-col items-center font-inter">
      {/* Top "Retour à l'accueil" button */}
      <div className="w-full flex justify-start mb-4">
        <button
          onClick={() => onNavigate('home')}
          className="bg-transparent border border-white text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
        >
          Retour à l'accueil
        </button>
      </div>
      <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 sm:p-10 max-w-4xl w-full border border-white border-opacity-30">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Historique des Matchs</h2>

        <div className="mb-6">
          <label htmlFor="selectTournamentHistory" className="block text-lg font-medium mb-1">Sélectionner une rencontre</label>
          <select
            id="selectTournamentHistory"
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="w-full p-3 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 text-white focus:outline-none focus:ring-2 focus:ring-white"
          >
            {tournaments.length === 0 ? (
              <option value="" className="bg-indigo-700 text-white">Aucune rencontre disponible</option>
            ) : (
              tournaments.map(t => (
                <option key={t.id} value={t.id} className="bg-indigo-700 text-white">{t.name}</option>
              ))
            )}
          </select>
        </div>

        {message && (
          <p className="text-center text-yellow-300 mb-4">{message}</p>
        )}

        {selectedTournamentId && (
          <>
            <h3 className="text-2xl font-bold mb-4 text-center">Matchs à venir ({upcomingMatches.length})</h3>
            {upcomingMatches.length === 0 ? (
              <p className="text-center opacity-80 mb-6">Aucun match à venir pour cette rencontre.</p>
            ) : (
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full bg-white bg-opacity-15 rounded-lg shadow-md">
                  <thead>
                    <tr className="bg-white bg-opacity-20">
                      <th className="py-3 px-4 text-left text-sm font-semibold">Tour</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Terrain</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Équipe 1</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Équipe 2</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Heure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingMatches.map(match => (
                      <tr key={match.id} className="border-t border-white border-opacity-10">
                        <td className="py-3 px-4">{match.tour}</td>
                        <td className="py-3 px-4">{match.court}</td>
                        <td className="py-3 px-4">{match.team1.join(' & ')}</td>
                        <td className="py-3 px-4">{match.team2.join(' & ')}</td>
                        <td className="py-3 px-4">{match.startTime} - {match.endTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h3 className="text-2xl font-bold mb-4 text-center">Matchs passés ({pastMatches.length})</h3>
            {pastMatches.length === 0 ? (
              <p className="text-center opacity-80 mb-6">Aucun match passé pour cette rencontre.</p>
            ) : (
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full bg-white bg-opacity-15 rounded-lg shadow-md">
                  <thead>
                    <tr className="bg-white bg-opacity-20">
                      <th className="py-3 px-4 text-left text-sm font-semibold">Tour</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Terrain</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Équipe 1</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Score</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">Équipe 2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastMatches.map(match => (
                      <tr key={match.id} className="border-t border-white border-opacity-10">
                        <td className="py-3 px-4">{match.tour}</td>
                        <td className="py-3 px-4">{match.court}</td>
                        <td className="py-3 px-4">{match.team1.join(' & ')}</td>
                        <td className="py-3 px-4 font-bold">{match.scoreTeam1} - {match.scoreTeam2}</td>
                        <td className="py-3 px-4">{match.team2.join(' & ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <div className="flex justify-center mt-8 gap-4">
          <button
            onClick={() => onNavigate('matchSchedule')}
            className="bg-white text-indigo-700 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            Planification des rencontres
          </button>
        </div>
      </div>
      {/* Bottom "Retour à l'accueil" button */}
      <div className="w-full flex justify-center mt-8">
        <button
          onClick={() => onNavigate('home')}
          className="bg-transparent border border-white text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};


// Composant de gestion des tournois existants
const ManageTournaments = ({ onNavigate, onOpenPlayerSelectionModal, selectedPlayerIdsForCurrentTournament, setSelectedPlayerIdsForCurrentTournament }) => {
  const { tournaments, deleteTournament, updateTournament, playerGroups, players } = useLocalData();
  const [message, setMessage] = useState('');
  const [editingTournament, setEditingTournament] = useState(null);

  // Efface le message après 3 secondes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleDeleteTournament = (tournamentId) => {
    deleteTournament(tournamentId);
    setMessage("Rencontre supprimée avec succès !");
  };

  const handleEditTournament = (tournament) => {
    // Initialiser les champs numériques à leur valeur ou à une chaîne vide si null/undefined
    setEditingTournament({
      ...tournament,
      numPlayers: tournament.numPlayers !== undefined && tournament.numPlayers !== null ? String(tournament.numPlayers) : '',
      numCourts: tournament.numCourts !== undefined && tournament.numCourts !== null ? String(tournament.numCourts) : '',
      matchDuration: tournament.matchDuration !== undefined && tournament.matchDuration !== null ? String(tournament.matchDuration) : '',
      breakDuration: tournament.breakDuration !== undefined && tournament.breakDuration !== null ? String(tournament.breakDuration) : '',
      startTime: tournament.startTime || '', // Load start time string
      endTime: tournament.endTime || '',      // Load end time string
      selectedGroupForTournament: tournament.selectedGroupForTournament || '', // Ensure it's a string for select
      numPlayersPerTeam: tournament.numPlayersPerTeam !== undefined && tournament.numPlayersPerTeam !== null ? String(tournament.numPlayersPerTeam) : '', // Initialiser la nouvelle prop
      selectedPlayerIds: tournament.selectedPlayerIds || [] // Initialiser les IDs des joueurs sélectionnés
    });
  };

  const handleSaveEditedTournament = () => {
    if (!editingTournament) {
      setMessage("Aucune rencontre en édition.");
      return;
    }

    // Convertir les valeurs en nombres pour la validation et la sauvegarde
    const parsedNumPlayers = editingTournament.selectedPlayerIds.length; // Now directly from selectedPlayerIds
    const parsedNumCourts = parseInt(editingTournament.numCourts);
    const parsedMatchDuration = parseInt(editingTournament.matchDuration);
    const parsedBreakDuration = parseInt(parseInt(editingTournament.breakDuration)); // Ensure it's parsed as int
    const parsedNumPlayersPerTeam = parseInt(editingTournament.numPlayersPerTeam); // Nouvelle parsing

    if (
      !editingTournament.name.trim() ||
      isNaN(parsedNumPlayers) || parsedNumPlayers <= 0 ||
      isNaN(parsedNumCourts) || parsedNumCourts <= 0 ||
      isNaN(parsedMatchDuration) || parsedMatchDuration <= 0 ||
      isNaN(parsedBreakDuration) || parsedBreakDuration < 0 || // La durée de pause peut être 0
      !editingTournament.startTime.trim() || !editingTournament.endTime.trim() || // New validation for start/end times
      isNaN(parsedNumPlayersPerTeam) || parsedNumPlayersPerTeam <= 0 // Nouvelle validation
    ) {
      setMessage("Veuillez remplir tous les champs obligatoires avec des valeurs numériques valides et positives (la durée de pause peut être zéro) et spécifier les heures de début et de fin.");
      return;
    }

    if (editingTournament.selectedPlayerIds.length === 0) {
        setMessage("Veuillez sélectionner au moins un joueur pour la rencontre.");
        return;
    }

    if (parsedNumPlayersPerTeam * 2 * parsedNumCourts > parsedNumPlayers) {
        setMessage(`Le nombre de joueurs (${parsedNumPlayers}) est insuffisant pour un tour complet avec ${parsedNumPlayersPerTeam} joueurs par équipe sur ${parsedNumCourts} terrains (${parsedNumPlayersPerTeam * 2 * parsedNumCourts} joueurs requis).`);
        return;
    }

    // Validate start time is before end time
    const startDateTime = new Date(`2000-01-01T${editingTournament.startTime}`);
    const endDateTime = new Date(`2000-01-01T${editingTournament.endTime}`);
    if (endDateTime <= startDateTime) {
      setMessage("L'heure de fin doit être après l'heure de début.");
      return;
    }

    try {
      updateTournament(editingTournament.id, {
        name: editingTournament.name.trim(),
        numPlayers: parsedNumPlayers, // This is now the count of selectedPlayerIds
        numCourts: parsedNumCourts,
        matchDuration: parsedMatchDuration,
        breakDuration: parsedBreakDuration,
        startTime: editingTournament.startTime.trim(), // Save start time string
        endTime: editingTournament.endTime.trim(),      // Save end time string
        balanceTeamsByLevel: editingTournament.balanceTeamsByLevel,
        selectedGroupForTournament: editingTournament.selectedGroupForTournament || null, // Save selected group ID
        numPlayersPerTeam: parsedNumPlayersPerTeam, // Sauvegarde de la nouvelle prop
        selectedPlayerIds: editingTournament.selectedPlayerIds // Sauvegarde des IDs des joueurs sélectionnés
      });
      setMessage("Rencontre mise à jour avec succès !");
      setEditingTournament(null); // Quitter le mode édition
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la rencontre :", error);
      setMessage("Erreur lors de la mise à jour de la rencontre. Veuillez réessayer.");
    }
  };

  const getGroupName = (groupId) => {
    const group = playerGroups.find(g => g.id === groupId);
    return group ? group.name : 'Aucun groupe';
  };

  const handleEditPlayerSelection = (tournament) => {
    // Set the editing tournament and open the modal
    setEditingTournament({
      ...tournament,
      numPlayers: String(tournament.numPlayers), // Ensure it's a string for the input
      numPlayersPerTeam: String(tournament.numPlayersPerTeam),
      numCourts: String(tournament.numCourts),
      matchDuration: String(tournament.matchDuration),
      breakDuration: String(tournament.breakDuration),
      startTime: tournament.startTime || '',
      endTime: tournament.endTime || '',
      selectedGroupForTournament: tournament.selectedGroupForTournament || '',
      selectedPlayerIds: tournament.selectedPlayerIds || []
    });
    // Now call the App's modal handler
    onOpenPlayerSelectionModal(tournament.selectedGroupForTournament, tournament.selectedPlayerIds, (newSelectedIds) => {
      setEditingTournament(prev => ({
        ...prev,
        selectedPlayerIds: newSelectedIds,
        numPlayers: String(newSelectedIds.length)
      }));
      setMessage("Sélection des joueurs mise à jour pour la modification !");
    });
  };

  const handleLoadTournament = (tournament) => {
    onNavigate('matchSchedule', { selectedTournament: tournament });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-4 sm:p-8 flex flex-col items-center font-inter">
      {/* Top "Retour à l'accueil" button */}
      <div className="w-full flex justify-start mb-4">
        <button
          onClick={() => onNavigate('home')}
          className="bg-transparent border border-white text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
        >
          Retour à l'accueil
        </button>
      </div>
      <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 sm:p-10 max-w-4xl w-full border border-white border-opacity-30">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Gérer les rencontres existantes</h2>

        {message && (
          <p className="text-center text-yellow-300 mb-4">{message}</p>
        )}

        {tournaments.length === 0 ? (
          <p className="text-center opacity-80 mb-6">Aucune rencontre créée pour le moment.</p>
        ) : (
          <ul className="space-y-4 mb-8 max-h-96 overflow-y-auto pr-2">
            {tournaments.map(tournament => (
              <li key={tournament.id} className="bg-white bg-opacity-15 p-4 rounded-lg shadow-md border border-white border-opacity-20">
                {editingTournament && editingTournament.id === tournament.id ? (
                  // Formulaire d'édition
                  <div className="space-y-3">
                    <div>
                      <label htmlFor={`editName-${tournament.id}`} className="block text-sm font-medium mb-1">Nom</label>
                      <input
                        type="text"
                        id={`editName-${tournament.id}`}
                        value={editingTournament.name}
                        onChange={(e) => setEditingTournament({ ...editingTournament, name: e.target.value })} // Permet la chaîne vide
                        className="w-full p-2 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor={`editGroup-${tournament.id}`} className="block text-sm font-medium mb-1">Groupe sélectionné</label>
                      <select
                        id={`editGroup-${tournament.id}`}
                        value={editingTournament.selectedGroupForTournament || ''}
                        onChange={(e) => {
                          const newGroupId = e.target.value;
                          const playersInNewGroup = players.filter(p => p.groupId === newGroupId);
                          setEditingTournament(prev => ({
                            ...prev,
                            selectedGroupForTournament: newGroupId,
                            numPlayers: String(playersInNewGroup.length), // Update numPlayers based on new group
                            selectedPlayerIds: playersInNewGroup.map(p => p.id) // Select all players in new group
                          }));
                        }}
                        className="w-full p-2 rounded-lg bg-white bg-opacity-30 border border-white bg-opacity-40 text-white"
                      >
                        <option value="" className="bg-indigo-700 text-white">Aucun groupe</option>
                        {playerGroups.map(group => (
                          <option key={group.id} value={group.id} className="bg-indigo-700 text-white">{group.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`editPlayers-${tournament.id}`} className="block text-sm font-medium mb-1">Joueurs</label>
                        <input
                          type="number"
                          id={`editPlayers-${tournament.id}`}
                          value={editingTournament.numPlayers}
                          onChange={(e) => setEditingTournament({ ...editingTournament, numPlayers: e.target.value })} // Permet la chaîne vide
                          min="0"
                          className="w-full p-2 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 text-white custom-number-input"
                          readOnly // Make it readOnly, selection is via modal
                        />
                      </div>
                      <div>
                        <label htmlFor={`editPlayersPerTeam-${tournament.id}`} className="block text-sm font-medium mb-1">Joueurs par équipe</label>
                        <input
                          type="number"
                          id={`editPlayersPerTeam-${tournament.id}`}
                          value={editingTournament.numPlayersPerTeam}
                          onChange={(e) => setEditingTournament({ ...editingTournament, numPlayersPerTeam: e.target.value })} // Permet la chaîne vide
                          min="1"
                          className="w-full p-2 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 text-white custom-number-input"
                        />
                      </div>
                    </div>
                    {editingTournament.selectedGroupForTournament && (
                      <button
                        onClick={() => handleEditPlayerSelection(editingTournament)} // Re-use the edit handler to open modal
                        className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
                      >
                        Modifier la sélection des joueurs ({editingTournament.selectedPlayerIds.length} joueurs)
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`editCourts-${tournament.id}`} className="block text-sm font-medium mb-1">Terrains</label>
                        <input
                          type="number"
                          id={`editCourts-${tournament.id}`}
                          value={editingTournament.numCourts}
                          onChange={(e) => setEditingTournament({ ...editingTournament, numCourts: e.target.value })} // Permet la chaîne vide
                          min="1"
                          className="w-full p-2 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 text-white custom-number-input"
                        />
                      </div>
                      <div>
                        <label htmlFor={`editMatchDuration-${tournament.id}`} className="block text-sm font-medium mb-1">Durée match (min)</label>
                        <input
                          type="number"
                          id={`editMatchDuration-${tournament.id}`}
                          value={editingTournament.matchDuration}
                          onChange={(e) => setEditingTournament({ ...editingTournament, matchDuration: e.target.value })} // Permet la chaîne vide
                          min="1"
                          className="w-full p-2 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 text-white custom-number-input"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`editBreakDuration-${tournament.id}`} className="block text-sm font-medium mb-1">Durée pause (min)</label>
                        <input
                          type="number"
                          id={`editBreakDuration-${tournament.id}`}
                          value={editingTournament.breakDuration}
                          onChange={(e) => setEditingTournament({ ...editingTournament, breakDuration: e.target.value })} // Permet la chaîne vide
                          min="0"
                          className="w-full p-2 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 text-white custom-number-input"
                        />
                      </div>
                      <div>
                        <label htmlFor={`editStartTime-${tournament.id}`} className="block text-sm font-medium mb-1">Heure de début</label>
                        <input
                          type="time"
                          id={`editStartTime-${tournament.id}`}
                          value={editingTournament.startTime}
                          onChange={(e) => setEditingTournament({ ...editingTournament, startTime: e.target.value })}
                          className="w-full p-2 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`editEndTime-${tournament.id}`} className="block text-sm font-medium mb-1">Heure de fin</label>
                        <input
                          type="time"
                          id={`editEndTime-${tournament.id}`}
                          value={editingTournament.endTime}
                          onChange={(e) => setEditingTournament({ ...editingTournament, endTime: e.target.value })}
                          className="w-full p-2 rounded-lg bg-white bg-opacity-30 border border-white border-opacity-40 text-white"
                        />
                      </div>
                    </div>
                    {/* Replaced checkbox with a button for editing mode */}
                    <button
                      onClick={() => setEditingTournament(prev => ({ ...prev, balanceTeamsByLevel: !prev.balanceTeamsByLevel }))}
                      className={`w-full font-bold py-2 px-4 rounded-full text-sm shadow-lg transition duration-300
                        ${editingTournament.balanceTeamsByLevel ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}
                      `}
                    >
                      Équilibrage par niveau: {editingTournament.balanceTeamsByLevel ? 'Activé' : 'Désactivé'}
                    </button>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={handleSaveEditedTournament}
                        className="bg-green-500 text-white py-2 px-4 rounded-full text-sm hover:bg-green-600 transition duration-300"
                      >
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => setEditingTournament(null)}
                        className="bg-gray-500 text-white py-2 px-4 rounded-full text-sm hover:bg-gray-600 transition duration-300"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  // Mode d'affichage
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div>
                      <p className="text-xl font-semibold">{tournament.name}</p>
                      <p className="text-sm opacity-80">Joueurs: {tournament.numPlayers} | Terrains: {tournament.numCourts}</p>
                      <p className="text-sm opacity-80">Joueurs par équipe: {tournament.numPlayersPerTeam}</p>
                      <p className="text-sm opacity-80">Durée match: {tournament.matchDuration} min | Pause: {tournament.breakDuration} min</p>
                      <p className="text-sm opacity-80">Heure: {tournament.startTime} - {tournament.endTime} | Équilibrage: {tournament.balanceTeamsByLevel ? 'Oui' : 'Non'}</p>
                      {tournament.selectedGroupForTournament && (
                        <p className="text-sm opacity-80">Groupe: {getGroupName(tournament.selectedGroupForTournament)}</p>
                      )}
                      {tournament.selectedPlayerIds && tournament.selectedPlayerIds.length > 0 && (
                        <p className="text-sm opacity-80">Joueurs sélectionnés: {tournament.selectedPlayerIds.length}</p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3 sm:mt-0">
                      <button
                        onClick={() => handleEditTournament(tournament)}
                        className="bg-blue-500 text-white py-2 px-4 rounded-full text-sm hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteTournament(tournament.id)}
                        className="bg-red-500 text-white py-2 px-4 rounded-full text-sm hover:bg-red-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                      >
                        Supprimer
                      </button>
                      <button
                        onClick={() => handleLoadTournament(tournament)}
                        className="bg-green-500 text-white py-2 px-4 rounded-full text-sm hover:bg-green-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        Charger la rencontre
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-center mt-8">
        </div>
      </div>
      {/* PlayerSelectionModal est maintenant rendu ici, au niveau de App */}
      {/* Le onSave est géré par App, qui met à jour l'état de editingTournament */}
      {/* Bottom "Retour à l'accueil" button */}
      <div className="w-full flex justify-center mt-8">
        <button
          onClick={() => onNavigate('home')}
          className="bg-transparent border border-white text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};


// Composant principal de l'application
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  // States for TournamentSetup
  const [tournamentName, setTournamentName] = useState('');
  const [numPlayers, setNumPlayers] = useState(''); // This state is now only used to reflect selectedPlayerIds.length
  const [numPlayersPerTeam, setNumPlayersPerTeam] = useState('2'); // Nouveau state pour le nombre de joueurs par équipe, par défaut 2
  const [numCourts, setNumCourts] = useState('');
  const [matchDuration, setMatchDuration] = useState('');
  const [breakDuration, setBreakDuration] = useState('');
  const [tournamentStartTime, setTournamentStartTime] = useState(''); // New state
  const [tournamentEndTime, setTournamentEndTime] = useState('');      // New state
  const [balanceTeamsByLevel, setBalanceTeamsByLevel] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [playerCountFromManagement, setPlayerCountFromManagement] = useState(0); // Removed as it was unused.
  const [selectedGroupForTournament, setSelectedGroupForTournament] = useState('');
  // Nouveau state pour stocker les IDs des joueurs sélectionnés pour la rencontre en cours de configuration/visualisation
  const [selectedPlayerIdsForCurrentTournament, setSelectedPlayerIdsForCurrentTournament] = useState([]);


  // States for MatchSchedule, managed at the App level
  const [selectedTournamentForSchedule, setSelectedTournamentForSchedule] = useState(null);
  const [generatedScheduleTours, setGeneratedScheduleTours] = useState([]);
  const [currentTourIndex, setCurrentTourIndex] = useState(0);
  const [generatedForTournamentId, setGeneratedForTournamentId] = useState(null);
  const [lastGeneratedTournamentConfig, setLastGeneratedTournamentConfig] = useState(null);

  // States for Player Selection Modal (Lifted from TournamentSetup/ManageTournaments)
  const [showPlayerSelectionModal, setShowPlayerSelectionModal] = useState(false);
  const [modalSelectedGroupId, setModalSelectedGroupId] = useState(null);
  const [modalInitialSelectedPlayerIds, setModalInitialSelectedPlayerIds] = useState([]);
  const [modalOnSaveCallback, setModalOnSaveCallback] = useState(null); // Callback to update the parent component's state


  // Use useLocalData inside the App component, after it's wrapped by LocalDataProvider
  const { tournaments, getGeneratedSchedule, players } = useLocalData(); // Added players here for modal

  // Function to open the PlayerSelectionModal
  const handleOpenPlayerSelectionModal = useCallback((groupId, initialPlayerIds, onSaveCallback) => {
    setModalSelectedGroupId(groupId);
    setModalInitialSelectedPlayerIds(initialPlayerIds);
    setModalOnSaveCallback(() => onSaveCallback); // Wrap in a new function to avoid stale closures
    setShowPlayerSelectionModal(true);
  }, []);

  // Function to handle saving from the modal
  const handleSavePlayerSelectionFromModal = useCallback((selectedIds) => {
    if (modalOnSaveCallback) {
      modalOnSaveCallback(selectedIds);
    }
    setShowPlayerSelectionModal(false);
    setModalSelectedGroupId(null);
    setModalInitialSelectedPlayerIds([]);
    setModalOnSaveCallback(null);
  }, [modalOnSaveCallback]);

  // Function to close the modal without saving
  const handleClosePlayerSelectionModal = useCallback(() => {
    setShowPlayerSelectionModal(false);
    setModalSelectedGroupId(null);
    setModalInitialSelectedPlayerIds([]);
    setModalOnSaveCallback(null);
  }, []);


  // Effect to load the schedule and selected players when selectedTournamentForSchedule changes
  useEffect(() => {
    if (selectedTournamentForSchedule) {
      const savedSchedule = getGeneratedSchedule(selectedTournamentForSchedule.id);

      // Only update if the schedule has actually changed to prevent infinite loops
      // Simple shallow comparison: check length and first element's ID
      const isScheduleDifferent = savedSchedule.length !== generatedScheduleTours.length ||
                                 (savedSchedule.length > 0 && generatedScheduleTours.length > 0 && savedSchedule[0].id !== generatedScheduleTours[0].id) ||
                                 (savedSchedule.length === 0 && generatedScheduleTours.length > 0) ||
                                 (savedSchedule.length > 0 && generatedScheduleTours.length === 0);

      if (isScheduleDifferent) {
        setGeneratedScheduleTours(savedSchedule);
        setGeneratedForTournamentId(selectedTournamentForSchedule.id);
        setLastGeneratedTournamentConfig({ ...selectedTournamentForSchedule });

        const firstUncompletedIndex = savedSchedule.findIndex(tour => !tour.isCompleted);
        const newCurrentTourIndex = firstUncompletedIndex !== -1 ? firstUncompletedIndex : savedSchedule.length;
        setCurrentTourIndex(newCurrentTourIndex);
      }
      // Load selected players for the currently selected tournament
      setSelectedPlayerIdsForCurrentTournament(selectedTournamentForSchedule.selectedPlayerIds || []);

    } else {
      // Clear all schedule related states if no tournament is selected
      if (generatedScheduleTours.length > 0 || generatedForTournamentId !== null || lastGeneratedTournamentConfig !== null) {
        setGeneratedScheduleTours([]);
        setCurrentTourIndex(0);
        setGeneratedForTournamentId(null);
        setLastGeneratedTournamentConfig(null);
      }
      setSelectedPlayerIdsForCurrentTournament([]); // Clear selected players too
    }
  }, [selectedTournamentForSchedule, getGeneratedSchedule, generatedScheduleTours, generatedForTournamentId, lastGeneratedTournamentConfig]);


  // Effect to set initial selected tournament for schedule when tournaments load or change
  useEffect(() => {
    if (tournaments.length > 0) {
      let initialTournament = null;
      // Try to find the currently selected tournament (by ID) in the updated tournaments list
      if (selectedTournamentForSchedule) {
        initialTournament = tournaments.find(t => t.id === selectedTournamentForSchedule.id);
      }

      // If no tournament was selected, or the previously selected one is no longer found,
      // or if the found tournament's config has changed from what was last generated,
      // then update selectedTournamentForSchedule. This ensures we always have the latest object.
      if (initialTournament && (initialTournament !== selectedTournamentForSchedule || !areTournamentConfigsEqual(initialTournament, selectedTournamentForSchedule))) {
        setSelectedTournamentForSchedule(initialTournament);
      } else if (!initialTournament && tournaments.length > 0) {
        // If no tournament was selected or the old one is gone, pick the first one
        setSelectedTournamentForSchedule(tournaments[0]);
      }
    } else {
      // If no tournaments exist, clear the selected tournament
      setSelectedTournamentForSchedule(null);
    }
  }, [tournaments, selectedTournamentForSchedule]); // Depend on tournaments to react to changes


  const navigateTo = (page, params = {}) => {
    setCurrentPage(page);
    if (page === 'matchSchedule' && params.selectedTournament) {
      setSelectedTournamentForSchedule(params.selectedTournament);
    }
  };

  let PageComponent;
  switch (currentPage) {
    case 'home':
      PageComponent = <HomePage onNavigate={navigateTo} />;
      break;
    case 'tournamentSetup':
      PageComponent = (
        <TournamentSetup
          onNavigate={navigateTo}
          tournamentName={tournamentName}
          setTournamentName={setTournamentName}
          numPlayers={numPlayers}
          setNumPlayers={setNumPlayers}
          numCourts={numCourts}
          setNumCourts={setNumCourts}
          matchDuration={matchDuration}
          setMatchDuration={setMatchDuration}
          breakDuration={breakDuration}
          setBreakDuration={setBreakDuration}
          tournamentStartTime={tournamentStartTime} // Pass new prop
          setTournamentStartTime={setTournamentStartTime} // Pass new prop
          tournamentEndTime={tournamentEndTime}      // Pass new prop
          setTournamentEndTime={setTournamentEndTime}      // Pass new prop
          balanceTeamsByLevel={balanceTeamsByLevel}
          setBalanceTeamsByLevel={setBalanceTeamsByLevel}
          selectedGroupForTournament={selectedGroupForTournament}
          setSelectedGroupForTournament={setSelectedGroupForTournament}
          numPlayersPerTeam={numPlayersPerTeam} // Passe la nouvelle prop
          setNumPlayersPerTeam={setNumPlayersPerTeam} // Passe le setter de la nouvelle prop
          selectedPlayerIdsForCurrentTournament={selectedPlayerIdsForCurrentTournament} // Passe la nouvelle prop
          setSelectedPlayerIdsForCurrentTournament={setSelectedPlayerIdsForCurrentTournament} // Passe le setter de la nouvelle prop
          onOpenPlayerSelectionModal={handleOpenPlayerSelectionModal} // Pass the handler to open modal
        />
      );
      break;
    case 'playerManagement':
      PageComponent = <PlayerManagement onNavigate={navigateTo} />; // Removed unused props
      break;
    case 'matchSchedule':
      PageComponent = (
        <MatchSchedule
          onNavigate={navigateTo}
          selectedTournament={selectedTournamentForSchedule} // Pass the selected tournament
          onSelectTournament={setSelectedTournamentForSchedule} // Pass setter to update App's state
          generatedScheduleTours={generatedScheduleTours}
          setGeneratedScheduleTours={setGeneratedScheduleTours}
          currentTourIndex={currentTourIndex}
          setCurrentTourIndex={setCurrentTourIndex}
          generatedForTournamentId={generatedForTournamentId}
          setGeneratedForTournamentId={setGeneratedForTournamentId}
          lastGeneratedTournamentConfig={lastGeneratedTournamentConfig}
          setLastGeneratedTournamentConfig={setLastGeneratedTournamentConfig}
          selectedPlayerIdsForCurrentTournament={selectedPlayerIdsForCurrentTournament} // Passe la nouvelle prop
        />
      );
      break;
    case 'results':
      PageComponent = <ResultsPage onNavigate={navigateTo} />;
      break;
    case 'manageTournaments':
      PageComponent = (
        <ManageTournaments
          onNavigate={navigateTo}
          onOpenPlayerSelectionModal={handleOpenPlayerSelectionModal}
          selectedPlayerIdsForCurrentTournament={selectedPlayerIdsForCurrentTournament} // Pass the state
          setSelectedPlayerIdsForCurrentTournament={setSelectedPlayerIdsForCurrentTournament} // Pass the setter
        />
      );
      break;
    case 'matchHistory':
      PageComponent = <MatchHistoryPage onNavigate={navigateTo} />;
      break;
    default:
      PageComponent = <HomePage onNavigate={navigateTo} />;
  }

  return (
    <div className="relative">
      {PageComponent}
      {showPlayerSelectionModal && (
        <PlayerSelectionModal
          allPlayers={players}
          selectedGroupId={modalSelectedGroupId}
          initialSelectedPlayerIds={modalInitialSelectedPlayerIds}
          onSave={handleSavePlayerSelectionFromModal}
          onClose={handleClosePlayerSelectionModal}
        />
      )}
    </div>
  );
};

// Export the App component wrapped with LocalDataProvider
const WrappedApp = () => (
  <LocalDataProvider>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');
      body {
        font-family: 'Inter', sans-serif;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      .text-shadow-lg {
        text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
      }
      /* Masquer les flèches (spinners) des champs de type number pour Chrome, Safari, Safari, Edge, Opera */
      .custom-number-input::-webkit-outer-spin-button,
      .custom-number-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      /* Masquer les flèches (spinners) des champs de type number pour Firefox */
      .custom-number-input {
        -moz-appearance: textfield;
      }
    `}</style>
    <App />
  </LocalDataProvider>
);

export default WrappedApp;
