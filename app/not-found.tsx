export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '4rem', margin: '0 0 1rem 0' }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: '#666' }}>Page not found</p>
    </div>
  );
}
