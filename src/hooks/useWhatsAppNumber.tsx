import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSettings } from './useSiteSettings';

interface WhatsAppNumber {
  id: string;
  phone_number: string;
  name: string | null;
  is_active: boolean;
  position: number;
}

// Store last used index globally for rotation
let lastUsedIndex = -1;

export const useWhatsAppNumber = () => {
  const [numbers, setNumbers] = useState<WhatsAppNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();

  const fetchNumbers = useCallback(async () => {
    const { data, error } = await supabase
      .from('whatsapp_numbers')
      .select('*')
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching WhatsApp numbers:', error);
      setNumbers([]);
    } else {
      setNumbers(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNumbers();
  }, [fetchNumbers]);

  // Get next number in rotation
  const getNextNumber = useCallback(() => {
    if (numbers.length === 0) {
      // Fallback to settings whatsapp_number or contact_phone
      const fallback = settings?.whatsapp_number || settings?.contact_phone || '+221771234567';
      return fallback.replace(/\s/g, '').replace('+', '');
    }

    // Rotate to next number
    lastUsedIndex = (lastUsedIndex + 1) % numbers.length;
    const number = numbers[lastUsedIndex];
    return number.phone_number.replace(/\s/g, '').replace('+', '');
  }, [numbers, settings]);

  // Get a specific number or the next in rotation
  const getWhatsAppUrl = useCallback((message: string, specificNumber?: string) => {
    const phone = specificNumber 
      ? specificNumber.replace(/\s/g, '').replace('+', '')
      : getNextNumber();
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }, [getNextNumber]);

  return {
    numbers,
    loading,
    getNextNumber,
    getWhatsAppUrl,
    refetch: fetchNumbers,
  };
};

// Hook for admin to manage all numbers (including inactive)
export const useWhatsAppNumbersAdmin = () => {
  const [numbers, setNumbers] = useState<WhatsAppNumber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNumbers = useCallback(async () => {
    const { data, error } = await supabase
      .from('whatsapp_numbers')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching WhatsApp numbers:', error);
      setNumbers([]);
    } else {
      setNumbers(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNumbers();
  }, [fetchNumbers]);

  const addNumber = async (phoneNumber: string, name?: string) => {
    const maxPosition = numbers.length > 0 
      ? Math.max(...numbers.map(n => n.position)) + 1 
      : 0;

    const { error } = await supabase
      .from('whatsapp_numbers')
      .insert({
        phone_number: phoneNumber,
        name: name || null,
        position: maxPosition,
      });

    if (error) throw error;
    await fetchNumbers();
  };

  const updateNumber = async (id: string, updates: Partial<WhatsAppNumber>) => {
    const { error } = await supabase
      .from('whatsapp_numbers')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchNumbers();
  };

  const deleteNumber = async (id: string) => {
    const { error } = await supabase
      .from('whatsapp_numbers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchNumbers();
  };

  const reorderNumbers = async (orderedIds: string[]) => {
    const updates = orderedIds.map((id, index) => 
      supabase
        .from('whatsapp_numbers')
        .update({ position: index })
        .eq('id', id)
    );

    await Promise.all(updates);
    await fetchNumbers();
  };

  return {
    numbers,
    loading,
    addNumber,
    updateNumber,
    deleteNumber,
    reorderNumbers,
    refetch: fetchNumbers,
  };
};