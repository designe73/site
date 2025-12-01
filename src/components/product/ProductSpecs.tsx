import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface ProductSpecsProps {
  productId: string;
  categoryId: string | null;
}

type SpecType = 'tire' | 'battery' | 'mechanical' | 'oil' | 'accessory' | null;

interface TireSpec {
  width: number | null;
  height: number | null;
  diameter: number | null;
  season: string | null;
  load_index: string | null;
  speed_index: string | null;
  runflat: boolean | null;
}

interface BatterySpec {
  amperage: number | null;
  start_power: number | null;
  terminal_position: string | null;
  technology: string | null;
  length_mm: number | null;
  width_mm: number | null;
  height_mm: number | null;
}

interface MechanicalSpec {
  assembly_side: string | null;
  system_type: string | null;
  material: string | null;
  condition: string | null;
}

interface OilSpec {
  viscosity: string | null;
  oil_type: string | null;
  manufacturer_norm: string | null;
  capacity: string | null;
}

interface AccessorySpec {
  compatibility: string | null;
  material: string | null;
  color: string | null;
}

const ProductSpecs = ({ productId, categoryId }: ProductSpecsProps) => {
  const [specType, setSpecType] = useState<SpecType>(null);
  const [tireSpec, setTireSpec] = useState<TireSpec | null>(null);
  const [batterySpec, setBatterySpec] = useState<BatterySpec | null>(null);
  const [mechanicalSpec, setMechanicalSpec] = useState<MechanicalSpec | null>(null);
  const [oilSpec, setOilSpec] = useState<OilSpec | null>(null);
  const [accessorySpec, setAccessorySpec] = useState<AccessorySpec | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecs = async () => {
      if (!categoryId) {
        setLoading(false);
        return;
      }

      // Get spec type for category
      const { data: specTypeData } = await supabase
        .from('category_spec_types')
        .select('spec_type')
        .eq('category_id', categoryId)
        .maybeSingle();

      if (!specTypeData) {
        setLoading(false);
        return;
      }

      const type = specTypeData.spec_type as SpecType;
      setSpecType(type);

      // Fetch corresponding specs
      if (type === 'tire') {
        const { data } = await supabase
          .from('tire_specs')
          .select('*')
          .eq('product_id', productId)
          .maybeSingle();
        setTireSpec(data);
      } else if (type === 'battery') {
        const { data } = await supabase
          .from('battery_specs')
          .select('*')
          .eq('product_id', productId)
          .maybeSingle();
        setBatterySpec(data);
      } else if (type === 'mechanical') {
        const { data } = await supabase
          .from('mechanical_specs')
          .select('*')
          .eq('product_id', productId)
          .maybeSingle();
        setMechanicalSpec(data);
      } else if (type === 'oil') {
        const { data } = await supabase
          .from('oil_specs')
          .select('*')
          .eq('product_id', productId)
          .maybeSingle();
        setOilSpec(data);
      } else if (type === 'accessory') {
        const { data } = await supabase
          .from('accessory_specs')
          .select('*')
          .eq('product_id', productId)
          .maybeSingle();
        setAccessorySpec(data);
      }

      setLoading(false);
    };

    fetchSpecs();
  }, [productId, categoryId]);

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </Card>
    );
  }

  if (!specType) return null;

  const renderSpecRow = (label: string, value: string | number | boolean | null) => {
    if (value === null || value === undefined || value === '') return null;
    
    return (
      <div className="flex justify-between py-2 border-b border-border last:border-0">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : value}
        </span>
      </div>
    );
  };

  const hasSpecs = () => {
    if (specType === 'tire' && tireSpec) {
      return Object.values(tireSpec).some(v => v !== null && v !== undefined);
    }
    if (specType === 'battery' && batterySpec) {
      return Object.values(batterySpec).some(v => v !== null && v !== undefined);
    }
    if (specType === 'mechanical' && mechanicalSpec) {
      return Object.values(mechanicalSpec).some(v => v !== null && v !== undefined);
    }
    if (specType === 'oil' && oilSpec) {
      return Object.values(oilSpec).some(v => v !== null && v !== undefined);
    }
    if (specType === 'accessory' && accessorySpec) {
      return Object.values(accessorySpec).some(v => v !== null && v !== undefined);
    }
    return false;
  };

  if (!hasSpecs()) return null;

  return (
    <Card className="p-4">
      <h3 className="font-roboto-condensed text-lg font-bold mb-4 flex items-center gap-2">
        Caractéristiques techniques
        <Badge variant="secondary" className="text-xs">
          {specType === 'tire' && 'Pneu'}
          {specType === 'battery' && 'Batterie'}
          {specType === 'mechanical' && 'Mécanique'}
          {specType === 'oil' && 'Huile'}
          {specType === 'accessory' && 'Accessoire'}
        </Badge>
      </h3>

      <div className="space-y-0">
        {specType === 'tire' && tireSpec && (
          <>
            {renderSpecRow('Dimensions', tireSpec.width && tireSpec.height && tireSpec.diameter 
              ? `${tireSpec.width}/${tireSpec.height} R${tireSpec.diameter}` 
              : null)}
            {renderSpecRow('Saison', tireSpec.season)}
            {renderSpecRow('Indice de charge', tireSpec.load_index)}
            {renderSpecRow('Indice de vitesse', tireSpec.speed_index)}
            {renderSpecRow('Runflat', tireSpec.runflat)}
          </>
        )}

        {specType === 'battery' && batterySpec && (
          <>
            {renderSpecRow('Ampérage', batterySpec.amperage ? `${batterySpec.amperage} Ah` : null)}
            {renderSpecRow('Puissance démarrage', batterySpec.start_power ? `${batterySpec.start_power} A` : null)}
            {renderSpecRow('Position bornes', batterySpec.terminal_position)}
            {renderSpecRow('Technologie', batterySpec.technology)}
            {renderSpecRow('Dimensions (L×l×H)', 
              batterySpec.length_mm && batterySpec.width_mm && batterySpec.height_mm
                ? `${batterySpec.length_mm}×${batterySpec.width_mm}×${batterySpec.height_mm} mm`
                : null
            )}
          </>
        )}

        {specType === 'mechanical' && mechanicalSpec && (
          <>
            {renderSpecRow('Côté d\'assemblage', mechanicalSpec.assembly_side)}
            {renderSpecRow('Type de système', mechanicalSpec.system_type)}
            {renderSpecRow('Matériau', mechanicalSpec.material)}
            {renderSpecRow('État', mechanicalSpec.condition)}
          </>
        )}

        {specType === 'oil' && oilSpec && (
          <>
            {renderSpecRow('Viscosité', oilSpec.viscosity)}
            {renderSpecRow('Type', oilSpec.oil_type)}
            {renderSpecRow('Norme constructeur', oilSpec.manufacturer_norm)}
            {renderSpecRow('Contenance', oilSpec.capacity)}
          </>
        )}

        {specType === 'accessory' && accessorySpec && (
          <>
            {renderSpecRow('Compatibilité', accessorySpec.compatibility)}
            {renderSpecRow('Matériau', accessorySpec.material)}
            {renderSpecRow('Couleur', accessorySpec.color)}
          </>
        )}
      </div>
    </Card>
  );
};

export default ProductSpecs;
