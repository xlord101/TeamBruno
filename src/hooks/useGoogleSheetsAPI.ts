import { useState } from 'react';

interface UpdateStatusParams {
  rowIndex: number;
  newStatus: string;
  donorName: string;
}

interface DonorData {
  donorName: string;
  phoneNumber: string;
  channel: string;
  donationType: string;
  appointmentDate: string;
  time: string;
  status: string;
}

interface UpdateDetailsParams {
  rowIndex: number;
  donor: DonorData;
}

// ⚠️ IMPORTANT: Replace this URL with your deployed Google Apps Script Web App URL
// After deploying the script, paste your URL here
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzZR0FnQN0XZtM_HvWyH_ZM11KP5nxaLYIs_tz29z9uZZGF3IxufAlBDnVvLODfCNTx/exec';

export const useGoogleSheetsAPI = (onDataUpdate?: (updatedRecords: any[]) => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const callScript = async (payload: any) => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Trigger data refresh
      if (onDataUpdate) {
        setTimeout(() => onDataUpdate([]), 1000);
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      setUpdateError(errorMessage);
      console.error('API error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  const updateDonorStatus = async ({ rowIndex, newStatus, donorName }: UpdateStatusParams) => {
    console.log(`Status update sent for ${donorName} (row ${rowIndex}) to: ${newStatus}`);
    return callScript({
      action: 'updateDonorStatus',
      rowIndex,
      newStatus,
    });
  };

  const addDonor = async (donor: DonorData) => {
    console.log('Adding new donor:', donor);
    return callScript({
      action: 'addDonor',
      donor,
    });
  };

  const updateDonorDetails = async ({ rowIndex, donor }: UpdateDetailsParams) => {
    console.log(`Updating details for row ${rowIndex}`, donor);
    return callScript({
      action: 'updateDonorDetails',
      rowIndex,
      donor,
    });
  };

  const deleteDonor = async (rowIndex: number) => {
    console.log(`Deleting donor at row ${rowIndex}`);
    return callScript({
      action: 'deleteDonor',
      rowIndex,
    });
  };

  return {
    updateDonorStatus,
    addDonor,
    updateDonorDetails,
    deleteDonor,
    isUpdating,
    updateError,
    isConfigured: true,
  };
};