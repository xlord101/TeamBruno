import { useState } from 'react';

interface UpdateStatusParams {
  rowIndex: number;
  newStatus: string;
  donorName: string;
}

// ⚠️ IMPORTANT: Replace this URL with your deployed Google Apps Script Web App URL
// After deploying the script, paste your URL here
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzZR0FnQN0XZtM_HvWyH_ZM11KP5nxaLYIs_tz29z9uZZGF3IxufAlBDnVvLODfCNTx/exec';

export const useGoogleSheetsAPI = (onDataUpdate?: (updatedRecords: any[]) => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updateDonorStatus = async ({ rowIndex, newStatus, donorName }: UpdateStatusParams) => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      // Make the actual API call to Google Apps Script
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateDonorStatus',
          rowIndex: rowIndex,
          newStatus: newStatus,
        }),
      });

      // Note: Due to no-cors mode, we can't read the response directly
      // The Apps Script will still process the request
      console.log(`Status update sent for ${donorName} (row ${rowIndex}) to: ${newStatus}`);

      // Trigger data refresh to get the updated data
      if (onDataUpdate) {
        // Small delay to allow Google Sheets to process
        setTimeout(() => onDataUpdate([]), 1000);
      }

      return { success: true, message: 'Status update request sent' };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
      setUpdateError(errorMessage);
      console.error('Update error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateDonorStatus,
    isUpdating,
    updateError,
    isConfigured: true,
  };
};