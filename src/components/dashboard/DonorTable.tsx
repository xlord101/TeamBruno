import { useState, useMemo } from 'react';
import { Search, User, Phone, Calendar, Edit3, Save, X, ChevronDown } from 'lucide-react';
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
    if (statusLower.includes('completed')) {
      return <Badge className="status-active text-xs">Completed</Badge>;
    }
    if (statusLower.includes('booked')) {
      return <Badge className="bg-primary/15 text-primary border border-primary/20 text-xs font-medium">Booked</Badge>;
    }
    if (statusLower.includes('queued')) {
      return <Badge className="status-pending text-xs">Queued</Badge>;
    }
    if (statusLower.includes('cancelled')) {
      return <Badge className="status-critical text-xs">Cancelled</Badge>;
    }
    return <Badge variant="outline" className="text-xs">{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Queued') return dateString;
    try {
      const parts = dateString.split(/[-/]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        const date = new Date(year, month, day);
        return date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
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

    const originalIndex = data.findIndex(record => record.donorName === donorName);

    const result = await updateDonorStatus({
      rowIndex: originalIndex + 2,
      newStatus: editingStatus,
      donorName,
    });

    if (result.success) {
      toast({
        title: "Status Updated",
        description: `${donorName}'s status updated to ${editingStatus}`,
      });
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

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="glass-card fade-in">
        <div className="p-4 sm:p-6 border-b border-border/50">
          <div className="h-6 w-40 skeleton mb-2" />
          <div className="h-4 w-24 skeleton" />
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-10 w-10 rounded-full skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 skeleton" />
                <div className="h-3 w-24 skeleton" />
              </div>
              <div className="h-6 w-20 skeleton rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card fade-in overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border/50">
        <div className="flex flex-col gap-4">
          {/* Title row */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Donor Records
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {filteredData.length} of {data.length} records
              </p>
            </div>
          </div>

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search donors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 pr-8 border border-input rounded-lg text-sm bg-background appearance-none cursor-pointer w-full sm:w-auto min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="queued">Queued</option>
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden">
        {filteredData.length === 0 ? (
          <div className="text-center py-12 px-4">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No donor records found</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredData.map((record, index) => (
              <div
                key={index}
                className="p-4 space-y-3 stagger-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Name and status row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{record.donorName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" />
                        {record.phoneNumber}
                      </p>
                    </div>
                  </div>

                  {/* Status with edit */}
                  <div className="shrink-0">
                    {editingRow === index ? (
                      <div className="flex items-center gap-1">
                        <Select value={editingStatus} onValueChange={setEditingStatus}>
                          <SelectTrigger className="h-8 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Queued">Queued</SelectItem>
                            <SelectItem value="Booked">Booked</SelectItem>
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
                      <button
                        onClick={() => handleEditStatus(index, record.status)}
                        className="flex items-center gap-1.5 group"
                      >
                        {getStatusBadge(record.status)}
                        <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details row */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pl-[52px]">
                  <span className="font-medium text-foreground">{record.donationType}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(record.appointmentDate)}
                  </span>
                  <span>{record.time}</span>
                  <span className="text-muted-foreground/70">{record.channel}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Donor</th>
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Contact</th>
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Type</th>
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Date</th>
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Time</th>
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Status</th>
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Channel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredData.map((record, index) => (
              <tr
                key={index}
                className="group hover:bg-muted/20 transition-colors stagger-item"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium text-sm">{record.donorName}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-muted-foreground">{record.phoneNumber}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm font-medium">{record.donationType}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm">{formatDate(record.appointmentDate)}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-muted-foreground">{record.time}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {editingRow === index ? (
                      <div className="flex items-center gap-1">
                        <Select value={editingStatus} onValueChange={setEditingStatus}>
                          <SelectTrigger className="h-8 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Queued">Queued</SelectItem>
                            <SelectItem value="Booked">Booked</SelectItem>
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
                      <>
                        {getStatusBadge(record.status)}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleEditStatus(index, record.status)}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                      </>
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

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No donor records found</p>
          </div>
        )}
      </div>
    </div>
  );
};