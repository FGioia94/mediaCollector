

import { useState } from 'react';

const BACKENDURL = import.meta.env.VITE_MEDIA_HUB_BACKEND;

const Ping = () => {

    const [pingResult, setPingResult] = useState<string | null>("");
    const [healthResult, setHealthResult] = useState<string | null>("");

    const fetchPing = async () => {
        try {
            const response = await fetch(`${BACKENDURL}/api/ping`);
            const data = await response.json();
            console.log('Ping response:', data.message);
            if (response.ok) {
                setPingResult(data.message || 'No message received');
            }
        } catch (error) {
            console.error('Error fetching ping:', error);
            setPingResult('Error fetching ping');
        }
    };

    const fetchHealth = async () => {
        try {
            const response = await fetch(`${BACKENDURL}/api/health`); 
            const data = await response.json();
            console.log('Health response:', data);
            if (response.ok) {
                if (data.status) {
                    setHealthResult(`
                        Status: ${data.status},
                        TIMESTAMP: ${data.timestamp},
                        SERVICE: ${data.service}`);
                } else { 
                    setHealthResult('No status received');}
            } else {
                setPingResult('Health check failed');
            }  } catch (error) {
            console.error('Error fetching health:', error);
            setHealthResult('Error fetching health');
        }
    };
    return (
        <>
            <button onClick={fetchPing}>Ping</button>
            <p>{pingResult}</p>
            <button onClick={fetchHealth}>Health Check</button>
            <p>{healthResult}</p>   
        </>
    )
}

export default Ping;