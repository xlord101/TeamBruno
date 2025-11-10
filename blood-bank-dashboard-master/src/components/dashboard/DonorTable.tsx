import { useState, useMemo } from 'react';
import { Search, Filter, Calendar, User, Phone, Edit3, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoogleSheetsAPI } from '@/hooks/useGoogleSheetsAPI';
import { toast } from '@/hooks/use-toast';

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

interface DonorTableProps {
  data: DonorRecord[];
  isLoading: boolean;
  onDataUpdate?: () => void;
}

export const DonorTable = ({ data, isLoading, onDataUpdate }: DonorTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editingStatus, setEditingStatus] = useState('');
  const { updateDonorStatus, isUpdating } = useGoogleSheetsAPI(onDataUpdate);

  const filteredData = useMemo(() => {
    return data.filter(record => {
      const matchesSearch = 
        record.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.phoneNumber.includes(searchTerm) ||
        record.channel.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        record.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('confirmed') || statusLower.includes('completed')) {
      return <Badge className="status-active">Confirmed</Badge>;
    }
    if (statusLower.includes('pending')) {
      return <Badge className="status-pending">Pending</Badge>;
    }
    if (statusLower.includes('cancelled') || statusLower.includes('missed')) {
      return <Badge className="status-critical">Cancelled</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Queued') return dateString;
    try {
      // Parse dd/MM/yyyy format
      const parts = dateString.split(/[-/]/);
      if (parts.length === 3) {
        // Assuming dd/MM/yyyy or dd-MM-yyyy format
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const year = parseInt(parts[2]);
        const date = new Date(year, month, day);
        return date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const handleEditStatus = (index: number, currentStatus: string) => {
    setEditingRow(index);
    setEditingStatus(currentStatus);
  };

  const handleSaveStatus = async (index: number, donorName: string) => {
    if (editingStatus === filteredData[index]?.status) {
      setEditingRow(null);
      return;
    }

    // Find the actual row index in the original data
    const originalIndex = data.findIndex(record => record.donorName === donorName);
    
    const result = await updateDonorStatus({
      rowIndex: originalIndex + 2, // +2 because of header row and 0-based index
      newStatus: editingStatus,
      donorName,
    });

    if (result.success) {
      toast({
        title: "Status Updated",
        description: `${donorName}'s status has been updated to ${editingStatus}`,
      });
      
      // Trigger data refresh
      onDataUpdate?.();
      setEditingRow(null);
    } else {
      toast({
        title: "Update Failed",
        description: result.error || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditingStatus('');
  };

  return (
    <div className="medical-card">
      {/* Header */}
      <div className="p-6 border-b border-card-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Donor Records
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredData.length} of {data.length} records
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search donors, phone, channel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm bg-background"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Donor</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Donation</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Appointment</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Time</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Channel</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((record, index) => (
                <tr 
                  key={index} 
                  className="group border-b border-card-border hover:bg-muted/30 transition-colors data-enter"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{record.donorName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {record.phoneNumber}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium">{record.donationType}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDate(record.appointmentDate)}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">{record.time}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 group">
                      {editingRow === index ? (
                        <div className="flex items-center gap-1">
                          <Select value={editingStatus} onValueChange={setEditingStatus}>
                            <SelectTrigger className="h-8 w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Queued">Queued</SelectItem>
                              <SelectItem value="Booked">Booked</SelectItem>
                              <SelectItem value="Confirmed">Confirmed</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleSaveStatus(index, record.donorName)}
                            disabled={isUpdating}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {getStatusBadge(record.status)}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEditStatus(index, record.status)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">{record.channel}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filteredData.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No donor records found</p>
        </div>
      )}
    </div>
  );
};