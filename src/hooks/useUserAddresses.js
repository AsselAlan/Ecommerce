/**
 * Hook para manejar direcciones de usuario
 * Utiliza la nueva tabla 'direcciones' creada en la migración 005
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../libs/supabaseClient';
import { useAuth } from '../useAuth';

export const useUserAddresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar direcciones del usuario
  const loadAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setDefaultAddress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('direcciones')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('activa', true)
        .order('es_predeterminada', { ascending: false })
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;

      setAddresses(data || []);
      
      // Encontrar dirección predeterminada
      const defaultAddr = data?.find(addr => addr.es_predeterminada);
      setDefaultAddress(defaultAddr || null);

    } catch (err) {
      console.error('Error cargando direcciones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Crear nueva dirección
  const createAddress = async (addressData) => {
    if (!user) {
      throw new Error('Debes iniciar sesión');
    }

    try {
      const { data, error } = await supabase
        .from('direcciones')
        .insert({
          ...addressData,
          usuario_id: user.id
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Ya tienes una dirección con ese alias');
        }
        throw error;
      }

      // Actualizar estado local
      setAddresses(prev => [data, ...prev]);
      
      // Si es la primera dirección o se marcó como predeterminada
      if (addresses.length === 0 || data.es_predeterminada) {
        setDefaultAddress(data);
      }

      return data;
    } catch (err) {
      console.error('Error creando dirección:', err);
      throw err;
    }
  };

  // Actualizar dirección
  const updateAddress = async (addressId, addressData) => {
    if (!user) {
      throw new Error('Debes iniciar sesión');
    }

    try {
      const { data, error } = await supabase
        .from('direcciones')
        .update(addressData)
        .eq('id', addressId)
        .eq('usuario_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local
      setAddresses(prev => 
        prev.map(addr => addr.id === addressId ? data : addr)
      );

      // Actualizar dirección predeterminada si cambió
      if (data.es_predeterminada) {
        setDefaultAddress(data);
      } else if (defaultAddress?.id === addressId) {
        // Si era predeterminada y ya no, encontrar la nueva
        const newDefault = addresses.find(addr => 
          addr.id !== addressId && addr.es_predeterminada
        );
        setDefaultAddress(newDefault || null);
      }

      return data;
    } catch (err) {
      console.error('Error actualizando dirección:', err);
      throw err;
    }
  };

  // Eliminar dirección (marcar como inactiva)
  const deleteAddress = async (addressId) => {
    if (!user) {
      throw new Error('Debes iniciar sesión');
    }

    try {
      const { error } = await supabase
        .from('direcciones')
        .update({ activa: false })
        .eq('id', addressId)
        .eq('usuario_id', user.id);

      if (error) throw error;

      // Actualizar estado local
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      
      // Si era la dirección predeterminada, seleccionar otra
      if (defaultAddress?.id === addressId) {
        const remainingAddresses = addresses.filter(addr => addr.id !== addressId);
        const newDefault = remainingAddresses[0] || null;
        
        if (newDefault) {
          await setAsDefault(newDefault.id);
        } else {
          setDefaultAddress(null);
        }
      }

    } catch (err) {
      console.error('Error eliminando dirección:', err);
      throw err;
    }
  };

  // Establecer dirección como predeterminada
  const setAsDefault = async (addressId) => {
    if (!user) {
      throw new Error('Debes iniciar sesión');
    }

    try {
      const { data, error } = await supabase
        .from('direcciones')
        .update({ es_predeterminada: true })
        .eq('id', addressId)
        .eq('usuario_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // El trigger en la BD se encarga de desmarcar las otras automáticamente
      // Actualizar estado local
      setAddresses(prev => 
        prev.map(addr => ({
          ...addr,
          es_predeterminada: addr.id === addressId
        }))
      );
      
      setDefaultAddress(data);

      return data;
    } catch (err) {
      console.error('Error estableciendo dirección predeterminada:', err);
      throw err;
    }
  };

  // Obtener dirección formateada para mostrar
  const formatAddress = useCallback((address) => {
    if (!address) return '';

    const parts = [
      address.calle,
      address.numero,
      address.piso && `Piso ${address.piso}`,
      address.departamento && `Depto ${address.departamento}`,
      address.ciudad,
      address.provincia,
      address.codigo_postal && `(${address.codigo_postal})`
    ].filter(Boolean);

    return parts.join(' ');
  }, []);

  // Validar dirección
  const validateAddress = useCallback((addressData) => {
    const errors = {};

    if (!addressData.alias?.trim()) {
      errors.alias = 'El alias es obligatorio';
    }

    if (!addressData.nombre_completo?.trim()) {
      errors.nombre_completo = 'El nombre completo es obligatorio';
    }

    if (!addressData.calle?.trim()) {
      errors.calle = 'La calle es obligatoria';
    }

    if (!addressData.numero?.trim()) {
      errors.numero = 'El número es obligatorio';
    }

    if (!addressData.ciudad?.trim()) {
      errors.ciudad = 'La ciudad es obligatoria';
    }

    if (!addressData.provincia?.trim()) {
      errors.provincia = 'La provincia es obligatoria';
    }

    if (!addressData.codigo_postal?.trim()) {
      errors.codigo_postal = 'El código postal es obligatorio';
    }

    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (addressData.telefono && !phoneRegex.test(addressData.telefono)) {
      errors.telefono = 'El teléfono tiene un formato inválido';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  // Cargar direcciones al montar o cambiar usuario
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  return {
    addresses,
    defaultAddress,
    loading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setAsDefault,
    formatAddress,
    validateAddress,
    refreshAddresses: loadAddresses,
    hasAddresses: addresses.length > 0
  };
};

// Hook simple para obtener solo la dirección predeterminada
export const useDefaultAddress = () => {
  const { user } = useAuth();
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDefaultAddress = async () => {
      if (!user) {
        setDefaultAddress(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('direcciones')
          .select('*')
          .eq('usuario_id', user.id)
          .eq('activa', true)
          .eq('es_predeterminada', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        setDefaultAddress(data || null);
      } catch (error) {
        console.error('Error cargando dirección predeterminada:', error);
        setDefaultAddress(null);
      } finally {
        setLoading(false);
      }
    };

    loadDefaultAddress();
  }, [user]);

  return { defaultAddress, loading };
};