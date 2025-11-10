import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { DonorTable } from '@/components/dashboard/DonorTable';
import { InventoryEditor } from '@/components/dashboard/InventoryEditor';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Droplets, Activity, Users, TrendingUp } from 'lucide-react';

const Index = () => {
  const { data, isLoading, error, lastUpdated, refetch } = useGoogleSheets();

  const totalDonors = data.donorRecords.length;
  const confirmedAppointments = data.donorRecords.filter(
    record => record.status.toLowerCase().includes('confirmed') || 
              record.status.toLowerCase().includes('completed')
  ).length;
  
  const totalUnits = data.inventory.bloodUnitsAvailable + 
                    data.inventory.plasmaUnitsAvailable + 
                    data.inventory.plateletUnitsAvailable;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <DashboardHeader 
          onRefresh={refetch}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
        />

        {error && (
          <div className="medical-card p-4 mb-6 border-l-4 border-warning">
            <p className="text-warning-foreground">
              ⚠️ Using demo data - {error}
            </p>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Blood Units"
            value={data.inventory.bloodUnitsAvailable}
            subtitle="Units Available"
            icon={Droplets}
            variant="blood"
            trend={{ value: 5.2, isPositive: true }}
            isLoading={isLoading}
          />
          
          <MetricsCard
            title="Plasma Units"
            value={data.inventory.plasmaUnitsAvailable}
            subtitle="Units Available"
            icon={Activity}
            variant="primary"
            trend={{ value: 2.1, isPositive: true }}
            isLoading={isLoading}
          />
          
          <MetricsCard
            title="Platelet Units"
            value={data.inventory.plateletUnitsAvailable}
            subtitle="Units Available"
            icon={Droplets}
            variant="warning"
            trend={{ value: 1.8, isPositive: false }}
            isLoading={isLoading}
          />
          
          <MetricsCard
            title="Total Donors"
            value={totalDonors}
            subtitle={`${confirmedAppointments} Confirmed`}
            icon={Users}
            variant="success"
            trend={{ value: 12.5, isPositive: true }}
            isLoading={isLoading}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <InventoryEditor 
            data={data.inventory} 
            onUpdate={refetch}
          />

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-success" />
              Appointment Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Confirmed</span>
                <span className="font-semibold text-success">{confirmedAppointments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Scheduled</span>
                <span className="font-semibold">{totalDonors}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-success to-success-light transition-all duration-1000"
                  style={{ width: `${totalDonors > 0 ? (confirmedAppointments / totalDonors) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Real-time sync active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">All systems operational</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Auto-refresh: 5min</span>
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
      </div>
    </div>
  );
};

export default Index;
