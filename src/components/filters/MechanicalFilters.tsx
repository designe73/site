import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface MechanicalFiltersProps {
  filters: {
    assemblySide: string[];
    material: string[];
    condition: string[];
  };
  onFilterChange: (key: string, value: any) => void;
}

const ASSEMBLY_SIDES = ['Avant', 'Arrière', 'Gauche', 'Droite'];
const MATERIALS = ['Céramique', 'Acier', 'Carbone', 'Aluminium', 'Fonte'];
const CONDITIONS = ['Neuf', 'Reconditionné', 'Occasion'];

const MechanicalFilters = ({ filters, onFilterChange }: MechanicalFiltersProps) => {
  const toggleArray = (key: string, value: string, currentArray: string[]) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    onFilterChange(key, newArray);
  };

  return (
    <Accordion type="multiple" defaultValue={['side', 'material', 'condition']} className="w-full">
      <AccordionItem value="side">
        <AccordionTrigger className="text-sm font-medium">Côté d'assemblage</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {ASSEMBLY_SIDES.map(side => (
            <div key={side} className="flex items-center space-x-2">
              <Checkbox
                id={`side-${side}`}
                checked={filters.assemblySide.includes(side)}
                onCheckedChange={() => toggleArray('assemblySide', side, filters.assemblySide)}
              />
              <Label htmlFor={`side-${side}`} className="text-sm font-normal cursor-pointer">
                {side}
              </Label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="material">
        <AccordionTrigger className="text-sm font-medium">Matériau</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {MATERIALS.map(material => (
            <div key={material} className="flex items-center space-x-2">
              <Checkbox
                id={`material-${material}`}
                checked={filters.material.includes(material)}
                onCheckedChange={() => toggleArray('material', material, filters.material)}
              />
              <Label htmlFor={`material-${material}`} className="text-sm font-normal cursor-pointer">
                {material}
              </Label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="condition">
        <AccordionTrigger className="text-sm font-medium">État</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {CONDITIONS.map(cond => (
            <div key={cond} className="flex items-center space-x-2">
              <Checkbox
                id={`condition-${cond}`}
                checked={filters.condition.includes(cond)}
                onCheckedChange={() => toggleArray('condition', cond, filters.condition)}
              />
              <Label htmlFor={`condition-${cond}`} className="text-sm font-normal cursor-pointer">
                {cond}
              </Label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default MechanicalFilters;
