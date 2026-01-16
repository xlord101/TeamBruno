import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { DonorTable } from '@/components/dashboard/DonorTable';
import { InventoryEditor } from '@/components/dashboard/InventoryEditor';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Droplets, Activity, Users, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

const Index = () => {
  const { data, isLoading, error, lastUpdated, refetch } = useGoogleSheets();

  const totalDonors = data.donorRecords.length;
  const confirmedAppointments = data.donorRecords.filter(
    record => record.status.toLowerCase().includes('booked') ||
      record.status.toLowerCase().includes('completed')
  ).length;

  const pendingAppointments = data.donorRecords.filter(
    record => record.status.toLowerCase().includes('queued')
  ).length;

  const totalUnits = data.inventory.bloodUnitsAvailable +
    data.inventory.plasmaUnitsAvailable +
    data.inventory.plateletUnitsAvailable;

  const confirmationRate = totalDonors > 0
    ? Math.round((confirmedAppointments / totalDonors) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <DashboardHeader
          onRefresh={refetch}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
        />

        {error && (
          <div className="glass-card p-4 mb-6 border-l-4 border-warning fade-in">
            <p className="text-sm text-warning-foreground flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>Using demo data - {error}</span>
            </p>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <MetricsCard
            title="Blood Units"
            value={data.inventory.bloodUnitsAvailable}
            subtitle="Available"
            icon={Droplets}
            variant="blood"
            isLoading={isLoading}
          />

          <MetricsCard
            title="Plasma Units"
            value={data.inventory.plasmaUnitsAvailable}
            subtitle="Available"
            icon={Activity}
            variant="primary"
            isLoading={isLoading}
          />

          <MetricsCard
            title="Platelet Units"
            value={data.inventory.plateletUnitsAvailable}
            subtitle="Available"
            icon={Droplets}
            variant="warning"
            isLoading={isLoading}
          />

          <MetricsCard
            title="Total Donors"
            value={totalDonors}
            subtitle={`${confirmedAppointments} Confirmed`}
            icon={Users}
            variant="success"
            isLoading={isLoading}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <InventoryEditor
            data={data.inventory}
            onUpdate={refetch}
          />

          {/* Appointment Status Card */}
          <div className="glass-card p-4 sm:p-6 fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Appointments</h3>
                <p className="text-xs text-muted-foreground">Status overview</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Confirmed</span>
                <span className="font-bold text-lg text-success tabular-nums">{confirmedAppointments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-bold text-lg text-warning tabular-nums">{pendingAppointments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-bold text-lg tabular-nums">{totalDonors}</span>
              </div>

              {/* Progress bar */}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Confirmation Rate</span>
                  <span className="font-medium">{confirmationRate}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-success to-success-light transition-all duration-700 ease-out rounded-full"
                    style={{ width: `${confirmationRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* System Status Card */}
          <div className="glass-card p-4 sm:p-6 fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base">System</h3>
                <p className="text-xs text-muted-foreground">Status & sync</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-success/5 rounded-lg">
                <div className="h-2.5 w-2.5 bg-success rounded-full pulse-live" />
                <div>
                  <span className="text-sm font-medium">Connected</span>
                  <p className="text-xs text-muted-foreground">Real-time sync active</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium">Auto-refresh</span>
                  <p className="text-xs text-muted-foreground">Every 5 minutes</p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Inventory</span>
                  <span className="font-bold tabular-nums">{totalUnits} units</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Donor Records Table */}
        <DonorTable
          data={data.donorRecords}
          isLoading={isLoading}
          onDataUpdate={refetch}
        />

        {/* Footer */}
        <footer className="mt-8 pb-4 text-center text-xs text-muted-foreground">
          <p>LifeFlow Blood Bank Dashboard • Synced with Google Sheets</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
