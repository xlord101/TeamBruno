import { useState } from 'react';
import { Edit3, Save, X, Droplets, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInventoryAPI } from '@/hooks/useInventoryAPI';
import { toast } from '@/hooks/use-toast';

interface InventoryData {
  bloodUnitsAvailable: number;
  plasmaUnitsAvailable: number;
  plateletUnitsAvailable: number;
}

interface InventoryEditorProps {
  data: InventoryData;
  onUpdate?: () => void;
}

export const InventoryEditor = ({ data, onUpdate }: InventoryEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    bloodUnits: data.bloodUnitsAvailable,
    plasmaUnits: data.plasmaUnitsAvailable,
    plateletUnits: data.plateletUnitsAvailable,
  });
  const { updateInventory, isUpdating } = useInventoryAPI(onUpdate);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValues({
      bloodUnits: data.bloodUnitsAvailable,
      plasmaUnits: data.plasmaUnitsAvailable,
      plateletUnits: data.plateletUnitsAvailable,
    });
  };

  const handleSave = async () => {
    const result = await updateInventory({
      bloodUnits: editValues.bloodUnits,
      plasmaUnits: editValues.plasmaUnits,
      plateletUnits: editValues.plateletUnits,
    });

    if (result.success) {
      toast({
        title: "Inventory Updated",
        description: "Inventory levels have been updated successfully",
      });
      setIsEditing(false);
      onUpdate?.();
    } else {
      toast({
        title: "Update Failed",
        description: result.error || "Failed to update inventory",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({
      bloodUnits: data.bloodUnitsAvailable,
      plasmaUnits: data.plasmaUnitsAvailable,
      plateletUnits: data.plateletUnitsAvailable,
    });
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Inventory Management
        </h3>
        
        {!isEditing && (
          <Button
            onClick={handleStartEdit}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blood" />
            <span className="text-sm text-muted-foreground">Blood Units</span>
          </div>
          {isEditing ? (
            <Input
              type="number"
              value={editValues.bloodUnits}
              onChange={(e) => setEditValues(prev => ({ ...prev, bloodUnits: parseInt(e.target.value) || 0 }))}
              className="w-20 h-8"
            />
          ) : (
            <span className="font-semibold text-xl">{data.bloodUnitsAvailable}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Plasma Units</span>
          </div>
          {isEditing ? (
            <Input
              type="number"
              value={editValues.plasmaUnits}
              onChange={(e) => setEditValues(prev => ({ ...prev, plasmaUnits: parseInt(e.target.value) || 0 }))}
              className="w-20 h-8"
            />
          ) : (
            <span className="font-semibold text-xl">{data.plasmaUnitsAvailable}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-warning" />
            <span className="text-sm text-muted-foreground">Platelet Units</span>
          </div>
          {isEditing ? (
            <Input
              type="number"
              value={editValues.plateletUnits}
              onChange={(e) => setEditValues(prev => ({ ...prev, plateletUnits: parseInt(e.target.value) || 0 }))}
              className="w-20 h-8"
            />
          ) : (
            <span className="font-semibold text-xl">{data.plateletUnitsAvailable}</span>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={isUpdating}
              size="sm"
              className="gap-2 flex-1"
            >
              <Save className="h-4 w-4" />
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};