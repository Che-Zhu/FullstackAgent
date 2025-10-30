'use client';

import { AlertCircle, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ErrorView() {
  return (
    <div className="bg-card border border-border rounded-sm">
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-sm p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-destructive mb-1">
                Unable to load GitHub account
              </div>
              <div className="text-xs text-destructive/90 mb-3">
                We could not connect to your GitHub account. Please try reconnecting.
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                <Github className="h-4 w-4" />
                Reconnect GitHub Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
