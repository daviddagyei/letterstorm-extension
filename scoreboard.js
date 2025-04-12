document.addEventListener('DOMContentLoaded', function() {
  if (typeof firebase === 'undefined') {
    showError("Firebase is not loaded. Please check your connection and try again.");
    return;
  }
  
  // Get the initial active tab's mode
  const activeTab = document.querySelector('.tab.active');
  let currentMode = activeTab ? activeTab.dataset.mode : 'letterMode';
  
  // Log the initial mode
  console.log("Initial scoreboard mode:", currentMode);
  
  // Add click event listeners to all tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Update current mode from data attribute
      currentMode = tab.dataset.mode;
      console.log("Switched to mode:", currentMode);
      
      // Load scores for the selected mode
      loadScores(currentMode);
    });
  });
  
  // Initial load of scores for default mode
  loadScores(currentMode);
  
  function loadScores(mode) {
    console.log("Loading scores for mode:", mode);
    const container = document.getElementById('scoreboard-container');
    container.innerHTML = '<div class="loading">Loading scores...</div>';
    
    // Add extra validation to make sure we're using the correct mode
    if (!['letterMode', 'wordMode', 'sentenceMode', 'codeMode'].includes(mode)) {
      console.error("Invalid mode:", mode);
      mode = 'letterMode'; // Default to letterMode if invalid
    }
    
    // Debug - show what mode we're querying
    console.log("Querying Firestore with mode:", mode);
    
    firebase.firestore().collection('userScores')
      .orderBy(mode, 'desc')
      .limit(100)
      .get()
      .then(snapshot => {
        console.log(`Got ${snapshot.size} results for ${mode}`);
        
        if (snapshot.empty) {
          container.innerHTML = '<div class="error">No scores found for this mode.</div>';
          return;
        }
        
        let table = document.createElement('table');
        table.className = 'scoreboard';
        
        let header = document.createElement('tr');
        header.innerHTML = `
          <th>Rank</th>
          <th>Player</th>
          <th>Score</th>
        `;
        table.appendChild(header);
        
        let rank = 1;
        let scoresFound = false;
        
        snapshot.forEach(doc => {
          const data = doc.data();
          
          // Debug - show what we got from Firestore
          console.log(`User ${data.username || 'Unknown'} has ${mode} score: ${data[mode]}`);
          
          if (data[mode]) {
            scoresFound = true;
            const row = document.createElement('tr');
            
            let displayName = data.username || (data.email ? data.email.split('@')[0] : 'Anonymous');
            if (displayName.length > 15) {
              displayName = displayName.substring(0, 12) + '...';
            }
            
            let rankDisplay = rank.toString();
            if (rank === 1) rankDisplay = '<span class="trophy-gold">🏆 1</span>';
            else if (rank === 2) rankDisplay = '<span class="trophy-silver">🥈 2</span>';
            else if (rank === 3) rankDisplay = '<span class="trophy-bronze">🥉 3</span>';
            
            row.innerHTML = `
              <td class="rank">${rankDisplay}</td>
              <td>${displayName}</td>
              <td class="score">${data[mode]}</td>
            `;
            
            table.appendChild(row);
            rank++;
          }
        });
        
        if (!scoresFound) {
          // No scores were found for this mode specifically
          container.innerHTML = '<div class="error">No scores found for this mode.</div>';
        } else {
          container.innerHTML = '';
          container.appendChild(table);
        }
      })
      .catch(error => {
        console.error("Error getting scores:", error);
        showError("Failed to load scores. Please try again later.");
      });
  }
  
  function showError(message) {
    const container = document.getElementById('scoreboard-container');
    container.innerHTML = `<div class="error">${message}</div>`;
  }
});
