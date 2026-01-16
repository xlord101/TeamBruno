import { useState } from 'react';

interface UpdateInventoryParams {
  bloodUnits?: number;
  plasmaUnits?: number;
  plateletUnits?: number;
}

// ⚠️ IMPORTANT: Replace this URL with your deployed Google Apps Script Web App URL
// After deploying the script, paste your URL here
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzZR0FnQN0XZtM_HvWyH_ZM11KP5nxaLYIs_tz29z9uZZGF3IxufAlBDnVvLODfCNTx/exec';

export const useInventoryAPI = (onDataUpdate?: () => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updateInventory = async (params: UpdateInventoryParams) => {
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
          action: 'updateInventory',
          bloodUnits: params.bloodUnits,
          plasmaUnits: params.plasmaUnits,
          plateletUnits: params.plateletUnits,
        }),
      });

      console.log('Inventory update sent:', params);

      // Trigger data refresh
      if (onDataUpdate) {
        setTimeout(() => onDataUpdate(), 1000);
      }

      return { success: true, message: 'Inventory update request sent' };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update inventory';
      setUpdateError(errorMessage);
      console.error('Inventory update error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateInventory,
    isUpdating,
    updateError,
    isConfigured: true,
  };
};