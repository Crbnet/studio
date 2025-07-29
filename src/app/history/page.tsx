import { HistoryPage } from '@/components/app/history-page';
import { Header } from '@/components/app/header';

export default function History() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <HistoryPage />
      </main>
      <footer className="py-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Designed by Crbnet and built by AI</p>
        </div>
      </footer>
    </div>
  );
}
