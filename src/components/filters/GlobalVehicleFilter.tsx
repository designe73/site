import { useState, useEffect } from 'react';
import { Car, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  engine: string | null;
}

interface GlobalVehicleFilterProps {
  onVehicleSelect: (vehicleId: string | null) => void;
  selectedVehicleId: string | null;
}

const GlobalVehicleFilter = ({ onVehicleSelect, selectedVehicleId }: GlobalVehicleFilterProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [engines, setEngines] = useState<string[]>([]);
  
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedEngine, setSelectedEngine] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data } = await supabase.from('vehicles').select('*');
      if (data) {
        setVehicles(data);
        const uniqueBrands = [...new Set(data.map(v => v.brand))].sort();
        setBrands(uniqueBrands);
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      const filteredModels = [...new Set(
        vehicles.filter(v => v.brand === selectedBrand).map(v => v.model)
      )].sort();
      setModels(filteredModels);
      setSelectedModel('');
      setSelectedYear('');
      setSelectedEngine('');
    }
  }, [selectedBrand, vehicles]);

  useEffect(() => {
    if (selectedModel) {
      const filteredYears = [...new Set(
        vehicles
          .filter(v => v.brand === selectedBrand && v.model === selectedModel)
          .map(v => v.year)
      )].sort((a, b) => b - a);
      setYears(filteredYears);
      setSelectedYear('');
      setSelectedEngine('');
    }
  }, [selectedModel, selectedBrand, vehicles]);

  useEffect(() => {
    if (selectedYear) {
      const filteredEngines = vehicles
        .filter(v => v.brand === selectedBrand && v.model === selectedModel && v.year === parseInt(selectedYear))
        .map(v => v.engine)
        .filter((e): e is string => e !== null);
      const uniqueEngines = [...new Set(filteredEngines)].sort();
      setEngines(uniqueEngines);
      setSelectedEngine('');
    }
  }, [selectedYear, selectedModel, selectedBrand, vehicles]);

  useEffect(() => {
    if (selectedBrand && selectedModel && selectedYear) {
      const vehicle = vehicles.find(
        v => v.brand === selectedBrand && 
             v.model === selectedModel && 
             v.year === parseInt(selectedYear) &&
             (selectedEngine ? v.engine === selectedEngine : true)
      );
      if (vehicle) {
        setSelectedVehicle(vehicle);
        onVehicleSelect(vehicle.id);
      }
    }
  }, [selectedBrand, selectedModel, selectedYear, selectedEngine, vehicles, onVehicleSelect]);

  const clearSelection = () => {
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedYear('');
    setSelectedEngine('');
    setSelectedVehicle(null);
    onVehicleSelect(null);
  };

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-primary" />
          <h3 className="font-roboto-condensed font-bold">Mon véhicule</h3>
        </div>
        {selectedVehicle && (
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {selectedVehicle ? (
        <div className="bg-accent/50 rounded-lg p-3 text-sm">
          <p className="font-medium">{selectedVehicle.brand} {selectedVehicle.model}</p>
          <p className="text-muted-foreground">{selectedVehicle.year} {selectedVehicle.engine && `- ${selectedVehicle.engine}`}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger>
              <SelectValue placeholder="Marque" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(brand => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedBrand}>
            <SelectTrigger>
              <SelectValue placeholder="Modèle" />
            </SelectTrigger>
            <SelectContent>
              {models.map(model => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear} disabled={!selectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {engines.length > 0 && (
            <Select value={selectedEngine} onValueChange={setSelectedEngine} disabled={!selectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Motorisation" />
              </SelectTrigger>
              <SelectContent>
                {engines.map(engine => (
                  <SelectItem key={engine} value={engine}>{engine}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalVehicleFilter;
