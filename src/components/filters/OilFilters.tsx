import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface OilFiltersProps {
  filters: {
    viscosity: string[];
    oilType: string[];
    capacity: string[];
  };
  onFilterChange: (key: string, value: any) => void;
}

const VISCOSITIES = ['0W20', '0W30', '5W30', '5W40', '10W40', '10W60', '15W40', '20W50'];
const OIL_TYPES = ['Synthétique', 'Semi-synthétique', 'Minérale'];
const CAPACITIES = ['1L', '2L', '4L', '5L', '10L', '20L', 'Fût'];

const OilFilters = ({ filters, onFilterChange }: OilFiltersProps) => {
  const toggleArray = (key: string, value: string, currentArray: string[]) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    onFilterChange(key, newArray);
  };

  return (
    <Accordion type="multiple" defaultValue={['viscosity', 'type', 'capacity']} className="w-full">
      <AccordionItem value="viscosity">
        <AccordionTrigger className="text-sm font-medium">Viscosité</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {VISCOSITIES.map(v => (
            <div key={v} className="flex items-center space-x-2">
              <Checkbox
                id={`viscosity-${v}`}
                checked={filters.viscosity.includes(v)}
                onCheckedChange={() => toggleArray('viscosity', v, filters.viscosity)}
              />
              <Label htmlFor={`viscosity-${v}`} className="text-sm font-normal cursor-pointer">
                {v}
              </Label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="type">
        <AccordionTrigger className="text-sm font-medium">Type d'huile</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {OIL_TYPES.map(type => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={filters.oilType.includes(type)}
                onCheckedChange={() => toggleArray('oilType', type, filters.oilType)}
              />
              <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer">
                {type}
              </Label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="capacity">
        <AccordionTrigger className="text-sm font-medium">Contenance</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {CAPACITIES.map(cap => (
            <div key={cap} className="flex items-center space-x-2">
              <Checkbox
                id={`capacity-${cap}`}
                checked={filters.capacity.includes(cap)}
                onCheckedChange={() => toggleArray('capacity', cap, filters.capacity)}
              />
              <Label htmlFor={`capacity-${cap}`} className="text-sm font-normal cursor-pointer">
                {cap}
              </Label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default OilFilters;
