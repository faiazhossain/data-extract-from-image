import { utils, write } from 'xlsx';
import { POI } from '../types';

export const exportToExcel = (pois: POI[]) => {
  try {
    console.log('Starting export with', pois.length, 'POIs');

    // Filter out only verified POIs
    const verifiedPOIs = pois.filter((poi) => poi.status === 'verified');
    console.log('Found', verifiedPOIs.length, 'verified POIs');

    if (verifiedPOIs.length === 0) {
      throw new Error('No verified POIs to export');
    } // Transform POIs into a format suitable for Excel
    const data = verifiedPOIs.map((poi) => ({
      'Short Address':
        poi.poi_name || poi.rupantor.geocoded.address_short || '',
      Area: poi.rupantor.geocoded.area || '',
      'Sub Area': poi.rupantor.geocoded.sub_area || '',
      'Road Name/Number': poi.street_road_name_number || '',
      'Property Type': poi.rupantor.geocoded.pType || '',
      Latitude: poi.rupantor.geocoded.latitude || '',
      Longitude: poi.rupantor.geocoded.longitude || '',
      'Post Code': poi.rupantor.geocoded.postCode || '',
      uCode: poi.rupantor.geocoded.uCode || '',
      'Confidence Score': (poi.rupantor.confidence_score_percentage || 0) + '%',
    }));

    // Create workbook
    const wb = utils.book_new();

    // Create worksheet with the data
    const ws = utils.json_to_sheet(data, {
      header: [
        'Short Address',
        'Area',
        'Sub Area',
        'Road Name/Number',
        'Property Type',
        'Latitude',
        'Longitude',
        'Post Code',
        'uCode',
        'Confidence Score',
      ],
      skipHeader: false,
    });

    // Auto-size columns
    const colWidths = [
      { wch: 30 }, // Short Address
      { wch: 20 }, // Area
      { wch: 20 }, // Sub Area
      { wch: 25 }, // Road Name/Number
      { wch: 15 }, // Property Type
      { wch: 12 }, // Latitude
      { wch: 12 }, // Longitude
      { wch: 10 }, // Post Code
      { wch: 15 }, // uCode
      { wch: 15 }, // Confidence Score
    ];
    ws['!cols'] = colWidths;

    // Add the worksheet to workbook
    utils.book_append_sheet(wb, ws, 'Verified POIs');

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const fileName = `verified_pois_${date}.xlsx`;

    // Create blob and trigger download
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('Export completed successfully');
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};
