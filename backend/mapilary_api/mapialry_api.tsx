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


/*

  console.log("a");
  const API_ACCESSTOKEN = "MLY|25029665826641263|11a89c920225f029a3179155d78aef55";
  const APP_ID = "25029665826641263";
  const AUTORISED_URL = "https://www.mapillary.com/connect?client_id=25029665826641263";
  const CLIENT_SECRET = "MLY|25029665826641263|24a870571e4a2cbff7e2c3f03b5cb528";   // SECRET

  //console.log('curl.exe "https://graph.mapillary.com/1156350815484235?fields=id,thumb_original_url,computed_geometry" -H "Authorization: OAuth MLY|25029665826641263|11a89c920225f029a3179155d78aef55"');


  $token = "MLY|25029665826641263|24a870571e4a2cbff7e2c3f03b5cb528"
$imageId = "1156350815484235"

$url = "https://graph.mapillary.com/$imageId?fields=key,thumb_1024_url,computed_geometry,captured_at"
$headers = @{ Authorization = "Bearer $token" }

Invoke-WebRequest -Uri $url -Headers $headers -Method Get | Select-Object -ExpandProperty Content

    {"id":"1156350815484235","thumb_1024_url":"https:\/\/scontent-waw2-1.xx.fbcdn.net\/m1\/v\/t6\/An-ROUIgztGd2mChwqObgy4_nYyJNGFOwlTTVfnxHtXHdiVDtadJk9YOX7cK4osi57zTvOf5xHJxVpCWQmiXv0bLK84jMBSJTtqKMVitPjMO5azvInA7cgM7PaKEF7RViJJCX6ojdeCzzCt7sX6H-w?stp=s1024x512&edm=ALXxkZ8EAAAA&_nc_gid=qHVWUJkFnSI0c5oYHke0lw&_nc_oc=AdkcsLiiZetWFVNgiT1dRrRCgE4x3xwcrxzWg0j30uRsOKBHZ007OfFdRTo3D1_P-LSJQACtPPcFkkmgnOtCLJrF&ccb=10-5&oh=00_Afbwwk-bU7P8ZS7VPvVrwIFWVjSiHkIbZ8ZGlgTwUb94Ig&oe=68EFE6EC&_nc_sid=201bca","computed_geometry":{"type":"Point","coordinates":[2.3013506935803,48.848225624039]},"captured_at":1718004551000}

    curl.exe "https://graph.mapillary.com/1156350815484235?fields=id,thumb_original_url,computed_geometry" -H "Authorization: OAuth MLY|25029665826641263|11a89c920225f029a3179155d78aef55"
  
    https:\/\/scontent-waw2-1.xx.fbcdn.net\/m1\/v\/t6\/An-ROUIgztGd2mChwqObgy4_nYyJNGFOwlTTVfnxHtXHdiVDtadJk9YOX7cK4osi57zTvOf5xHJxVpCWQmiXv0bLK84jMBSJTtqKMVitPjMO5azvInA7cgM7PaKEF7RViJJCX6ojdeCzzCt7sX6H-w?edm=ALXxkZ8EAAAA&_nc_gid=XcvgmuzDKQyiaSufHOxEdw&_nc_oc=AdkcsLiiZetWFVNgiT1dRrRCgE4x3xwcrxzWg0j30uRsOKBHZ007OfFdRTo3D1_P-LSJQACtPPcFkkmgnOtCLJrF&ccb=10-5&oh=00_AfbqGhyk4Bte9oe63XbcEvgCyBs1LpgLEUs0Yu7A8gy8FA&oe=68EFE6EC&_nc_sid=201bca
    
    https://scontent-waw2-1.xx.fbcdn.net/m1/v/t6/An-ROUIgztGd2mChwqObgy4_nYyJNGFOwlTTVfnxHtXHdiVDtadJk9YOX7cK4osi57zTvOf5xHJxVpCWQmiXv0bLK84jMBSJTtqKMVitPjMO5azvInA7cgM7PaKEF7RViJJCX6ojdeCzzCt7sX6H-w?edm=ALXxkZ8EAAAA&_nc_gid=XcvgmuzDKQyiaSufHOxEdw&_nc_oc=AdkcsLiiZetWFVNgiT1dRrRCgE4x3xwcrxzWg0j30uRsOKBHZ007OfFdRTo3D1_P-LSJQACtPPcFkkmgnOtCLJrF&ccb=10-5&oh=00_AfbqGhyk4Bte9oe63XbcEvgCyBs1LpgLEUs0Yu7A8gy8FA&oe=68EFE6EC&_nc_sid=201bca
    

    */