import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="card">
      <h2>Welcome to Clarity</h2>
      <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
        Improve your critical thinking skills through structured practice.
        Answer questions about real-world scenarios and receive detailed
        feedback on 8 key dimensions of critical thinking.
      </p>

      <h3 style={{ marginBottom: '1rem' }}>What you'll practice:</h3>
      <ul
        style={{
          marginBottom: '2rem',
          lineHeight: '1.8',
          paddingLeft: '1.5rem',
        }}
      >
        <li>Clarity - Clear claims and precise language</li>
        <li>Relevance - Staying on topic</li>
        <li>Logic - Sound reasoning and valid inference</li>
        <li>Evidence - Using facts and avoiding unsupported claims</li>
        <li>Assumptions - Identifying and testing assumptions</li>
        <li>Alternatives - Considering counterarguments</li>
        <li>Quantitative Reasoning - Using numbers appropriately</li>
        <li>Humility/Uncertainty - Appropriate confidence calibration</li>
      </ul>

      <Link to="/attempt">
        <button style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
          Start Practice Scenario
        </button>
      </Link>
    </div>
  );
}

export default HomePage;
