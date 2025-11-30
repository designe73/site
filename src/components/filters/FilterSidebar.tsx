import { X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import GlobalVehicleFilter from './GlobalVehicleFilter';
import TireFilters from './TireFilters';
import BatteryFilters from './BatteryFilters';
import MechanicalFilters from './MechanicalFilters';
import OilFilters from './OilFilters';
import AccessoryFilters from './AccessoryFilters';
import CommonFilters from './CommonFilters';

export type SpecType = 'tire' | 'battery' | 'mechanical' | 'oil' | 'accessory' | null;

export interface FilterState {
  vehicleId: string | null;
  common: {
    brands: string[];
    priceMin: string;
    priceMax: string;
    inStock: boolean;
    isPromo: boolean;
  };
  tire: {
    width: string;
    height: string;
    diameter: string;
    season: string[];
    runflat: boolean | null;
  };
  battery: {
    amperage: string;
    startPower: string;
    terminalPosition: string[];
    technology: string[];
  };
  mechanical: {
    assemblySide: string[];
    material: string[];
    condition: string[];
  };
  oil: {
    viscosity: string[];
    oilType: string[];
    capacity: string[];
  };
  accessory: {
    compatibility: string[];
    material: string[];
    color: string[];
  };
}

export const defaultFilters: FilterState = {
  vehicleId: null,
  common: {
    brands: [],
    priceMin: '',
    priceMax: '',
    inStock: false,
    isPromo: false,
  },
  tire: {
    width: 'all',
    height: 'all',
    diameter: 'all',
    season: [],
    runflat: null,
  },
  battery: {
    amperage: 'all',
    startPower: 'all',
    terminalPosition: [],
    technology: [],
  },
  mechanical: {
    assemblySide: [],
    material: [],
    condition: [],
  },
  oil: {
    viscosity: [],
    oilType: [],
    capacity: [],
  },
  accessory: {
    compatibility: [],
    material: [],
    color: [],
  },
};

interface FilterSidebarProps {
  specType: SpecType;
  filters: FilterState;
  availableBrands: string[];
  onFilterChange: (section: keyof FilterState, key: string, value: any) => void;
  onVehicleSelect: (vehicleId: string | null) => void;
  onReset: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const FilterSidebar = ({
  specType,
  filters,
  availableBrands,
  onFilterChange,
  onVehicleSelect,
  onReset,
  onClose,
  isMobile,
}: FilterSidebarProps) => {
  const hasActiveFilters = () => {
    if (filters.vehicleId) return true;
    if (filters.common.brands.length > 0) return true;
    if (filters.common.priceMin || filters.common.priceMax) return true;
    if (filters.common.inStock || filters.common.isPromo) return true;
    return false;
  };

  return (
    <div className="bg-card rounded-lg border border-border h-fit">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-roboto-condensed font-bold">Filtres</h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          )}
          {isMobile && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Global Vehicle Filter */}
        <GlobalVehicleFilter
          onVehicleSelect={onVehicleSelect}
          selectedVehicleId={filters.vehicleId}
        />

        <Separator />

        {/* Common Filters */}
        <CommonFilters
          filters={filters.common}
          availableBrands={availableBrands}
          onFilterChange={(key, value) => onFilterChange('common', key, value)}
        />

        {/* Category-specific Filters */}
        {specType && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium text-sm mb-3 text-muted-foreground">Filtres spécifiques</h3>
              
              {specType === 'tire' && (
                <TireFilters
                  filters={filters.tire}
                  onFilterChange={(key, value) => onFilterChange('tire', key, value)}
                />
              )}
              
              {specType === 'battery' && (
                <BatteryFilters
                  filters={filters.battery}
                  onFilterChange={(key, value) => onFilterChange('battery', key, value)}
                />
              )}
              
              {specType === 'mechanical' && (
                <MechanicalFilters
                  filters={filters.mechanical}
                  onFilterChange={(key, value) => onFilterChange('mechanical', key, value)}
                />
              )}
              
              {specType === 'oil' && (
                <OilFilters
                  filters={filters.oil}
                  onFilterChange={(key, value) => onFilterChange('oil', key, value)}
                />
              )}
              
              {specType === 'accessory' && (
                <AccessoryFilters
                  filters={filters.accessory}
                  onFilterChange={(key, value) => onFilterChange('accessory', key, value)}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
