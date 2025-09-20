import React, {useState} from 'react';

const SimpleApp: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    alert(`Login with phone: ${phone}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🏛️ Civic Reporter</h1>
        <p style={styles.subtitle}>Web Demo Version</p>
      </div>
      
      <div style={styles.loginForm}>
        <h2 style={styles.formTitle}>Welcome Back</h2>
        <p style={styles.formSubtitle}>Sign in to report civic issues</p>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Phone Number</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <button style={styles.button} onClick={handleLogin}>
          Sign In
        </button>
        
        <p style={styles.footer}>
          Don't have an account? <span style={styles.link}>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#007AFF',
    color: 'white',
    padding: '20px',
    textAlign: 'center' as const,
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '32px',
    fontWeight: 'bold',
  },
  subtitle: {
    margin: '0',
    fontSize: '16px',
    opacity: 0.9,
  },
  loginForm: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  formTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0 0 10px 0',
    color: '#1C1C1E',
  },
  formSubtitle: {
    fontSize: '16px',
    textAlign: 'center' as const,
    color: '#8E8E93',
    margin: '0 0 30px 0',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #C6C6C8',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#007AFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '20px',
    fontSize: '16px',
    color: '#8E8E93',
  },
  link: {
    color: '#007AFF',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default SimpleApp;