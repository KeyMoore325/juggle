import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AuthForm } from "./auth-form";
export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto border-2 border-foreground bg-card">
    <DialogHeader><DialogTitle className="font-display text-3xl">Make it truly yours</DialogTitle><DialogDescription>Full customization and saved schedules require a free account.</DialogDescription></DialogHeader>
    <AuthForm onSuccess={() => onOpenChange(false)} />
  </DialogContent></Dialog>;
}