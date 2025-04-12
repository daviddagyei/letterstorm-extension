document.addEventListener('DOMContentLoaded', function() {
  if (typeof firebase === 'undefined') {
    showError("Firebase is not loaded. Please check your connection and try again.");
    return;
  }
  
  let currentMode = 'sentenceMode';
  
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      currentMode = tab.dataset.mode;
      loadScores(currentMode);
    });
  });
  
  loadScores(currentMode);
  
  function loadScores(mode) {
    const container = document.getElementById('scoreboard-container');
    container.innerHTML = '<div class="loading">Loading scores...</div>';
    
    firebase.firestore().collection('userScores')
      .orderBy(mode, 'desc')
      .limit(100)
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          container.innerHTML = '<div class="error">No scores found.</div>';
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
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data[mode]) {
            const row = document.createElement('tr');
            
            let displayName = data.email ? data.email.split('@')[0] : 'Anonymous';
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
        
        
        container.innerHTML = '';
        container.appendChild(table);
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
