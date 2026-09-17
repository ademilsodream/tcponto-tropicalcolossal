
import React from 'react';
import { LogIn, Coffee, LogOut, Check } from 'lucide-react';

export type TimeRecordKey = 'clock_in' | 'lunch_start' | 'lunch_end' | 'clock_out';

interface TimeRecord {
  id: string;
  date: string;
  clock_in?: string;
  lunch_start?: string;
  lunch_end?: string;
  clock_out?: string;
  total_hours: number;
  normal_hours?: number;
  overtime_hours?: number;
  normal_pay?: number;
  overtime_pay?: number;
  total_pay?: number;
  locations?: any;
  created_at?: string;
  updated_at?: string;
  status?: string;
  is_pending_approval?: boolean;
  approved_by?: string;
  approved_at?: string;
}

interface TimeRegistrationProgressProps {
  timeRecord: TimeRecord | null;
  onEditRequest?: (field: TimeRecordKey, value: string) => void; // opcional e não usado
}

const steps = [
  { key: 'clock_in' as TimeRecordKey, label: 'Entrada', icon: LogIn },
  { key: 'lunch_start' as TimeRecordKey, label: 'Início Almoço', icon: Coffee },
  { key: 'lunch_end' as TimeRecordKey, label: 'Volta Almoço', icon: Coffee },
  { key: 'clock_out' as TimeRecordKey, label: 'Saída', icon: LogOut },
];

export const TimeRegistrationProgress: React.FC<TimeRegistrationProgressProps> = ({ timeRecord }) => {
  const getValue = (key: TimeRecordKey) => timeRecord?.[key];
  const completedCount = steps.filter((step) => getValue(step.key)).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Registos de hoje
        </h2>
        <span className="text-xs font-medium text-muted-foreground">{completedCount} de 4</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const value = getValue(step.key);
          const isCompleted = !!value;
          const isNext = !isCompleted && completedCount === index;

          return (
            <div
              key={step.key}
              className={`rounded-xl border p-3 transition-colors ${
                isCompleted
                  ? 'border-primary/30 bg-primary/5'
                  : isNext
                    ? 'border-primary border-dashed bg-background'
                    : 'border-border bg-muted/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isNext
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isCompleted && <Check className="w-4 h-4 text-primary" />}
                {isNext && (
                  <span className="text-[10px] font-semibold uppercase text-primary">Próximo</span>
                )}
              </div>

              <div className="mt-2 text-xs font-medium text-muted-foreground">{step.label}</div>
              <div
                className={`text-xl font-bold tabular-nums ${
                  isCompleted ? 'text-foreground' : 'text-muted-foreground/50'
                }`}
              >
                {isCompleted ? String(value).slice(0, 5) : '--:--'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
