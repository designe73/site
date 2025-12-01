import { useEffect, useState } from 'react';
import { Car } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  engine: string | null;
}

interface CompatibleVehiclesProps {
  productId: string;
}

const CompatibleVehicles = ({ productId }: CompatibleVehiclesProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data } = await supabase
        .from('product_vehicles')
        .select(`
          vehicle:vehicles (
            id,
            brand,
            model,
            year,
            engine
          )
        `)
        .eq('product_id', productId);

      if (data) {
        const formattedVehicles = data
          .map((pv: any) => pv.vehicle)
          .filter(Boolean) as Vehicle[];
        setVehicles(formattedVehicles);
      }
      setLoading(false);
    };

    fetchVehicles();
  }, [productId]);

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="flex gap-2 flex-wrap">
          <div className="h-8 bg-muted rounded w-32" />
          <div className="h-8 bg-muted rounded w-40" />
          <div className="h-8 bg-muted rounded w-36" />
        </div>
      </Card>
    );
  }

  if (vehicles.length === 0) return null;

  // Group vehicles by brand
  const groupedByBrand = vehicles.reduce((acc, vehicle) => {
    if (!acc[vehicle.brand]) {
      acc[vehicle.brand] = [];
    }
    acc[vehicle.brand].push(vehicle);
    return acc;
  }, {} as Record<string, Vehicle[]>);

  return (
    <Card className="p-4">
      <h3 className="font-roboto-condensed text-lg font-bold mb-4 flex items-center gap-2">
        <Car className="h-5 w-5 text-primary" />
        Véhicules compatibles
        <Badge variant="secondary" className="ml-2">{vehicles.length}</Badge>
      </h3>

      <div className="space-y-4">
        {Object.entries(groupedByBrand).map(([brand, brandVehicles]) => (
          <div key={brand}>
            <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">
              {brand}
            </h4>
            <div className="flex flex-wrap gap-2">
              {brandVehicles.map((vehicle) => (
                <Badge
                  key={vehicle.id}
                  variant="outline"
                  className="py-1.5 px-3 text-sm"
                >
                  {vehicle.model} {vehicle.year}
                  {vehicle.engine && (
                    <span className="text-muted-foreground ml-1">
                      ({vehicle.engine})
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CompatibleVehicles;
