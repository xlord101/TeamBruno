import { useState, useEffect, useCallback } from 'react';

interface DonorRecord {
  timestamp: string;
  donorName: string;
  phoneNumber: string;
  channel: string;
  donationType: string;
  appointmentDate: string;
  time: string;
  status: string;
}

interface InventoryData {
  bloodUnitsAvailable: number;
  plasmaUnitsAvailable: number;
  plateletUnitsAvailable: number;
  lastUpdated: string;
}

interface GoogleSheetsData {
  donorRecords: DonorRecord[];
  inventory: InventoryData;
}

const DONOR_RECORDS_URL = 'https://docs.google.com/spreadsheets/d/1nPdCAaYVckUJodRC5oqswq92XGO1GKw-p1VY5LkKQ3c/export?format=csv';
const INVENTORY_URL = 'https://docs.google.com/spreadsheets/d/1nPdCAaYVckUJodRC5oqswq92XGO1GKw-p1VY5LkKQ3c/export?format=csv&gid=350030392';

export const useGoogleSheets = () => {
  const [data, setData] = useState<GoogleSheetsData>({
    donorRecords: [],
    inventory: {
      bloodUnitsAvailable: 0,
      plasmaUnitsAvailable: 0,
      plateletUnitsAvailable: 0,
      lastUpdated: '',
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const parseCSV = (csv: string): string[][] => {
    const lines = csv.split('\n');
    return lines.map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    }).filter(row => row.some(cell => cell.length > 0));
  };

  const fetchDonorRecords = async (): Promise<DonorRecord[]> => {
    try {
      console.log('Fetching donor records from:', DONOR_RECORDS_URL);
      const response = await fetch(DONOR_RECORDS_URL);
      if (!response.ok) {
        console.error('Donor records fetch failed:', response.status, response.statusText);
        throw new Error(`Failed to fetch donor records: ${response.status}`);
      }
      
      const csv = await response.text();
      console.log('Donor records CSV:', csv.substring(0, 200) + '...');
      const rows = parseCSV(csv);
      console.log('Parsed donor records rows:', rows.length);
      
      // Skip header row
      return rows.slice(1).map(row => ({
        timestamp: row[0] || '',
        donorName: row[1] || '',
        phoneNumber: row[2] || '',
        channel: row[3] || '',
        donationType: row[4] || '',
        appointmentDate: row[5] || '',
        time: row[6] || '',
        status: row[7] || 'Pending',
      })).filter(record => record.donorName); // Filter out empty rows
    } catch (error) {
      console.error('Error fetching donor records:', error);
      throw error;
    }
  };

  const fetchInventory = async (): Promise<InventoryData> => {
    try {
      console.log('Fetching inventory from:', INVENTORY_URL);
      const response = await fetch(INVENTORY_URL);
      if (!response.ok) throw new Error('Failed to fetch inventory data');
      
      const csv = await response.text();
      console.log('Inventory CSV:', csv);
      const rows = parseCSV(csv);
      
      // Assuming first data row contains the current inventory
      const dataRow = rows[1] || [];
      
      return {
        bloodUnitsAvailable: parseInt(dataRow[0]) || 0,
        plasmaUnitsAvailable: parseInt(dataRow[1]) || 0,
        plateletUnitsAvailable: parseInt(dataRow[2]) || 0,
        lastUpdated: dataRow[3] || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [donorRecords, inventory] = await Promise.all([
        fetchDonorRecords(),
        fetchInventory(),
      ]);
      
      console.log('Successfully fetched data:', { donorRecords: donorRecords.length, inventory });
      setData({ donorRecords, inventory });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Set fallback demo data for development
      setData({
        donorRecords: [
          {
            timestamp: '2024-12-29 10:30:00',
            donorName: 'John Smith',
            phoneNumber: '+1 (555) 123-4567',
            channel: 'Website',
            donationType: 'Whole Blood',
            appointmentDate: '2024-12-30',
            time: '10:00',
            status: 'Confirmed',
          },
          {
            timestamp: '2024-12-29 11:15:00',
            donorName: 'Sarah Johnson',
            phoneNumber: '+1 (555) 987-6543',
            channel: 'Phone',
            donationType: 'Plasma',
            appointmentDate: '2024-12-31',
            time: '14:30',
            status: 'Pending',
          },
          {
            timestamp: '2024-12-29 09:45:00',
            donorName: 'Michael Brown',
            phoneNumber: '+1 (555) 456-7890',
            channel: 'Walk-in',
            donationType: 'Platelets',
            appointmentDate: '2024-12-29',
            time: '09:00',
            status: 'Completed',
          },
        ],
        inventory: {
          bloodUnitsAvailable: 245,
          plasmaUnitsAvailable: 78,
          plateletUnitsAvailable: 32,
          lastUpdated: new Date().toISOString(),
        },
      });
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
};
