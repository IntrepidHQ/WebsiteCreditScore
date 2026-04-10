import { DataroomPanel } from "@/features/app/components/dataroom-panel";

export const dynamic = "force-dynamic";

export default function DataroomPage() {
  return (
    <div className="space-y-6">
      <DataroomPanel />
    </div>
  );
}
