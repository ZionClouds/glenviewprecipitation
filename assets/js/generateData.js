function generateData() {
    const cities = [
        {
            city: "Service Center Rainfall",
            lat: 42.07907923834326,
            lng: -87.8214062215235,
            baseLevel: 6.7
        },
        {
            city: "East Side Rainfall",
            lat: 42.06949932995881,
            lng: -87.77125931992899,
            baseLevel: 7.1
        },
        {
            city: "Techny Basin Reservoir Level",
            lat: 42.097692466267624,
            lng: -87.80849209109142,
            baseLevel: 6.1
        },
        {
            city: "West Fork of the chicago River's North Branch",
            lat: 42.1708866058241,
            lng: -87.84745483998773,
            baseLevel: 6.5
        }
    ];

    const data = cities.map(cityInfo => {
        const currentLevel = cityInfo.baseLevel;
        const previousData = [];

        // Generate data for last 30 minutes
        for (let i = 3; i >= 0; i--) {
            const timestamp = new Date(Date.now() - i * 10 * 60000);
            previousData.push({
                timestamp: timestamp.toISOString().slice(0, 19).replace('T', ' ') + '.000',
                riseLevel: 617.80 + (Math.random() * 0.04 - 0.02)
            });
        }

        return {
            city: cityInfo.city,
            lat: cityInfo.lat,
            lng: cityInfo.lng,
            currentLevels: currentLevel,
            previousData
        };
    });

    return { data };
}

// Function to make API call
async function makeApiCall() {
    try {
        const data = generateData();
        const response = await fetch('https://glenview-precipitation-backend-187517077947.us-central1.run.app/store_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const currentTime = new Date().toLocaleString();
        document.getElementById('status').innerHTML += 
            `<p>Data sent successfully at: ${currentTime}</p>`;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Start making API calls every 10 minutes
// makeApiCall(); // Initial call
setInterval(makeApiCall, 18 * 60 * 60 * 1000); // Call every 6 hours
// 6 * 60 * 60 * 1000