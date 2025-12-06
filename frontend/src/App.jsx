import { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Loader2, 
  Calendar, 
  ShoppingCart, 
  Users, 
  AlertCircle,
  Coffee,
  Sun,
  Moon,
  Sparkles,
  CheckCircle
} from 'lucide-react';

const API_URL = 'http://localhost:5000';

function App() {
  const [cuisineType, setCuisineType] = useState('');
  const [dietType, setDietType] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState(null);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState(null);

  // Vérifier la connexion au serveur au démarrage
  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();
      setServerStatus(data);
      console.log('✅ Serveur connecté:', data);
    } catch (err) {
      setServerStatus({ status: 'error', message: 'Serveur non disponible' });
      console.error('❌ Erreur connexion serveur:', err);
    }
  };

 const generateMealPlan = async () => {
  // Validation des champs
  if (!cuisineType.trim()) {
    setError('Veuillez remplir le champ "Type de cuisine"');
    return;
  }
  
  if (!dietType.trim()) {
    setError('Veuillez remplir le champ "Type alimentaire"');
    return;
  }
  
  if (!restrictions.trim()) {
    setError('Veuillez remplir le champ "Restrictions / Allergies"');
    return;
  }

  console.log('🔵 Début génération du plan...');
  setLoading(true);
  setError('');
  setMealPlan(null);

  try {
    console.log('📤 Envoi requête vers:', `${API_URL}/api/generate-meal-plan`);
    console.log('📦 Données:', { cuisineType, dietType, restrictions });

    const response = await fetch(`${API_URL}/api/generate-meal-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cuisineType: cuisineType,
        dietType: dietType,
        restrictions: restrictions
      })
    });

    console.log('📥 Statut réponse:', response.status);

    const data = await response.json();
    console.log('📦 Données reçues:', data);

    if (!response.ok) {
      throw new Error(data.error || data.details || 'Erreur lors de la génération');
    }

    setMealPlan(data);
    console.log('✅ Plan de repas généré avec succès!');
  } catch (err) {
    console.error('❌ Erreur:', err);
    setError(err.message || 'Impossible de se connecter au serveur. Vérifiez que le backend est lancé.');
  } finally {
    setLoading(false);
  }
};

  // Affichage du composant principal
  return (
    <div className="min-h-screen">
      {/* Status Bar */}
      {serverStatus && (
        <div style={{
          background: serverStatus.status === 'ok' ? '#d4edda' : '#f8d7da',
          border: `2px solid ${serverStatus.status === 'ok' ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '12px',
          padding: '12px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem'
        }}>
          {serverStatus.status === 'ok' ? (
            <>
              <CheckCircle size={20} style={{ color: '#155724' }} />
              <span style={{ color: '#155724' }}>
                ✅ Serveur connecté {serverStatus.gemini_configured ? '| Gemini configuré' : '| ⚠️ Gemini non configuré'}
              </span>
            </>
          ) : (
            <>
              <AlertCircle size={20} style={{ color: '#721c24' }} />
              <span style={{ color: '#721c24' }}>
                ❌ Serveur non disponible - Lancez le backend avec: python app.py
              </span>
            </>
          )}
        </div>
      )}

      {/* Header */}
      <header style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }} className="fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '10px' }}>
          <ChefHat style={{ color: '#667eea' }} size={48} />
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            MealPlan AI
          </h1>
        </div>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Votre assistant intelligent pour planifier vos repas hebdomadaires
        </p>
      </header>

      {/* Form Section */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }} className="fade-in">
        <h2 style={{ 
          fontSize: '1.8rem', 
          marginBottom: '25px',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Sparkles style={{ color: '#667eea' }} />
          Vos Préférences
        </h2>

        <div style={{ display: 'grid', gap: '20px' }}>
  {/* Type de cuisine */}
  <div>
    <label style={{ 
      display: 'block', 
      marginBottom: '8px', 
      fontWeight: '600',
      color: '#333',
      fontSize: '1rem'
    }}>
      🍳 Type de cuisine
    </label>
    <input
      type="text"
      placeholder="Ex: marocaine, italienne, française, asiatique..."
      value={cuisineType}
      onChange={(e) => setCuisineType(e.target.value)}
      style={{
        width: '100%',
        padding: '15px',
        border: '2px solid #e0e0e0',
        borderRadius: '12px',
        fontSize: '1rem',
        transition: 'all 0.3s',
        outline: 'none'
      }}
      onFocus={(e) => e.target.style.borderColor = '#667eea'}
      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
    />
  </div>

  {/* Type alimentaire */}
  <div>
    <label style={{ 
      display: 'block', 
      marginBottom: '8px', 
      fontWeight: '600',
      color: '#333',
      fontSize: '1rem'
    }}>
      🥗 Type alimentaire
    </label>
    <input
      type="text"
      placeholder="Ex: végétarien, Omnivore, seulement poissons..."
      value={dietType}
      onChange={(e) => setDietType(e.target.value)}
      style={{
        width: '100%',
        padding: '15px',
        border: '2px solid #e0e0e0',
        borderRadius: '12px',
        fontSize: '1rem',
        transition: 'all 0.3s',
        outline: 'none'
      }}
      onFocus={(e) => e.target.style.borderColor = '#667eea'}
      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
    />
  </div>

  {/* Restrictions */}
  <div>
    <label style={{ 
      display: 'block', 
      marginBottom: '8px', 
      fontWeight: '600',
      color: '#333',
      fontSize: '1rem'
    }}>
      🚫 Restrictions / Allergies
    </label>
    <input
      type="text"
      placeholder="Ex: sans gluten, sans lactose, allergie aux noix..."
      value={restrictions}
      onChange={(e) => setRestrictions(e.target.value)}
      style={{
        width: '100%',
        padding: '15px',
        border: '2px solid #e0e0e0',
        borderRadius: '12px',
        fontSize: '1rem',
        transition: 'all 0.3s',
        outline: 'none'
      }}
      onFocus={(e) => e.target.style.borderColor = '#667eea'}
      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
    />
  </div>
          {/* Button */}
          <button
            onClick={generateMealPlan}
            disabled={loading || serverStatus?.status !== 'ok'}
            style={{
              background: (loading || serverStatus?.status !== 'ok') ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '18px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: (loading || serverStatus?.status !== 'ok') ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'transform 0.2s',
              marginTop: '10px'
            }}
            onMouseEnter={(e) => !loading && serverStatus?.status === 'ok' && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} style={{ animation: 'spin 1s linear infinite' }} />
                Génération en cours...
              </>
            ) : (
              <>
                <Calendar size={24} />
                Générer mon plan de repas
              </>
            )}
          </button>
        </div>

       {/* Error Message */}
{error && (
  <div style={{
    background: '#fee',
    border: '2px solid #fcc',
    borderRadius: '12px',
    padding: '15px',
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#c00'
  }} className="fade-in">
    <AlertCircle size={24} style={{ flexShrink: 0 }} />
    <div style={{ fontSize: '1rem', fontWeight: '500' }}>
      {error}
    </div>
  </div>
)}
      </div>

      {/* Résultats - Calendrier Horizontal dans une seule carte */}
      {mealPlan && (
        <>
          <div style={{
            background: 'white',
            borderRadius: '25px',
            padding: '40px',
            marginBottom: '30px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ 
              fontSize: '2.2rem',
              marginBottom: '30px',
              color: '#333',
              fontWeight: 'bold',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px'
            }}>
              <Calendar style={{ color: '#667eea' }} size={36} />
              Mon Planning de la Semaine
            </h2>

            {/* 7 jours en ligne horizontale */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '15px',
              overflowX: 'auto'
            }}>
              {mealPlan.mealPlan.map((day, index) => (
                <div key={index} style={{
                  background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)',
                  borderRadius: '20px',
                  padding: '20px 15px',
                  border: '3px solid #667eea',
                  minWidth: '160px',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  {/* Nom du jour */}
                  <div style={{ 
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: '#667eea',
                    marginBottom: '15px',
                    textAlign: 'center',
                    paddingBottom: '10px',
                    borderBottom: '2px solid #667eea'
                  }}>
                    {day.day}
                  </div>

                  {/* Repas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Petit-déjeuner */}
                    <div style={{
                      background: 'white',
                      padding: '10px',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Coffee size={14} style={{ color: '#667eea' }} />
                        <span style={{ fontSize: '0.7rem', color: '#999', fontWeight: '600' }}>Petit-déj</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#333', fontWeight: '500', lineHeight: '1.3' }}>
                        {day.breakfast}
                      </div>
                    </div>

                    {/* Déjeuner */}
                    <div style={{
                      background: 'white',
                      padding: '10px',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Sun size={14} style={{ color: '#667eea' }} />
                        <span style={{ fontSize: '0.7rem', color: '#999', fontWeight: '600' }}>Déjeuner</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#333', fontWeight: '500', lineHeight: '1.3' }}>
                        {day.lunch}
                      </div>
                    </div>

                    {/* Dîner */}
                    <div style={{
                      background: 'white',
                      padding: '10px',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Moon size={14} style={{ color: '#667eea' }} />
                        <span style={{ fontSize: '0.7rem', color: '#999', fontWeight: '600' }}>Dîner</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#333', fontWeight: '500', lineHeight: '1.3' }}>
                        {day.dinner}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Liste de courses */}
          <div style={{
            background: 'white',
            borderRadius: '25px',
            padding: '40px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ 
                fontSize: '2.2rem',
                color: '#333',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                <ShoppingCart style={{ display: 'inline', marginRight: '10px', color: '#667eea' }} size={32} />
                Liste de Courses
              </h2>
              <p style={{ fontSize: '1.1rem', color: '#666' }}>
                Pour toute la semaine
              </p>
            </div>

            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '25px'
            }}>
              {mealPlan.shoppingList.map((cat, i) => (
                <div key={i} style={{
                  background: 'linear-gradient(135deg, #667eea11 0%, #764ba211 100%)',
                  borderRadius: '20px',
                  padding: '25px',
                  border: '2px solid #667eea'
                }}>
                  <h4 style={{ 
                    fontSize: '1.3rem',
                    marginBottom: '15px',
                    color: '#667eea',
                    fontWeight: 'bold',
                    paddingBottom: '12px',
                    borderBottom: '2px solid #764ba2'
                  }}>
                    {cat.category}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {cat.items.map((item, j) => (
                      <div key={j} style={{
                        padding: '12px 15px',
                        background: 'white',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                        <span style={{ 
                          width: '10px',
                          height: '10px',
                          background: '#667eea',
                          borderRadius: '50%',
                          flexShrink: 0
                        }}></span>
                        <span style={{ 
                          fontSize: '1rem',
                          color: '#333',
                          fontWeight: '500'
                        }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;