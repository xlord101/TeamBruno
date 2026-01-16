import { useState, useEffect } from 'react';
import { Edit3, Save, X, Droplets, Activity, Package } from 'lucide-react';
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

  // Sync edit values when data changes
  useEffect(() => {
    if (!isEditing) {
      setEditValues({
        bloodUnits: data.bloodUnitsAvailable,
        plasmaUnits: data.plasmaUnitsAvailable,
        plateletUnits: data.plateletUnitsAvailable,
      });
    }
  }, [data, isEditing]);

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
        description: "Inventory levels have been saved",
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

  const inventoryItems = [
    {
      label: 'Blood Units',
      icon: Droplets,
      iconColor: 'text-blood',
      bgColor: 'bg-blood/10',
      value: data.bloodUnitsAvailable,
      editKey: 'bloodUnits' as const,
    },
    {
      label: 'Plasma Units',
      icon: Activity,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      value: data.plasmaUnitsAvailable,
      editKey: 'plasmaUnits' as const,
    },
    {
      label: 'Platelet Units',
      icon: Package,
      iconColor: 'text-warning',
      bgColor: 'bg-warning/10',
      value: data.plateletUnitsAvailable,
      editKey: 'plateletUnits' as const,
    },
  ];

  return (
    <div className="glass-card p-4 sm:p-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Inventory</h3>
            <p className="text-xs text-muted-foreground">Manage stock levels</p>
          </div>
        </div>
        
        {!isEditing && (
          <Button
            onClick={handleStartEdit}
            variant="outline"
            size="sm"
            className="gap-2 h-9"
          >
            <Edit3 className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        )}
      </div>

      {/* Inventory Items */}
      <div className="space-y-4">
        {inventoryItems.map((item) => (
          <div 
            key={item.editKey}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              isEditing ? 'bg-muted/50' : 'hover:bg-muted/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 ${item.bgColor} rounded-lg`}>
                <item.icon className={`h-4 w-4 ${item.iconColor}`} />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            
            {isEditing ? (
              <Input
                type="number"
                min="0"
                value={editValues[item.editKey]}
                onChange={(e) => setEditValues(prev => ({ 
                  ...prev, 
                  [item.editKey]: parseInt(e.target.value) || 0 
                }))}
                className="w-20 h-9 text-right font-semibold"
              />
            ) : (
              <span className="text-xl font-bold tabular-nums">{item.value}</span>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex gap-2 mt-5 pt-4 border-t border-border/50">
          <Button
            onClick={handleSave}
            disabled={isUpdating}
            size="sm"
            className="flex-1 gap-2"
          >
            <Save className="h-4 w-4" />
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isUpdating}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};