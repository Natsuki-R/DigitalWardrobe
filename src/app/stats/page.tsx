import { StatsDashboard } from "@/components/stats/stats-dashboard";

export default function StatsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Stats</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track how you wear your clothes
        </p>
      </div>
      <StatsDashboard />
    </div>
  );
}
