import { utils, write } from "xlsx";
import { MarkerData } from "../types";

export const exportToCSV = (markers: MarkerData[]) => {
  if (markers.length === 0) {
    console.error("No markers to export");
    return;
  }

  // Format data for CSV
  const data = markers.map((marker) => ({
    name: marker.name,
    latitude: marker.latitude,
    longitude: marker.longitude,
    contact_no: marker.contactNo || "",
    details: marker.details || "",
    service_type: marker.serviceType || "",
  }));

  try {
    // Create worksheet from data
    const worksheet = utils.json_to_sheet(data);

    // Create workbook and add the worksheet
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Markers");

    // Generate file name with date and time
    const date = new Date();
    const fileName = `markers_${date.toISOString().replace(/[:.]/g, "-")}.csv`;

    // Write file and trigger download
    write(workbook, fileName);

    return fileName;
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    throw error;
  }
};

export const exportToExcel = (markers: MarkerData[]) => {
  if (markers.length === 0) {
    console.error("No markers to export");
    return;
  }

  // Format data for Excel
  const data = markers.map((marker) => ({
    Name: marker.name,
    Latitude: marker.latitude,
    Longitude: marker.longitude,
    "Contact No": marker.contactNo || "",
    Details: marker.details || "",
    "Service Type": marker.serviceType || "",
  }));

  try {
    // Create worksheet from data
    const worksheet = utils.json_to_sheet(data);

    // Auto-size columns
    const colWidths = [
      { wch: 30 }, // Name
      { wch: 12 }, // Latitude
      { wch: 12 }, // Longitude
      { wch: 15 }, // Contact No
      { wch: 30 }, // Details
      { wch: 15 }, // Service Type
    ];
    worksheet["!cols"] = colWidths;

    // Create workbook and add the worksheet
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Markers");

    // Generate file name with date and time
    const date = new Date();
    const fileName = `markers_${date.toISOString().replace(/[:.]/g, "-")}.xlsx`;

    // Write file and trigger download
    write(workbook, fileName);

    return fileName;
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw error;
  }
};
