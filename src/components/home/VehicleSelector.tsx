import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, ChevronRight } from 'lucide-react';
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

const VehicleSelector = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data } = await supabase.from('vehicles').select('*');
      if (data) {
        setVehicles(data);
        // CORRECTION ICI : .filter(b => b) élimine les chaînes vides
        const uniqueBrands = [...new Set(data.map(v => v.brand))]
          .filter(b => b && b.trim() !== '') 
          .sort();
        setBrands(uniqueBrands);
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      // CORRECTION ICI : filtre pour éviter les modèles vides
      const filteredModels = [...new Set(
        vehicles
          .filter(v => v.brand === selectedBrand)
          .map(v => v.model)
      )]
      .filter(m => m && m.trim() !== '')
      .sort();

      setModels(filteredModels);
      setSelectedModel('');
      setSelectedYear('');
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
    }
  }, [selectedModel, selectedBrand, vehicles]);

  const handleSearch = () => {
    const vehicle = vehicles.find(
      v => v.brand === selectedBrand && v.model === selectedModel && v.year === parseInt(selectedYear)
    );
    if (vehicle) {
      navigate(`/vehicule/${vehicle.id}`);
    }
  };

  const isComplete = selectedBrand && selectedModel && selectedYear;

  return (
    <div className="bg-card rounded-xl shadow-lg p-6 border-2 border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <Car className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="font-roboto-condensed text-xl font-bold">Sélectionnez votre véhicule</h2>
          <p className="text-sm text-muted-foreground">Trouvez les pièces compatibles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Marque" />
          </SelectTrigger>
          <SelectContent>
            {brands.map(brand => (
              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedBrand}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Modèle" />
          </SelectTrigger>
          <SelectContent>
            {models.map(model => (
              <SelectItem key={model} value={model}>{model}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={setSelectedYear} disabled={!selectedModel}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Année" />
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          onClick={handleSearch} 
          disabled={!isComplete}
          className="h-12 btn-primary font-medium text-base"
        >
          Rechercher
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default VehicleSelector;