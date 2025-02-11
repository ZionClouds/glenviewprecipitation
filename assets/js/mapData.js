let data;
let currentInfoWindow = null;
let map;
let currentPopup = null;

$(document).ready(function() {
    $.ajax({
        url: "getData.php",
        type: "GET",
        success: function(response) {
            data = response.data;
            if(data) {
                initMap();
            }
        },
        error: function(xhr, status, error) {
            console.log(error);
        }
    })
})

// const initMap = () => {
//     const mapInstance = new window.google.maps.Map(document.getElementById('map'), { 
//         center: { lat: data[0].lat, lng: data[0].lng },
//         zoom: 13,
//     });

//     // Create a marker
//     data.forEach((location) => {
//         const marker = new window.google.maps.Marker({
//             position: { lat: location.lat, lng: location.lng },
//             map: mapInstance,
//             title: location.name
//         });

//         // Add click listener to each marker
//         let infoContent = '<table class="table table-bordered dialog-style" style="width: 250px;">';
//         for(let i = 0; i < location.previousData.length; i++) {                    
//             infoContent += `<tr><td>${location.previousData[i].timestamp}</td><td>${location.previousData[i].riseLevel}</td></tr>`;
//         }
//         infoContent += '</table>';
        
//         const infoWindow = new google.maps.InfoWindow({
//             content: infoContent
//         });

//         marker.addListener("click", () => {
//             if(currentInfoWindow) {
//                 currentInfoWindow.close();
//             }

//             infoWindow.open(map, marker);
//             currentInfoWindow = infoWindow;
//         });
//     })
// };

class CustomPopup extends window.google.maps.OverlayView {
    constructor(position, content) {
        super();
        this.position = position;
        this.content = content;
        this.div = null;
        this.visible = false;
    }

    onAdd() {
        // Create the popup div and append the content
        this.div = document.createElement('div');
        this.div.innerHTML = this.content;
        this.div.style.display = 'none';

        // Style adjustments if necessary
        this.div.classList.add('custom-popup');

        // Add the popup to the floatPane
        const panes = this.getPanes();
        panes.floatPane.appendChild(this.div);

        // Event listener to stop propagation when clicking inside the popup
        this.div.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        this.div.style.display = 'block';
    }

    draw() {
        if (!this.div) return;

        // Position the popup
        const overlayProjection = this.getProjection();
        const position = overlayProjection.fromLatLngToDivPixel(this.position);
        console.log(position);

        if (position) {
            this.div.style.left = `${position.x}px`;
            this.div.style.top = `${position.y-35}px`;
        }
    }

    onRemove() {
        // Remove the popup from the DOM
        if (this.div) {
            this.div.parentNode.removeChild(this.div);
            this.div = null;
        }
    }

    show() {
        if (this.div) {
            this.div.style.display = 'block';
            this.visible = true;
        }
    }

    hide() {
        if (this.div) {
            this.div.style.display = 'none';
            this.visible = false;
        }
    }

    toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

function initMap() {
    // Transform the data structure to a flat array
    const transformedData = data.map(location => {
        // Get the city key and its data
        const cityKey = Object.keys(location)[0];
        const cityData = location[cityKey];
        return cityData; // This will give us the flat structure we need
    });

    map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: transformedData[0].lat, lng: transformedData[0].lng },
        zoom: 12
    });

    transformedData.forEach(location => {
        const marker = new window.google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: map,
            title: location.name
        });

        const popupContent = `
            <div>
                <div class="close-icon" onclick="currentPopup.hide()">x</div>
                <div class="city-name">${location.city}</div>
                <div class="last-update px-3">
                    <div>Last update: 2024-11-09</div>
                    <div>12:00:00 CST</div>
                </div>
                <hr class="break-line" />
                <div class="rise-level">
                    <img src="./assets/images/big_drop.svg" />
                    <div class="rise"><span>River Level</span> <span class="levels">${location.currentLevels} <span style="font-size: medium;">FT</span> </span></div>
                </div>
                <hr class="break-line" />
                <div class="previous-data">
                    <div class="previous-heading">
                        <div>Previous</div>
                        <div>Amount/Levels</div>
                    </div>
                    ${location.previousData.map(d => `
                        <hr class="break-line" /><div class="previous-values"><div>${d.timestamp}</div> <div>${d.riseLevel}</div></div>
                    `).join('')}
                </div>
            </div>
        `;

        let popup = new CustomPopup(
            new window.google.maps.LatLng(location.lat, location.lng),
            popupContent
        );

        marker.addListener('click', () => {
            if (currentPopup && currentPopup !== popup) {
                currentPopup.hide();
            }

            // If the clicked popup is already open, close it
            if (currentPopup === popup) {
                popup.hide();
                currentPopup = null;
            } else {
                popup.setMap(map); // This will trigger onAdd
                currentPopup = popup;
            }
        });
    });

    map.addListener('click', () => {
        if (currentPopup) {
            currentPopup.hide();
            currentPopup = null;
        }
    });

}

// window.onload = initMap();