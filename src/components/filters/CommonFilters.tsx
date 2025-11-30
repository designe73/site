import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface CommonFiltersProps {
  filters: {
    brands: string[];
    priceMin: string;
    priceMax: string;
    inStock: boolean;
    isPromo: boolean;
  };
  availableBrands: string[];
  onFilterChange: (key: string, value: any) => void;
}

const CommonFilters = ({ filters, availableBrands, onFilterChange }: CommonFiltersProps) => {
  const toggleBrand = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    onFilterChange('brands', newBrands);
  };

  return (
    <Accordion type="multiple" defaultValue={['price', 'availability', 'brand']} className="w-full">
      <AccordionItem value="price">
        <AccordionTrigger className="text-sm font-medium">Prix (CFA)</AccordionTrigger>
        <AccordionContent className="space-y-3">
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) => onFilterChange('priceMin', e.target.value)}
              className="h-9"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) => onFilterChange('priceMax', e.target.value)}
              className="h-9"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="availability">
        <AccordionTrigger className="text-sm font-medium">Disponibilité</AccordionTrigger>
        <AccordionContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={filters.inStock}
              onCheckedChange={(checked) => onFilterChange('inStock', checked)}
            />
            <Label htmlFor="inStock" className="text-sm font-normal cursor-pointer">
              En stock uniquement
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPromo"
              checked={filters.isPromo}
              onCheckedChange={(checked) => onFilterChange('isPromo', checked)}
            />
            <Label htmlFor="isPromo" className="text-sm font-normal cursor-pointer">
              En promotion
            </Label>
          </div>
        </AccordionContent>
      </AccordionItem>

      {availableBrands.length > 0 && (
        <AccordionItem value="brand">
          <AccordionTrigger className="text-sm font-medium">Marque</AccordionTrigger>
          <AccordionContent className="space-y-2 max-h-48 overflow-y-auto">
            {availableBrands.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={() => toggleBrand(brand)}
                />
                <Label htmlFor={`brand-${brand}`} className="text-sm font-normal cursor-pointer">
                  {brand}
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
};

export default CommonFilters;
