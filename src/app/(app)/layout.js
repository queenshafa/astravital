import Sidebar from "@/components/Sidebar";
import Fab from "@/components/Fab";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-base p-4 lg:p-7">
      <div className="mx-auto grid max-w-[1560px] gap-5 lg:grid-cols-[264px_1fr]">
        <Sidebar />
        <main className="flex min-w-0 flex-col gap-5">{children}</main>
      </div>
      <Fab />
    </div>
  );
}
