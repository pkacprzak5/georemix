// import { API_testing } from "../../backend/mapilary_api/mapialry_api";
// API_testing('none');
//
// download - downloads images from thumb_original_url in res array
// nodes - creates nodes.json file
// links - creates links.json file
// none - nothing addicional
//
// Add this lines to app.tsx or anywhere else you want to make it work.

type API_mode = 'download' | 'nodes' | 'links' | 'none';

const API_testing = async (mode: API_mode) => {
  async function fetchMapillaryData(imageId: string) {
    const token = 'MLY|25029665826641263|11a89c920225f029a3179155d78aef55';
    const url = `https://graph.mapillary.com/${imageId}?fields=id,thumb_original_url,computed_geometry,compass_angle,computed_compass_angle`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `OAuth ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Błąd:', error);
    }
  }

  const ids = [
    '1156350815484235',
    '315381784977916',
    '1385209112077697',
    '1646185212804555',
    '491382093335200',
    '839000508136004',
    '768448675499847',
    '1881196635657529',
    '1846641372529002',
    '816902583440742',
    '432646122978162',
    '834015571448095',
    '2156878238001531',
    '872099164945506',
    '880305470589633',
    '1229410868329452',
    '699640395608443',
    '1011462350547959',
    '481975194346094',
    '445002208386689',
    '1127332615047133',
  ];

  const res = await Promise.all(
    ids.map(async (id) => {
      try {
        const data = await fetchMapillaryData(id);
        const { thumb_original_url, computed_geometry, compass_angle, computed_compass_angle } = data
        return { id, thumb_original_url, computed_geometry, compass_angle, computed_compass_angle }
      } catch (error) {
        return { id, status: 'error' };
      }
    })
  );

  //for (const url of res) {
  //  console.log(url.id, url.thumb_original_url, url.computed_geometry, url.computed_compass_angle);
  //}

  if (mode == 'download') {
    // Pobieranie obrazów
    for (const item of res) {
      if (!item.thumb_original_url) continue;

      try {
        // Usuń backslashe z URL
        const imageUrl = item.thumb_original_url.replace(/\\/g, '');
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Utwórz obiekt URL dla blob
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${item.id}.jpg`; // nazwa pliku do pobrania

        // Dodaj element do body, kliknij i usuń
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log(`Pobrano: ${item.id}.jpg`);
      } catch (error) {
        console.error(`Błąd podczas pobierania ${item.id}:`, error);
      }
    }
  }

  if (mode == 'links') {
    const linksObject = ids.reduce((acc, currentId, index, array) => {
      const links = [];

      // Dodaj poprzedni element, jeśli istnieje
      if (index > 0) {
        links.push(array[index - 1]);
      }

      // Dodaj następny element, jeśli istnieje
      if (index < array.length - 1) {
        links.push(array[index + 1]);
      }

      return {
        ...acc,
        [currentId]: links
      };
    }, {});

    console.log(linksObject);

    function downloadJSON(data: any, filename: string) {
      // Konwersja obiektu na string JSON
      const jsonString = JSON.stringify(data, null, 2);
      // Tworzenie obiektu Blob z typem application/json
      const blob = new Blob([jsonString], { type: 'application/json' });
      // Tworzenie URL dla blob
      const url = URL.createObjectURL(blob);
      // Tworzenie elementu <a> do pobrania
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      // Dodanie elementu do body, kliknięcie i usunięcie
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Zwolnienie URL
      URL.revokeObjectURL(url);
    }

    // Wywołanie funkcji do pobrania pliku
    downloadJSON(linksObject, 'links.json');
  }

  if (mode == 'nodes') {
    const formattedData = res
      .filter(item => item.id && item.computed_geometry && item.computed_compass_angle !== undefined)
      .map(item => ({
        id: item.id,
        panorama: `${item.id}.jpg`,
        gps: item.computed_geometry.coordinates, // Zakładam, że computed_geometry to obiekt z właściwością coordinates
        sphereCorrection: {
          pan: item.computed_compass_angle
        }
      }));

    //console.log(formattedData);
    // Jeśli chcesz zapisać to jako plik JSON
    function downloadFormattedJSON() {
      const jsonString = JSON.stringify(formattedData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'nodes.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // Wywołaj funkcję do pobrania
    downloadFormattedJSON();
  }

}
export { API_testing };
