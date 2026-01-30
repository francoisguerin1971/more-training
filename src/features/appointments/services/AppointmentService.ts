import { supabase } from '@/core/services/supabase';
import { addMinutes, format, isAfter, isBefore, parse, startOfDay, endOfDay, isSameDay } from 'date-fns';

export interface TimeSlot {
    start: string;
    end: string;
}

export interface AppointmentSlot {
    time: string;
    isAvailable: boolean;
    reason?: string;
}

export class AppointmentService {
    /**
     * Fetch coach settings from DB
     */
    static async getCoachSettings(coachId: string) {
        const { data, error } = await supabase
            .from('coach_appointment_settings')
            .select('*')
            .eq('coach_id', coachId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching coach settings:', error);
        }

        return data || null;
    }

    /**
     * Generate available slots for a coach on a specific date
     */
    static async getAvailableSlots(coachId: string, date: Date): Promise<AppointmentSlot[]> {
        try {
            const settings = await this.getCoachSettings(coachId);
            if (!settings) return [];

            const dayOfWeek = format(date, 'eee').toLowerCase(); // 'mon', 'tue', etc.
            const dayConfig = settings.weekly_hours[dayOfWeek];

            if (!dayConfig || dayConfig.length === 0) return [];

            // Fetch existing appointments for that day
            const dayStart = startOfDay(date).toISOString();
            const dayEnd = endOfDay(date).toISOString();

            const { data: appointments, error } = await supabase
                .from('appointments')
                .select('start_time, end_time')
                .eq('coach_id', coachId)
                .neq('status', 'CANCELLED')
                .gte('start_time', dayStart)
                .lte('start_time', dayEnd);

            if (error) {
                console.error('Error fetching appointments:', error);
                return [];
            }

            const slots: AppointmentSlot[] = [];
            const duration = settings.default_duration;
            const buffer = settings.buffer_time;

            dayConfig.forEach((period: any) => {
                let current = parse(period.start, 'HH:mm', date);
                const periodEnd = parse(period.end, 'HH:mm', date);

                while (isBefore(addMinutes(current, duration), periodEnd) || format(addMinutes(current, duration), 'HH:mm') === period.end) {
                    const slotStart = current;
                    const slotEnd = addMinutes(current, duration);
                    const timeStr = format(slotStart, 'HH:mm');

                    // Check if slot is in the past
                    const now = new Date();
                    const isPast = isBefore(slotStart, now);

                    // Check for conflicts
                    const hasConflict = appointments?.some(app => {
                        const appStart = new Date(app.start_time);
                        const appEnd = new Date(app.end_time);

                        // Check if slot overlaps with appointment
                        return (
                            (isAfter(slotStart, appStart) || slotStart.getTime() === appStart.getTime()) && isBefore(slotStart, appEnd) ||
                            (isAfter(slotEnd, appStart) && (isBefore(slotEnd, appEnd) || slotEnd.getTime() === appEnd.getTime())) ||
                            (isBefore(slotStart, appStart) && isAfter(slotEnd, appEnd))
                        );
                    });

                    slots.push({
                        time: timeStr,
                        isAvailable: !isPast && !hasConflict
                    });

                    // Move to next slot including buffer
                    current = addMinutes(slotEnd, buffer);
                }
            });

            return slots;
        } catch (err) {
            console.error('Error generating slots:', err);
            return [];
        }
    }

    /**
     * Create an appointment (internal or external) with billing and notifications
     */
    static async createAppointment(appointment: {
        coach_id: string;
        athlete_id?: string;
        title: string;
        description?: string;
        start_time: string;
        end_time: string;
        appointment_type: string;
        client_name?: string;
        client_email?: string;
        client_phone?: string;
        billing_status?: string;
        amount_cents?: number;
    }) {
        const { data: settings } = await supabase
            .from('coach_appointment_settings')
            .select('confirmation_email, confirmation_sms')
            .eq('coach_id', appointment.coach_id)
            .single();

        const { data, error } = await supabase
            .from('appointments')
            .insert([{
                ...appointment,
                status: 'CONFIRMED',
                billing_status: appointment.billing_status || 'pending'
            }])
            .select()
            .single();

        if (data && !error) {
            // Simulate triggering notifications base on coach settings
            if (settings?.confirmation_email) {
                // await EmailService.send(...)
            }
            if (settings?.confirmation_sms && (appointment.client_phone)) {
                // await SMSService.send(...)
            }

            // Trigger billing logic if needed
            if (appointment.billing_status === 'paid') {
                // await BillingService.charge(...)
            }
        }

        return { data, error };
    }

    /**
     * Cancel an appointment with logic
     */
    static async cancelAppointment(appointmentId: string, cancelledBy: 'coach' | 'athlete' | 'external', reason?: string) {
        const { data, error } = await supabase
            .from('appointments')
            .update({
                status: 'CANCELLED',
                cancelled_by: cancelledBy,
                cancellation_reason: reason,
                updated_at: new Date().toISOString()
            })
            .eq('id', appointmentId)
            .select()
            .single();

        if (data && !error) {
        }

        return { data, error };
    }
}
