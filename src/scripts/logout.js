// Simple logout utility
function handleLogout() {
  // Check if user is authenticated with Firebase
  if (firebase && firebase.auth && firebase.auth().currentUser) {
    console.log("Signing out from Firebase...");
    firebase.auth().signOut().catch(error => {
      console.error("Error signing out:", error);
    });
  }
  
  // Clear local storage
  localStorage.removeItem('user');
  console.log("User data cleared from local storage");
  
  // Redirect to login page
  window.location.href = 'login.html';
}
