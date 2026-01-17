import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface DonorData {
    donorName: string;
    phoneNumber: string;
    channel: string;
    donationType: string;
    appointmentDate: string;
    time: string;
    status: string;
}

interface DonorFormProps {
    initialData?: DonorData;
    onSubmit: (data: DonorData) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const DEFAULT_DATA: DonorData = {
    donorName: '',
    phoneNumber: '',
    channel: 'Website',
    donationType: 'Blood',
    appointmentDate: new Date().toISOString().split('T')[0],
    time: '09:00',
    status: 'Queued',
};

export const DonorForm = ({ initialData, onSubmit, onCancel, isSubmitting }: DonorFormProps) => {
    const [formData, setFormData] = useState<DonorData>(DEFAULT_DATA);

    useEffect(() => {
        if (initialData) {
            // Format date to YYYY-MM-DD for input type="date"
            let formattedDate = initialData.appointmentDate;
            // Simple check if date is in DD-MM-YYYY or similar format and try to convert if needed
            // For now assuming the input might need standardizing if coming from sheet

            setFormData({
                ...initialData,
                appointmentDate: formattedDate
            });
        }
    }, [initialData]);

    const handleChange = (field: keyof DonorData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="donorName">Donor Name</Label>
                    <Input
                        id="donorName"
                        required
                        value={formData.donorName}
                        onChange={(e) => handleChange('donorName', e.target.value)}
                        placeholder="Name"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                        id="phoneNumber"
                        required
                        value={formData.phoneNumber}
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        placeholder=""
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="donationType">Donation Type</Label>
                    <Select
                        value={formData.donationType}
                        onValueChange={(value) => handleChange('donationType', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Blood">Blood</SelectItem>
                            <SelectItem value="Plasma">Plasma</SelectItem>
                            <SelectItem value="Platelets">Platelets</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="channel">Channel</Label>
                    <Select
                        value={formData.channel}
                        onValueChange={(value) => handleChange('channel', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Website">Website</SelectItem>
                            <SelectItem value="App">App</SelectItem>
                            <SelectItem value="Walk-in">Walk-in</SelectItem>
                            <SelectItem value="Phone">Phone</SelectItem>
                            <SelectItem value="Camp">Camp</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="appointmentDate">Date</Label>
                    <Input
                        id="appointmentDate"
                        type="date"
                        required
                        value={formData.appointmentDate}
                        onChange={(e) => handleChange('appointmentDate', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                        id="time"
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) => handleChange('time', e.target.value)}
                    />
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) => handleChange('status', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Queued">Queued</SelectItem>
                            <SelectItem value="Booked">Booked</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? 'Update Donor' : 'Add Donor'}
                </Button>
            </div>
        </form>
    );
};
