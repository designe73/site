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

interface TireFiltersProps {
  filters: {
    width: string;
    height: string;
    diameter: string;
    season: string[];
    runflat: boolean | null;
  };
  onFilterChange: (key: string, value: any) => void;
}

const WIDTHS = [155, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285, 295, 305];
const HEIGHTS = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
const DIAMETERS = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
const SEASONS = ['Été', 'Hiver', '4 Saisons'];

const TireFilters = ({ filters, onFilterChange }: TireFiltersProps) => {
  const toggleSeason = (season: string) => {
    const newSeasons = filters.season.includes(season)
      ? filters.season.filter(s => s !== season)
      : [...filters.season, season];
    onFilterChange('season', newSeasons);
  };

  return (
    <Accordion type="multiple" defaultValue={['dimensions', 'season', 'options']} className="w-full">
      <AccordionItem value="dimensions">
        <AccordionTrigger className="text-sm font-medium">Dimensions</AccordionTrigger>
        <AccordionContent className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Largeur (mm)</Label>
            <Select value={filters.width} onValueChange={(v) => onFilterChange('width', v)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {WIDTHS.map(w => (
                  <SelectItem key={w} value={w.toString()}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Hauteur (%)</Label>
            <Select value={filters.height} onValueChange={(v) => onFilterChange('height', v)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {HEIGHTS.map(h => (
                  <SelectItem key={h} value={h.toString()}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Diamètre (pouces)</Label>
            <Select value={filters.diameter} onValueChange={(v) => onFilterChange('diameter', v)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {DIAMETERS.map(d => (
                  <SelectItem key={d} value={d.toString()}>R{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="season">
        <AccordionTrigger className="text-sm font-medium">Saison</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {SEASONS.map(season => (
            <div key={season} className="flex items-center space-x-2">
              <Checkbox
                id={`season-${season}`}
                checked={filters.season.includes(season)}
                onCheckedChange={() => toggleSeason(season)}
              />
              <Label htmlFor={`season-${season}`} className="text-sm font-normal cursor-pointer">
                {season}
              </Label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="options">
        <AccordionTrigger className="text-sm font-medium">Options</AccordionTrigger>
        <AccordionContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="runflat"
              checked={filters.runflat === true}
              onCheckedChange={(checked) => onFilterChange('runflat', checked ? true : null)}
            />
            <Label htmlFor="runflat" className="text-sm font-normal cursor-pointer">
              Runflat uniquement
            </Label>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default TireFilters;
