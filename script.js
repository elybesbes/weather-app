const map = L.map('map').setView([20, 0], 2); 

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const temperatureApiUrl = 'https://wmh5nk2njb.execute-api.us-east-1.amazonaws.com/dev/temperature';

const geoJsonUrl = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

const missingCountries = {
    "United States of America": "Canada", 
    "Mexico": "Canada", 
    "Guatemala": "Mexico", 
    "Honduras": "Mexico", 
    "Costa Rica": "Mexico", 
    "Colombia": "Venezuela", 
    "Ecuador": "Colombia", 
    "Brazil": "Argentina", 
    "Bolivia": "Argentina", 
    "Chile": "Argentina", 
    "South Africa": "Namibia", 
    "Botswana": "South Africa", 
    "Namibia": "South Africa", 
    "Zimbabwe": "South Africa", 
    "Madagascar": "Mozambique", 
    "Democratic Republic of the Congo": "Republic of the Congo", 
    "United Republic of Tanzania": "Kenya", 
    "Malawi": "Tanzania", 
    "Iran": "Turkey", 
    "Pakistan": "India", 
    "Kenya": "Tanzania", 
    "Uzbekistan": "Kazakhstan", 
    "Uganda": "Kenya", 
    "South Sudan": "Sudan", 
    "Tajikistan": "Uzbekistan", 
    "Cameroon": "Nigeria", 
    "Mongolia": "China", 
    "Nepal": "India", 
    "Australia": "New Zealand", 
    "Malaysia": "Thailand", 
    "Myanmar": "Thailand", 
    "Congo": "Democratic Republic of the Congo", 
    "Nigeria": "Niger", 
    "Ivory Coast": "Ghana", 
    "Ethiopia": "Somalia", 
    "Saudi Arabia": "Jordan", 
    "Yemen": "Saudi Arabia", 
    "Liberia": "Sierra Leone", 
    "Guinea-Bissau": "Senegal", 
    "Somaliland": "Somalia", 
    "Sudan": "Egypt", 
    "Jordan": "Syria", 
    "Syria": "Turkey", 
    "Ecuador": "Peru",
    "Switzerland": "Austria", 
    "Bosnia and Herzegovina": "Croatia", 
    "Republic of Serbia": "Hungary", 
    "Macedonia": "Albania", 
    "Kosovo": "Serbia", 
    "Bulgaria": "Italy", 
    "Turkey": "Greece",
    "Republic of Serbia": "Bosnia and Herzegovina", 
    "Bulgaria": "Turkey", 
    "Georgia": "Armenia", 
    "Armenia": "Georgia", 
    "Syria": "Jordan", 
    "Jordan": "Syria", 
    "Iran": "Turkey", 
    "Saudi Arabia": "Jordan", 
    "Yemen": "Saudi Arabia", 
    "Afghanistan": "Pakistan", 
    "Antarctica": "Russia", 
    "Cameroon": "Nigeria", 
    "Congo": "Democratic Republic of the Congo", 
    "Democratic Republic of the Congo": "Republic of the Congo", 
    "Uganda": "Kenya", 
    "Kenya": "Tanzania", 
    "Tanzania": "Kenya", 
    "Zambia": "Tanzania", 
    "Botswana": "South Africa", 
    "Namibia": "South Africa", 
    "South Africa": "Namibia", 
    "Zimbabwe": "South Africa", 
    "Malawi": "Tanzania"
};

async function fetchTemperatureData(date) {
    const response = await fetch(`${temperatureApiUrl}?ds=${date}`);
    const data = await response.json();
    return data.temperatures;
}

async function fetchGeoJson() {
    const response = await fetch(geoJsonUrl);
    return await response.json();
}

function roundTemperature(temp) {
    return temp ? Math.round(temp * 10) / 10 : 'No data available';
}

function getColor(temp) {
    return temp > 30 ? '#D73027' : 
           temp > 25 ? '#FC8D59' : 
           temp > 20 ? '#FEE08B' : 
           temp > 15 ? '#D9EF8B' : 
           temp > 10 ? '#91CF60' : 
           temp > 0  ? '#1A9850' : 
                      '#4575B4';   
}

async function fillMissingCountries(temperatures) {
    const updatedTemperatures = { ...temperatures };

    for (const missingCountry in missingCountries) {
        const closestCountry = missingCountries[missingCountry];
        const closestTemp = temperatures[closestCountry];

        if (closestTemp) {
            updatedTemperatures[missingCountry] = closestTemp;
        } else {
            console.log(`No temperature data for the closest country of ${missingCountry}: ${closestCountry}`);
        }
    }

    return updatedTemperatures;
}

async function addGeoJsonLayer(date) {
    let temperatures = await fetchTemperatureData(date);
    temperatures = await fillMissingCountries(temperatures); 

    const geoJsonData = await fetchGeoJson();

    L.geoJson(geoJsonData, {
        style: (feature) => {
            const countryName = feature.properties.name;
            const temp = temperatures[countryName];
            return {
                fillColor: temp ? getColor(temp) : '#CCCCCC',
                weight: 1,
                color: '#000',
                fillOpacity: 0.7
            };
        },
        onEachFeature: (feature, layer) => {
            const countryName = feature.properties.name;
            const temp = temperatures[countryName];
            layer.bindPopup(
                `<b>${countryName}</b><br>Temperature: ${temp ? roundTemperature(temp) + '°C' : 'No data available'}`
            );
        }
    }).addTo(map);
}

function addLegend() {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        const grades = [0, 10, 15, 20, 25, 30];
        const colors = [
            '#4575B4',
            '#1A9850',
            '#91CF60',
            '#D9EF8B',
            '#FEE08B', 
            '#FC8D59',
            '#D73027'  
        ];

        let labels = [];
        for (let i = 0; i < grades.length; i++) {
            labels.push(
                `<div class="legend-item">
                    <i style="background:${colors[i]}"></i>
                    <span>${grades[i]}${grades[i + 1] ? '–' + grades[i + 1] : '+'}°C</span>
                </div>`
            );
        }
        div.innerHTML = labels.join('');
        return div;
    };

    legend.addTo(map);
}

document.getElementById('load-button').addEventListener('click', () => {
    const selectedDate = document.getElementById('date-picker').value;
    if (selectedDate) {
        map.eachLayer((layer) => {
            if (layer instanceof L.GeoJSON) {
                map.removeLayer(layer);
            }
        });
        addGeoJsonLayer(selectedDate);
    }
});

addGeoJsonLayer('2024-12-01');
addLegend();






document.addEventListener("DOMContentLoaded", () => {
    const chatBubble = document.getElementById("chat-bubble");
    const chatInterface = document.getElementById("chat-interface");
    const chatMessages = document.getElementById("chat-messages");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");

    // Predefined questions and answers
    const qa = {
        "What is the weather in Tunisia today?": "In Tunisia, The weather today is mild, with temperatures around 17°C and clear skies.",
        "What is the weather in France today?": "In France, the weather today is mostly cloudy and cold with a chance of rain in some regions. The temperature is around 9°C.",
        "What is the weather in Moscow today?": "In Moscow, the weather today is so cold with a temperature of around -3°C and snowfall.",
        "Why is it getting colder these days?": "The drop in temperature is due to the seasonal transition to winter, where cold air masses from the Arctic move southward.",
        "What can I do to prevent cold?": "To prevent cold, you can dress in layers, wear warm clothing, avoid drafts, and stay active to maintain body heat."
    };

    // Timer for each question
    const timers = {
        "What is the weather in Tunisia today?": 1500,
        "What is the weather in France today?": 1700,
        "What is the weather in Moscow today?": 1500,
        "Why is it getting colder these days?": 2500,
        "What can I do to prevent cold?": 2100
    };

    // Toggle chat interface visibility
    chatBubble.addEventListener("click", () => {
        chatInterface.style.display = chatInterface.style.display === "flex" ? "none" : "flex";
    });

    // Function to add message to chat
    function addMessage(message, sender) {
        const messageElement = document.createElement("div");
        messageElement.classList.add(sender + "-message");
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
    }

    // Function to handle sending message
    function sendMessage() {
        const userMessage = userInput.value.trim();
        if (userMessage !== "") {
            addMessage(userMessage, "user"); // Display user message
            userInput.value = ""; // Clear input field

            // Generate bot response with delay
            const botResponse = qa[userMessage] || "Sorry, I don't understand that question."; // Default response if not in qa
            const delay = timers[userMessage] || 2000; // Default delay of 2 seconds

            // Simulate delay before bot reply
            setTimeout(() => {
                addMessage(botResponse, "bot"); // Display bot message
            }, delay);
        }
    }

    // Event listener for send button
    sendButton.addEventListener("click", sendMessage);

    // Allow pressing Enter to send the message
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
});

