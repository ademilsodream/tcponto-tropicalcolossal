
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar as CalendarIconLucide, Clock, DollarSign, CalendarIcon, Grid as GridIcon, List as ListIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO, isValid, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, eachDayOfInterval, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { calculateWorkingHours } from '@/utils/timeCalculations';
import { isWorkingDay } from '@/utils/workingDays';

// Importar componentes necessários para seletores de data individuais (Calendar, Popover)
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils'; // Importar cn para classes condicionais

interface TimeRecord {
  id: string;
  date: string;
  clock_in?: string;
  lunch_start?: string;
  lunch_end?: string;
  clock_out?: string;
  total_hours: number;
  normal_hours: number;
  overtime_hours: number;
  normal_pay: number;
  overtime_pay: number;
  total_pay: number;
  isWeekend?: boolean;
}

interface EmployeeDetailedReportProps {
  selectedMonth: Date;
  onBack: () => void;
}

// Função para formatar horas no padrão HH:MM
const formatHoursAsTime = (hours: number) => {
  if (typeof hours !== 'number' || isNaN(hours) || hours < 0) {
    return '00:00';
  }

  const totalMinutes = Math.round(hours * 60);
  const hoursDisplay = Math.floor(totalMinutes / 60);
  const minutesDisplay = totalMinutes % 60;

  return `${hoursDisplay.toString().padStart(2, '0')}:${minutesDisplay.toString().padStart(2, '0')}`;
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const EmployeeDetailedReport: React.FC<EmployeeDetailedReportProps> = ({ onBack }) => {
  const { user } = useOptimizedAuth();
  const { formatCurrency } = useCurrency();

  // Estados para as datas de início e fim do período (mês atual por padrão)
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()));

  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para armazenar dados do funcionário
  const [userProfile, setUserProfile] = useState<{ hourly_rate: number; overtime_rate: number } | null>(null);
  
  // Estado para configurações do sistema
  const [systemSettings, setSystemSettings] = useState<{
    jornada_padrao_horas: number;
    shift_tolerance_minutes: number;
  } | null>(null);

  // Dialog de detalhes do dia
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState<Date | null>(null);

  // Mapear registros por data
  const recordsByDate = useMemo(() => {
    const map = new Map<string, TimeRecord[]>();
    for (const r of records) {
      const key = r.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [records]);

  // Função para carregar configurações do sistema
  const loadSystemSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['jornada_padrao_horas', 'shift_tolerance_minutes']);

      if (error) {
        console.error('Erro ao carregar configurações do sistema:', error);
        return;
      }

      const settings: any = {};
      data?.forEach(item => {
        settings[item.setting_key] = parseFloat(item.setting_value);
      });

      setSystemSettings({
        jornada_padrao_horas: settings.jornada_padrao_horas || 8,
        shift_tolerance_minutes: settings.shift_tolerance_minutes || 15
      });
    } catch (error) {
      console.error('Erro ao carregar configurações do sistema:', error);
    }
  };

  // Função para calcular horas extras baseada na tolerância
  const calculateOvertimeHours = (totalHours: number, isWeekend: boolean = false) => {
    if (!systemSettings) return 0;
    
    if (isWeekend) {
      // Fins de semana: todas as horas são extras
      return totalHours;
    }

    const { jornada_padrao_horas, shift_tolerance_minutes } = systemSettings;
    const toleranceHours = shift_tolerance_minutes / 60;
    const maxNormalHours = jornada_padrao_horas + toleranceHours;

    if (totalHours <= maxNormalHours) {
      return 0; // Dentro da tolerância
    }

    // Se passou da tolerância, conta apenas o que excedeu a jornada
    return totalHours - jornada_padrao_horas;
  };

  // Totais de horas por data
  const totalsByDate = useMemo(() => {
    const map = new Map<string, { total: number; normal: number; overtime: number }>();
    for (const r of records) {
      const key = r.date;
      const prev = map.get(key) || { total: 0, normal: 0, overtime: 0 };
      const totalHours = prev.total + Number(r.total_hours || 0);
      
      // Calcular horas extras baseada na tolerância
      const overtimeHours = calculateOvertimeHours(totalHours, r.isWeekend);
      const normalHours = totalHours - overtimeHours;
      
      map.set(key, {
        total: totalHours,
        normal: normalHours,
        overtime: overtimeHours
      });
    }
    return map;
  }, [records, systemSettings]);

  // Gerar todos os dias do período (incluindo fins de semana)
  const allDaysInPeriod = useMemo(() => {
    if (!startDate || !endDate) return [];
    return eachDayOfInterval({ start: startDate, end: endDate }).map(date => ({
      date,
      dateKey: format(date, 'yyyy-MM-dd'),
      isWeekend: isWeekend(date),
      dayName: format(date, 'EEE', { locale: ptBR }),
      dayNumber: format(date, 'dd'),
      month: format(date, 'MM'),
      year: format(date, 'yyyy')
    }));
  }, [startDate, endDate]);

  // Função para carregar perfil do usuário
  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('hourly_rate, overtime_rate')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      setUserProfile({
        hourly_rate: profile.hourly_rate || 0,
        overtime_rate: profile.overtime_rate || 0
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Função para carregar registros de ponto
  const loadRecords = async () => {
    if (!user || !startDate || !endDate) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('time_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (error) {
        console.error('Error loading time records:', error);
        return;
      }

      const processedRecords = (data || []).map(record => ({
        ...record,
        total_hours: record.total_hours || 0,
        normal_hours: record.normal_hours || 0,
        overtime_hours: record.overtime_hours || 0,
        normal_pay: record.normal_pay || 0,
        overtime_pay: record.overtime_pay || 0,
        total_pay: record.total_pay || 0,
        isWeekend: isWeekend(parseISO(record.date))
      }));

      setRecords(processedRecords);
    } catch (error) {
      console.error('Error loading time records:', error);
    } finally {
      setLoading(false);
    }
  };


  // Carregar dados quando as datas mudarem
  useEffect(() => {
    if (user && startDate && endDate) {
      loadRecords();
      loadUserProfile();
      loadSystemSettings();
    }
  }, [user, startDate, endDate]);

  // Conteúdo principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Espelho Ponto</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Filters Header */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900">Selecionar Período</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Seletor de Data Inicial */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-base font-medium">Data Inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="startDate" variant="outline" className={cn("w-full justify-start text-left font-normal h-12 text-base")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(d) => {
                      if (d) {
                        setStartDate(startOfMonth(d));
                        setEndDate(endOfMonth(d));
                      }
                    }}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Seletor de Data Final */}
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-base font-medium">Data Final</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="endDate" variant="outline" className={cn("w-full justify-start text-left font-normal h-12 text-base")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(d) => { if (d) setEndDate(endOfMonth(d)); }}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Lista de todos os dias do período */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="mb-4">
            <div className="text-lg font-semibold">Registros do Período</div>
          </div>
          {loading ? (
            <div className="p-6 text-center">
              <Clock className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <span className="text-base">Carregando registros...</span>
            </div>
          ) : allDaysInPeriod.length > 0 ? (
            <div className="space-y-3">
              {allDaysInPeriod.map((dayInfo) => {
                const dayRecords = recordsByDate.get(dayInfo.dateKey) || [];
                const dayTotals = totalsByDate.get(dayInfo.dateKey);
                const hasRecords = dayRecords.length > 0;
                
                return (
                  <div 
                    key={dayInfo.dateKey} 
                    className={cn(
                      "p-4 border-2 rounded-xl transition-colors",
                      dayInfo.isWeekend 
                        ? "border-orange-300 bg-orange-50" 
                        : hasRecords 
                          ? "border-blue-200 bg-blue-50" 
                          : "border-gray-200 bg-gray-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold flex items-center gap-2 flex-wrap">
                          {format(dayInfo.date, 'dd/MM/yyyy (EEE)', { locale: ptBR })}
                          {dayInfo.isWeekend && (
                            <span className="text-xs font-medium text-orange-800 bg-orange-200 px-2 py-1 rounded-full">
                              Fim de Semana
                            </span>
                          )}
                        </h3>
                      </div>

                      {hasRecords && (
                        <div className="text-right shrink-0">
                          <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="font-semibold text-blue-600 tabular-nums">{formatHoursAsTime(dayTotals?.total || 0)}</span>
                            <span>trabalhadas</span>
                          </div>
                          {dayTotals && dayTotals.overtime > 0 && (
                            <div className="text-xs font-medium text-orange-600 mt-0.5">
                              Extras: {formatHoursAsTime(dayTotals.overtime)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {hasRecords ? (
                      <div className="mt-3 space-y-2">
                        {dayRecords.map((record) => (
                          <div key={record.id} className="bg-white rounded-lg p-2.5 border border-gray-200">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                              {([
                                { label: 'Entrada', value: record.clock_in },
                                { label: 'Início Almoço', value: record.lunch_start },
                                { label: 'Fim Almoço', value: record.lunch_end },
                                { label: 'Saída', value: record.clock_out },
                              ] as const).map((item) => (
                                <div key={item.label} className="rounded-md bg-gray-50 px-2 py-1.5">
                                  <div className="text-[10px] uppercase tracking-wide text-gray-500">{item.label}</div>
                                  <div className={cn('text-sm font-semibold tabular-nums', item.value ? 'text-gray-900' : 'text-gray-400')}>
                                    {item.value || '--:--'}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {dayRecords.length > 1 ? 'Registro' : 'Total do dia'}
                              </span>
                              <span className="text-sm font-bold text-blue-600 tabular-nums">{formatHoursAsTime(record.total_hours)}</span>
                            </div>
                          </div>
                        ))}
                        {dayRecords.length > 1 && (
                          <p className="text-xs text-gray-500 text-right">{dayRecords.length} registro(s)</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2">
                        {dayInfo.isWeekend ? 'Sem trabalho' : 'Sem registros'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-600">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-base">Selecione um período para visualizar os registros.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailedReport;
