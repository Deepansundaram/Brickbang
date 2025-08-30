import React, { useState } from 'react';
import { useApi } from '../../contexts/ApiContext';

const AIChatBox = () => {
    const api = useApi();
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleAsk = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResponse('');
        try {
            const data = await api.ai.agentSuggest(query);
            setResponse(data.suggestion);  // Set only the suggestion string to avoid React errors
        } catch (err) {
            setError("Failed to get response from AI agent.");
        }
        setLoading(false);
    };

    return (
        <div className="card" style={{ maxWidth: 600, margin: '2rem auto' }}>
            <div className="card-header">
                <h4>🤖 Construction Site AI Assistant</h4>
            </div>
            <div className="card-body">
                <form onSubmit={handleAsk} className="d-flex gap-2 mb-3">
                    <input
                        className="form-control"
                        type="text"
                        value={query}
                        placeholder="Ask AI about labour, materials, timeline..."
                        onChange={e => setQuery(e.target.value)}
                        disabled={loading}
                    />
                    <button className="btn btn-primary" type="submit" disabled={loading || !query}>
                        {loading ? "Thinking..." : "Ask"}
                    </button>
                </form>
                {error && <div className="alert alert-danger">{error}</div>}
                {response && (
                    <div className="alert alert-success" style={{ whiteSpace: 'pre-wrap' }}>{response}</div>
                )}
            </div>
        </div>
    );
};

export default AIChatBox;
