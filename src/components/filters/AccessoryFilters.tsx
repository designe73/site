import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface AccessoryFiltersProps {
  filters: {
    compatibility: string[];
    material: string[];
    color: string[];
  };
  onFilterChange: (key: string, value: any) => void;
}

const COMPATIBILITIES = ['Universel', 'Sur-mesure'];
const MATERIALS = ['Caoutchouc', 'Velours', 'Plastique', 'Tissu', 'Cuir'];
const COLORS = ['Noir', 'Gris', 'Beige', 'Bleu', 'Rouge'];

const AccessoryFilters = ({ filters, onFilterChange }: AccessoryFiltersProps) => {
  const toggleArray = (key: string, value: string, currentArray: string[]) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    onFilterChange(key, newArray);
  };

  return (
    <Accordion type="multiple" defaultValue={['compatibility', 'material', 'color']} className="w-full">
      <AccordionItem value="compatibility">
        <AccordionTrigger className="text-sm font-medium">Compatibilité</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {COMPATIBILITIES.map(comp => (
            <div key={comp} className="flex items-center space-x-2">
              <Checkbox
                id={`comp-${comp}`}
                checked={filters.compatibility.includes(comp)}
                onCheckedChange={() => toggleArray('compatibility', comp, filters.compatibility)}
              />
              <Label htmlFor={`comp-${comp}`} className="text-sm font-normal cursor-pointer">
                {comp}
              </Label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="material">
        <AccordionTrigger className="text-sm font-medium">Matériau</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {MATERIALS.map(mat => (
            <div key={mat} className="flex items-center space-x-2">
              <Checkbox
                id={`mat-${mat}`}
                checked={filters.material.includes(mat)}
                onCheckedChange={() => toggleArray('material', mat, filters.material)}
              />
              <Label htmlFor={`mat-${mat}`} className="text-sm font-normal cursor-pointer">
                {mat}
              </Label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="color">
        <AccordionTrigger className="text-sm font-medium">Couleur</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {COLORS.map(color => (
            <div key={color} className="flex items-center space-x-2">
              <Checkbox
                id={`color-${color}`}
                checked={filters.color.includes(color)}
                onCheckedChange={() => toggleArray('color', color, filters.color)}
              />
              <Label htmlFor={`color-${color}`} className="text-sm font-normal cursor-pointer">
                {color}
              </Label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AccessoryFilters;
