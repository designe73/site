import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface BatteryFiltersProps {
  filters: {
    amperage: string;
    startPower: string;
    terminalPosition: string[];
    technology: string[];
  };
  onFilterChange: (key: string, value: any) => void;
}

const AMPERAGES = [40, 45, 50, 55, 60, 65, 70, 74, 80, 85, 90, 95, 100, 110];
const START_POWERS = [300, 360, 400, 450, 500, 540, 600, 640, 680, 720, 760, 800, 850, 900];
const TERMINAL_POSITIONS = ['+ à gauche', '+ à droite'];
const TECHNOLOGIES = ['Plomb', 'AGM', 'Gel', 'Start & Stop', 'EFB'];

const BatteryFilters = ({ filters, onFilterChange }: BatteryFiltersProps) => {
  const toggleArray = (key: string, value: string, currentArray: string[]) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    onFilterChange(key, newArray);
  };

  return (
    <Accordion type="multiple" defaultValue={['capacity', 'terminal', 'technology']} className="w-full">
      <AccordionItem value="capacity">
        <AccordionTrigger className="text-sm font-medium">Capacité</AccordionTrigger>
        <AccordionContent className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Ampérage (Ah)</Label>
            <Select value={filters.amperage} onValueChange={(v) => onFilterChange('amperage', v)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {AMPERAGES.map(a => (
                  <SelectItem key={a} value={a.toString()}>{a} Ah</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Puissance démarrage (A)</Label>
            <Select value={filters.startPower} onValueChange={(v) => onFilterChange('startPower', v)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {START_POWERS.map(p => (
                  <SelectItem key={p} value={p.toString()}>{p} A</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="terminal">
        <AccordionTrigger className="text-sm font-medium">Position bornes</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {TERMINAL_POSITIONS.map(pos => (
            <div key={pos} className="flex items-center space-x-2">
              <Checkbox
                id={`terminal-${pos}`}
                checked={filters.terminalPosition.includes(pos)}
                onCheckedChange={() => toggleArray('terminalPosition', pos, filters.terminalPosition)}
              />
              <Label htmlFor={`terminal-${pos}`} className="text-sm font-normal cursor-pointer">
                {pos}
              </Label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="technology">
        <AccordionTrigger className="text-sm font-medium">Technologie</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {TECHNOLOGIES.map(tech => (
            <div key={tech} className="flex items-center space-x-2">
              <Checkbox
                id={`tech-${tech}`}
                checked={filters.technology.includes(tech)}
                onCheckedChange={() => toggleArray('technology', tech, filters.technology)}
              />
              <Label htmlFor={`tech-${tech}`} className="text-sm font-normal cursor-pointer">
                {tech}
              </Label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default BatteryFilters;
