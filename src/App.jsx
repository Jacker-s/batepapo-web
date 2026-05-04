import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth, database } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';

import Login from './pages/Login';
import MainApp from './pages/MainApp';

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch username
        try {
          const snapshot = await get(ref(database, `uid_to_username/${currentUser.uid}`));
          if (snapshot.exists()) {
            setUsername(snapshot.val());
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      } else {
        setUser(null);
        setUsername(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="login-screen">
        <div className="login-logo animate-fade-in">Bate Papo Anônimo</div>
        <div className="login-subtitle">Carregando...</div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            user && username ? <Navigate to="/app" /> : <Login onLogin={(uname) => setUsername(uname)} />
          } 
        />
        <Route 
          path="/app/*" 
          element={
            user && username ? <MainApp user={user} username={username} /> : <Navigate to="/" />
          } 
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
