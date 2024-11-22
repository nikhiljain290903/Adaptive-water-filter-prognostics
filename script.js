let waterData = [];
let chartData = {
  labels: [],
  datasets: [
    {
      label: "pH",
      data: [],
      borderColor: "rgba(75,192,192,1)",
      fill: false,
    },
    {
      label: "Turbidity",
      data: [],
      borderColor: "rgba(255,99,132,1)",
      fill: false,
    },
    {
      label: "Conductivity",
      data: [],
      borderColor: "rgba(153,102,255,1)",
      fill: false,
    },
  ],
};

let suitableForDrinking = null;

// Create Chart.js instance
const ctx = document.getElementById("waterChart").getContext("2d");
const waterChart = new Chart(ctx, {
  type: "line",
  data: chartData,
  options: {
    responsive: true,
    scales: {
      x: { type: "category" },
      y: { beginAtZero: true },
    },
  },
});

// Function to check water quality and filter impact
function checkWaterQuality(data) {
  const { pH, turbidity, conductivity } = data;

  const isPHOkay = pH >= 6 && pH <= 8.5;
  const isTurbidityOkay = turbidity <= 7;
  const isConductivityOkay = conductivity >= 300 && conductivity <= 600;

  const filterImpact = {
    pH: pH < 6 || pH > 8.5 ? "more" : pH >= 6.5 && pH <= 8 ? "less" : "medium",
    turbidity: turbidity > 7 ? "more" : turbidity <= 3 ? "less" : "medium",
    conductivity:
      conductivity < 300 || conductivity > 600
        ? "more"
        : conductivity >= 400 && conductivity <= 500
        ? "less"
        : "medium",
  };

  return {
    suitable: isPHOkay && isTurbidityOkay && isConductivityOkay,
    filterImpact,
  };
}

// Function to send data to the backend
function sendDataToBackend(data) {
  fetch("storeData.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(data),
  })
    .then((response) => response.text())
    .then((result) => {
      console.log(result); // Log the response from the server
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Function to simulate fetching data
function simulateData() {
  const newData = {
    pH: parseFloat((Math.random() * (8.5 - 6.5) + 6.5).toFixed(2)),
    turbidity: parseFloat((Math.random() * 10).toFixed(2)),
    conductivity: parseInt(Math.random() * 1000),
  };

  // Update water data and keep only the last 10 readings
  waterData.push(newData);
  if (waterData.length > 10) waterData.shift();

  // Update the chart data
  chartData.labels.push(new Date().toLocaleTimeString());
  chartData.datasets[0].data.push(newData.pH);
  chartData.datasets[1].data.push(newData.turbidity);
  chartData.datasets[2].data.push(newData.conductivity);

  waterChart.update(); // Update the chart

  // Update the current metrics
  document.getElementById("current-ph").innerText = newData.pH;
  document.getElementById("current-turbidity").innerText = newData.turbidity;
  document.getElementById("current-conductivity").innerText = newData.conductivity;

  // Send data to the backend
  sendDataToBackend(newData);

  // Check if the water is suitable for drinking and assess filter impact
  const qualityResult = checkWaterQuality(newData);
  suitableForDrinking = qualityResult.suitable;

  // Update the Suitability box dynamically
  const suitabilityBox = document.getElementById("current-suitability");
  suitabilityBox.innerText = suitableForDrinking ? "Yes" : "No";

  const filterImpact = qualityResult.filterImpact;

  // Update the suitability and filter message
  const suitabilityMessage = document.getElementById("suitability-message");
  if (suitableForDrinking) {
    suitabilityMessage.innerHTML = `
      <p class="suitable">The water is suitable for drinking!</p>
      <p>Filter Impact:</p>
      <ul>
        <li>pH: ${filterImpact.pH}</li>
        <li>Turbidity: ${filterImpact.turbidity}</li>
        <li>Conductivity: ${filterImpact.conductivity}</li>
      </ul>
    `;
  } else {
    suitabilityMessage.innerHTML = `
      <p class="not-suitable">The water is not suitable for drinking!</p>
      <p>Filter Impact:</p>
      <ul>
        <p>pH: ${filterImpact.pH}</p>
        <p>Turbidity: ${filterImpact.turbidity}</p>
        <p>Conductivity: ${filterImpact.conductivity}</p>
      </ul>
    `;
  }

  // Update the data list
  const dataList = document.getElementById("data-list");
  const dataItem = document.createElement("li");
  dataItem.className = "data-item";
  dataItem.innerHTML = `
    <strong>${new Date().toLocaleTimeString()}</strong> | pH: ${newData.pH} | 
    Turbidity: ${newData.turbidity} NTU | Conductivity: ${newData.conductivity} ppm
  `;
  dataList.prepend(dataItem); // Add the new reading to the top of the list
}

// Simulate data every 5 seconds
setInterval(simulateData, 5000);
