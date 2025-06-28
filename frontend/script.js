// Inicializar el mapa centrado en Barranquilla
const map = L.map('map').setView([10.98, -74.8], 13);

// Agregar capa base de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


let layerCentros;

    function cargarDatos(categoria = ""){
        const url = categoria
        ? `http://localhost:8000/centros?categoria=${encodeURIComponent(categoria)}`
        : "http://localhost:8000/centros";

    fetch(url)
    .then(res => res.json())
    .then(data => {
        if (layerCentros)
        {
            map.removeLayer(layerCentros);
        }

        layerCentros = L.geoJSON(data, {
             pointToLayer: function (feature, latlng) {
          
          return L.circleMarker(latlng, {
            radius: 6,
            fillColor: getColorByCategoria(feature.properties.categoria),
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });
        },
            onEachFeature: function (feature, layer) {
                const dataPopup = feature.properties;
                const popupContent = `
              <strong>${dataPopup.nombre}</strong><br>
              <em>${dataPopup.categoria}</em><br>              
            `;
                layer.bindPopup(popupContent);
            }
        }).addTo(map);
    })
    .catch(err => {
        console.error("Error cargando datos GeoJSON:", err);
        alert("No se pudo cargar el mapa. Revisa la conexión con la API.");
    });

    }

// Función para definir el color por categoría
function getColorByCategoria(categoria) {
    switch (categoria.toLowerCase()) {
        case 'hospital': return 'red';
        case 'clinica': return 'blue';
        case 'centro medico': return 'green';
        default: return 'gray';
    }
}

// Cargar inicialmiente todos los centros medicos
cargarDatos();

// Evento al cambiar el filtro

document.getElementById("categoria").addEventListener("change", function(){
    cargarDatos(this.value);
});
