import { useState, useEffect, useCallback } from 'react';
import { AppointmentService, AppointmentSlot } from '../services/AppointmentService';
import { toast } from 'sonner';

export function useAppointments(coachId?: string) {
    const [settings, setSettings] = useState<any>(null);
    const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSettings = useCallback(async () => {
        if (!coachId) return;
        setLoading(true);
        try {
            const data = await AppointmentService.getCoachSettings(coachId);
            setSettings(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [coachId]);

    const loadAvailableSlots = useCallback(async (date: Date) => {
        if (!coachId) return;
        setLoading(true);
        try {
            const slots = await AppointmentService.getAvailableSlots(coachId, date);
            setAvailableSlots(slots);
        } catch (err: any) {
            setError(err.message);
            toast.error("Erreur lors du chargement des créneaux");
        } finally {
            setLoading(false);
        }
    }, [coachId]);

    const bookAppointment = async (appointmentData: any) => {
        setLoading(true);
        try {
            const { data, error } = await AppointmentService.createAppointment(appointmentData);
            if (error) throw error;
            toast.success("Rendez-vous confirmé !");
            return { data, error: null };
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la réservation");
            return { data: null, error: err };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (coachId) {
            loadSettings();
        }
    }, [coachId, loadSettings]);

    return {
        settings,
        availableSlots,
        loading,
        error,
        loadAvailableSlots,
        bookAppointment,
        refreshSettings: loadSettings
    };
}
