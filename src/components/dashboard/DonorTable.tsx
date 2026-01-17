import * as XLSX from 'xlsx';
import { useState, useMemo } from 'react';
import { Search, User, Phone, Calendar, Edit3, Save, X, ChevronDown, Plus, FileDown, MoreHorizontal, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGoogleSheetsAPI } from '@/hooks/useGoogleSheetsAPI';
import { toast } from '@/hooks/use-toast';
import { DonorForm } from './DonorForm';

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Actions
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<{ index: number; data: DonorRecord } | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const { updateDonorStatus, addDonor, updateDonorDetails, deleteDonor, isUpdating } = useGoogleSheetsAPI(onDataUpdate);

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

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
      // Check if it's already in YYYY-MM-DD format
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
        });
      }

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

  // --- Actions ---

  const handleAddSubmit = async (formData: any) => {
    const result = await addDonor(formData);
    if (result.success) {
      toast({ title: "Donor Added", description: `${formData.donorName} has been added.` });
      setIsAddOpen(false);
      onDataUpdate?.();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleEditSubmit = async (formData: any) => {
    if (!editingDonor) return;
    // Calculate actual row index (header is 1, so data starts at 2)
    // We need to find the original index in the full data array, not filtered
    // But for simplicity, we passed the index from the map.
    // WAIT: The index passed from the table is the index in `paginatedData`.
    // We need the index in the original `data` array to update the sheet correctly.
    // Actually, the sheet row index is what matters.
    // Let's assume we can find the record by unique properties or we need to track the original index.
    // A better way: The `data` prop is the full list.
    // We need to find the index of the record in `data`.

    // Finding index in original data
    const originalIndex = data.findIndex(d =>
      d.donorName === editingDonor.data.donorName &&
      d.phoneNumber === editingDonor.data.phoneNumber
    );

    if (originalIndex === -1) {
      toast({ title: "Error", description: "Could not find original record", variant: "destructive" });
      return;
    }

    const result = await updateDonorDetails({
      rowIndex: originalIndex + 2, // +2 for 1-based index + header
      donor: formData
    });

    if (result.success) {
      toast({ title: "Donor Updated", description: "Details saved successfully." });
      setEditingDonor(null);
      onDataUpdate?.();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingIndex === null) return;

    // Find original index
    const recordToDelete = filteredData[deletingIndex]; // This might be wrong if paginated
    // We need to pass the record itself to delete to be safe
    // Let's change state to store the record instead of index
  };

  // Re-implementing delete with record tracking
  const [recordToDelete, setRecordToDelete] = useState<DonorRecord | null>(null);

  const confirmDelete = async () => {
    if (!recordToDelete) return;

    const originalIndex = data.findIndex(d =>
      d.donorName === recordToDelete.donorName &&
      d.phoneNumber === recordToDelete.phoneNumber
    );

    if (originalIndex === -1) {
      toast({ title: "Error", description: "Could not find record to delete", variant: "destructive" });
      return;
    }

    const result = await deleteDonor(originalIndex + 2);

    if (result.success) {
      toast({ title: "Donor Deleted", description: "Record removed successfully." });
      setRecordToDelete(null);
      onDataUpdate?.();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleExport = (days: number | 'all') => {
    let exportData = data;

    // Helper to parse date strings like "DD-MM-YYYY" or "YYYY-MM-DD"
    const parseDate = (dateStr: string) => {
      if (!dateStr) return null;
      try {
        // Try standard ISO first
        let date = new Date(dateStr);
        if (!isNaN(date.getTime())) return date;

        // Try DD-MM-YYYY or DD/MM/YYYY
        const parts = dateStr.split(/[-/]/);
        if (parts.length === 3) {
          // Assume DD-MM-YYYY
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]);
          date = new Date(year, month, day);
          if (!isNaN(date.getTime())) return date;
        }
        return null;
      } catch {
        return null;
      }
    };

    if (days !== 'all') {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      // Reset time to start of day for accurate comparison
      cutoffDate.setHours(0, 0, 0, 0);

      exportData = data.filter(record => {
        const recordDate = parseDate(record.appointmentDate);
        if (!recordDate) return false;
        return recordDate >= cutoffDate;
      });
    }

    // Prepare data for Excel
    const excelData = exportData.map(row => ({
      'Donor Name': row.donorName,
      'Phone Number': row.phoneNumber,
      'Channel': row.channel,
      'Donation Type': row.donationType,
      'Appointment Date': row.appointmentDate,
      'Time': row.time,
      'Status': row.status
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns (simple estimation)
    const colWidths = [
      { wch: 20 }, // Name
      { wch: 15 }, // Phone
      { wch: 10 }, // Channel
      { wch: 10 }, // Type
      { wch: 15 }, // Date
      { wch: 10 }, // Time
      { wch: 10 }  // Status
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Donors");

    // Save file
    XLSX.writeFile(wb, `donors_export_${new Date().toISOString().split('T')[0]}.xlsx`);
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Donor Records
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {filteredData.length} records found
              </p>
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport(10)}>Last 10 Days</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport(30)}>Last 30 Days</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport(90)}>Last 3 Months</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport('all')}>All Records</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button size="sm" className="gap-2" onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Donor</span>
              </Button>
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
        {paginatedData.length === 0 ? (
          <div className="text-center py-12 px-4">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No donor records found</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {paginatedData.map((record, index) => (
              <div
                key={index}
                className="p-4 space-y-3"
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingDonor({ index, data: record })}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setRecordToDelete(record)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between">
                  {getStatusBadge(record.status)}
                  <span className="text-xs text-muted-foreground">{record.channel}</span>
                </div>

                {/* Details row */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pl-[52px]">
                  <span className="font-medium text-foreground">{record.donationType}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(record.appointmentDate)}
                  </span>
                  <span>{record.time}</span>
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
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {paginatedData.map((record, index) => (
              <tr
                key={index}
                className="group hover:bg-muted/20 transition-colors"
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
                  {getStatusBadge(record.status)}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setEditingDonor({ index, data: record })}
                    >
                      <Edit3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setRecordToDelete(record)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedData.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No donor records found</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredData.length > 0 && (
        <div className="p-4 border-t border-border/50 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || !!editingDonor} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setEditingDonor(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingDonor ? 'Edit Donor' : 'Add New Donor'}</DialogTitle>
            <DialogDescription>
              {editingDonor ? 'Update the donor details below.' : 'Enter the details for the new donor.'}
            </DialogDescription>
          </DialogHeader>
          <DonorForm
            initialData={editingDonor?.data}
            onSubmit={editingDonor ? handleEditSubmit : handleAddSubmit}
            onCancel={() => {
              setIsAddOpen(false);
              setEditingDonor(null);
            }}
            isSubmitting={isUpdating}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!recordToDelete} onOpenChange={(open) => !open && setRecordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the record for <strong>{recordToDelete?.donorName}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isUpdating ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};