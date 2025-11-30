import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FilterState, defaultFilters, SpecType } from '@/components/filters/FilterSidebar';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  brand: string | null;
  reference: string | null;
  stock: number;
  is_promo: boolean | null;
}

export const useProductFilters = (categoryId: string | null, sortBy: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [specType, setSpecType] = useState<SpecType>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Fetch spec type for category
  useEffect(() => {
    const fetchSpecType = async () => {
      if (!categoryId) return;
      
      const { data } = await supabase
        .from('category_spec_types')
        .select('spec_type')
        .eq('category_id', categoryId)
        .maybeSingle();
      
      if (data) {
        setSpecType(data.spec_type as SpecType);
      } else {
        setSpecType(null);
      }
    };
    
    fetchSpecType();
  }, [categoryId]);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoryId) return;
      
      setLoading(true);
      
      // Start with base product query
      let query = supabase
        .from('products')
        .select('id, name, slug, price, original_price, image_url, brand, reference, stock, is_promo')
        .eq('category_id', categoryId);

      // Apply vehicle filter
      if (filters.vehicleId) {
        const { data: productVehicles } = await supabase
          .from('product_vehicles')
          .select('product_id')
          .eq('vehicle_id', filters.vehicleId);
        
        if (productVehicles && productVehicles.length > 0) {
          const productIds = productVehicles.map(pv => pv.product_id);
          query = query.in('id', productIds);
        } else {
          // No products for this vehicle
          setProducts([]);
          setLoading(false);
          return;
        }
      }

      // Apply common filters
      if (filters.common.brands.length > 0) {
        query = query.in('brand', filters.common.brands);
      }
      if (filters.common.priceMin) {
        query = query.gte('price', parseFloat(filters.common.priceMin));
      }
      if (filters.common.priceMax) {
        query = query.lte('price', parseFloat(filters.common.priceMax));
      }
      if (filters.common.inStock) {
        query = query.gt('stock', 0);
      }
      if (filters.common.isPromo) {
        query = query.eq('is_promo', true);
      }

      // Apply sorting
      if (sortBy === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order('name');
      }

      const { data: productsData } = await query;
      
      if (!productsData) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // Apply spec-specific filters
      let filteredProducts = productsData;

      if (specType && filteredProducts.length > 0) {
        const productIds = filteredProducts.map(p => p.id);
        
        if (specType === 'tire') {
          const tireFilters = filters.tire;
          let specQuery = supabase.from('tire_specs').select('product_id').in('product_id', productIds);
          
          if (tireFilters.width && tireFilters.width !== 'all') {
            specQuery = specQuery.eq('width', parseInt(tireFilters.width));
          }
          if (tireFilters.height && tireFilters.height !== 'all') {
            specQuery = specQuery.eq('height', parseInt(tireFilters.height));
          }
          if (tireFilters.diameter && tireFilters.diameter !== 'all') {
            specQuery = specQuery.eq('diameter', parseInt(tireFilters.diameter));
          }
          if (tireFilters.season.length > 0) {
            specQuery = specQuery.in('season', tireFilters.season);
          }
          if (tireFilters.runflat === true) {
            specQuery = specQuery.eq('runflat', true);
          }
          
          const { data: specData } = await specQuery;
          if (specData) {
            const specProductIds = specData.map(s => s.product_id);
            filteredProducts = filteredProducts.filter(p => specProductIds.includes(p.id));
          }
        }

        if (specType === 'battery') {
          const batteryFilters = filters.battery;
          let specQuery = supabase.from('battery_specs').select('product_id').in('product_id', productIds);
          
          if (batteryFilters.amperage && batteryFilters.amperage !== 'all') {
            specQuery = specQuery.eq('amperage', parseInt(batteryFilters.amperage));
          }
          if (batteryFilters.startPower && batteryFilters.startPower !== 'all') {
            specQuery = specQuery.eq('start_power', parseInt(batteryFilters.startPower));
          }
          if (batteryFilters.terminalPosition.length > 0) {
            specQuery = specQuery.in('terminal_position', batteryFilters.terminalPosition);
          }
          if (batteryFilters.technology.length > 0) {
            specQuery = specQuery.in('technology', batteryFilters.technology);
          }
          
          const { data: specData } = await specQuery;
          if (specData) {
            const specProductIds = specData.map(s => s.product_id);
            filteredProducts = filteredProducts.filter(p => specProductIds.includes(p.id));
          }
        }

        if (specType === 'mechanical') {
          const mechFilters = filters.mechanical;
          let specQuery = supabase.from('mechanical_specs').select('product_id').in('product_id', productIds);
          
          if (mechFilters.assemblySide.length > 0) {
            specQuery = specQuery.in('assembly_side', mechFilters.assemblySide);
          }
          if (mechFilters.material.length > 0) {
            specQuery = specQuery.in('material', mechFilters.material);
          }
          if (mechFilters.condition.length > 0) {
            specQuery = specQuery.in('condition', mechFilters.condition);
          }
          
          const { data: specData } = await specQuery;
          if (specData) {
            const specProductIds = specData.map(s => s.product_id);
            filteredProducts = filteredProducts.filter(p => specProductIds.includes(p.id));
          }
        }

        if (specType === 'oil') {
          const oilFilters = filters.oil;
          let specQuery = supabase.from('oil_specs').select('product_id').in('product_id', productIds);
          
          if (oilFilters.viscosity.length > 0) {
            specQuery = specQuery.in('viscosity', oilFilters.viscosity);
          }
          if (oilFilters.oilType.length > 0) {
            specQuery = specQuery.in('oil_type', oilFilters.oilType);
          }
          if (oilFilters.capacity.length > 0) {
            specQuery = specQuery.in('capacity', oilFilters.capacity);
          }
          
          const { data: specData } = await specQuery;
          if (specData) {
            const specProductIds = specData.map(s => s.product_id);
            filteredProducts = filteredProducts.filter(p => specProductIds.includes(p.id));
          }
        }

        if (specType === 'accessory') {
          const accFilters = filters.accessory;
          let specQuery = supabase.from('accessory_specs').select('product_id').in('product_id', productIds);
          
          if (accFilters.compatibility.length > 0) {
            specQuery = specQuery.in('compatibility', accFilters.compatibility);
          }
          if (accFilters.material.length > 0) {
            specQuery = specQuery.in('material', accFilters.material);
          }
          if (accFilters.color.length > 0) {
            specQuery = specQuery.in('color', accFilters.color);
          }
          
          const { data: specData } = await specQuery;
          if (specData) {
            const specProductIds = specData.map(s => s.product_id);
            filteredProducts = filteredProducts.filter(p => specProductIds.includes(p.id));
          }
        }
      }

      setProducts(filteredProducts);
      setLoading(false);
    };

    fetchProducts();
  }, [categoryId, filters, sortBy, specType]);

  // Fetch available brands for current category
  useEffect(() => {
    const fetchBrands = async () => {
      if (!categoryId) return;
      
      const { data } = await supabase
        .from('products')
        .select('brand')
        .eq('category_id', categoryId)
        .not('brand', 'is', null);
      
      if (data) {
        const uniqueBrands = [...new Set(data.map(p => p.brand).filter(Boolean))] as string[];
        setAvailableBrands(uniqueBrands.sort());
      }
    };
    
    fetchBrands();
  }, [categoryId]);

  const handleFilterChange = useCallback((section: keyof FilterState, key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...prev[section] as object, [key]: value }
        : value,
    }));
  }, []);

  const handleVehicleSelect = useCallback((vehicleId: string | null) => {
    setFilters(prev => ({ ...prev, vehicleId }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return {
    products,
    loading,
    availableBrands,
    specType,
    filters,
    handleFilterChange,
    handleVehicleSelect,
    resetFilters,
  };
};
