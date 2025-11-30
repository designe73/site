import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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

export type SpecType = 'tire' | 'battery' | 'mechanical' | 'oil' | 'accessory' | null;

export interface TireSpecForm {
  width: string;
  height: string;
  diameter: string;
  season: string;
  load_index: string;
  speed_index: string;
  runflat: boolean;
}

export interface BatterySpecForm {
  amperage: string;
  start_power: string;
  terminal_position: string;
  technology: string;
  length_mm: string;
  width_mm: string;
  height_mm: string;
}

export interface MechanicalSpecForm {
  assembly_side: string;
  system_type: string;
  material: string;
  condition: string;
}

export interface OilSpecForm {
  viscosity: string;
  oil_type: string;
  manufacturer_norm: string;
  capacity: string;
}

export interface AccessorySpecForm {
  compatibility: string;
  material: string;
  color: string;
}

interface ProductSpecsFormProps {
  specType: SpecType;
  tireForm: TireSpecForm;
  batteryForm: BatterySpecForm;
  mechanicalForm: MechanicalSpecForm;
  oilForm: OilSpecForm;
  accessoryForm: AccessorySpecForm;
  onTireChange: (form: TireSpecForm) => void;
  onBatteryChange: (form: BatterySpecForm) => void;
  onMechanicalChange: (form: MechanicalSpecForm) => void;
  onOilChange: (form: OilSpecForm) => void;
  onAccessoryChange: (form: AccessorySpecForm) => void;
}

const SEASONS = ['Été', 'Hiver', '4 Saisons'];
const TERMINAL_POSITIONS = ['+ à gauche', '+ à droite'];
const TECHNOLOGIES = ['Plomb', 'AGM', 'Gel', 'Start & Stop', 'EFB'];
const ASSEMBLY_SIDES = ['Avant', 'Arrière', 'Gauche', 'Droite'];
const MECH_MATERIALS = ['Céramique', 'Acier', 'Carbone', 'Aluminium', 'Fonte'];
const CONDITIONS = ['Neuf', 'Reconditionné', 'Occasion'];
const VISCOSITIES = ['0W20', '0W30', '5W30', '5W40', '10W40', '10W60', '15W40', '20W50'];
const OIL_TYPES = ['Synthétique', 'Semi-synthétique', 'Minérale'];
const CAPACITIES = ['1L', '2L', '4L', '5L', '10L', '20L', 'Fût'];
const COMPATIBILITIES = ['Universel', 'Sur-mesure'];
const ACC_MATERIALS = ['Caoutchouc', 'Velours', 'Plastique', 'Tissu', 'Cuir'];
const COLORS = ['Noir', 'Gris', 'Beige', 'Bleu', 'Rouge'];

const ProductSpecsForm = ({
  specType,
  tireForm,
  batteryForm,
  mechanicalForm,
  oilForm,
  accessoryForm,
  onTireChange,
  onBatteryChange,
  onMechanicalChange,
  onOilChange,
  onAccessoryChange,
}: ProductSpecsFormProps) => {
  if (!specType) return null;

  return (
    <Accordion type="single" collapsible defaultValue="specs" className="w-full">
      <AccordionItem value="specs">
        <AccordionTrigger className="font-medium">
          Attributs spécifiques ({specType})
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          {specType === 'tire' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Largeur (mm)</Label>
                  <Input
                    type="number"
                    value={tireForm.width}
                    onChange={(e) => onTireChange({ ...tireForm, width: e.target.value })}
                    placeholder="ex: 205"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hauteur (%)</Label>
                  <Input
                    type="number"
                    value={tireForm.height}
                    onChange={(e) => onTireChange({ ...tireForm, height: e.target.value })}
                    placeholder="ex: 55"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Diamètre (pouces)</Label>
                  <Input
                    type="number"
                    value={tireForm.diameter}
                    onChange={(e) => onTireChange({ ...tireForm, diameter: e.target.value })}
                    placeholder="ex: 16"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Saison</Label>
                  <Select value={tireForm.season} onValueChange={(v) => onTireChange({ ...tireForm, season: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEASONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Indice de charge</Label>
                  <Input
                    value={tireForm.load_index}
                    onChange={(e) => onTireChange({ ...tireForm, load_index: e.target.value })}
                    placeholder="ex: 91"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Indice de vitesse</Label>
                  <Input
                    value={tireForm.speed_index}
                    onChange={(e) => onTireChange({ ...tireForm, speed_index: e.target.value })}
                    placeholder="ex: V"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={tireForm.runflat}
                  onCheckedChange={(v) => onTireChange({ ...tireForm, runflat: v })}
                />
                <Label>Runflat</Label>
              </div>
            </>
          )}

          {specType === 'battery' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ampérage (Ah)</Label>
                  <Input
                    type="number"
                    value={batteryForm.amperage}
                    onChange={(e) => onBatteryChange({ ...batteryForm, amperage: e.target.value })}
                    placeholder="ex: 60"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Puissance démarrage (A)</Label>
                  <Input
                    type="number"
                    value={batteryForm.start_power}
                    onChange={(e) => onBatteryChange({ ...batteryForm, start_power: e.target.value })}
                    placeholder="ex: 640"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Position bornes</Label>
                  <Select value={batteryForm.terminal_position} onValueChange={(v) => onBatteryChange({ ...batteryForm, terminal_position: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {TERMINAL_POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Technologie</Label>
                  <Select value={batteryForm.technology} onValueChange={(v) => onBatteryChange({ ...batteryForm, technology: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {TECHNOLOGIES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Longueur (mm)</Label>
                  <Input
                    type="number"
                    value={batteryForm.length_mm}
                    onChange={(e) => onBatteryChange({ ...batteryForm, length_mm: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Largeur (mm)</Label>
                  <Input
                    type="number"
                    value={batteryForm.width_mm}
                    onChange={(e) => onBatteryChange({ ...batteryForm, width_mm: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hauteur (mm)</Label>
                  <Input
                    type="number"
                    value={batteryForm.height_mm}
                    onChange={(e) => onBatteryChange({ ...batteryForm, height_mm: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {specType === 'mechanical' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Côté d'assemblage</Label>
                <Select value={mechanicalForm.assembly_side} onValueChange={(v) => onMechanicalChange({ ...mechanicalForm, assembly_side: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSEMBLY_SIDES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type de système</Label>
                <Input
                  value={mechanicalForm.system_type}
                  onChange={(e) => onMechanicalChange({ ...mechanicalForm, system_type: e.target.value })}
                  placeholder="ex: Bosch, Lucas"
                />
              </div>
              <div className="space-y-2">
                <Label>Matériau</Label>
                <Select value={mechanicalForm.material} onValueChange={(v) => onMechanicalChange({ ...mechanicalForm, material: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {MECH_MATERIALS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>État</Label>
                <Select value={mechanicalForm.condition} onValueChange={(v) => onMechanicalChange({ ...mechanicalForm, condition: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {specType === 'oil' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Viscosité</Label>
                <Select value={oilForm.viscosity} onValueChange={(v) => onOilChange({ ...oilForm, viscosity: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {VISCOSITIES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type d'huile</Label>
                <Select value={oilForm.oil_type} onValueChange={(v) => onOilChange({ ...oilForm, oil_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {OIL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Norme constructeur</Label>
                <Input
                  value={oilForm.manufacturer_norm}
                  onChange={(e) => onOilChange({ ...oilForm, manufacturer_norm: e.target.value })}
                  placeholder="ex: VW 507.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Contenance</Label>
                <Select value={oilForm.capacity} onValueChange={(v) => onOilChange({ ...oilForm, capacity: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAPACITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {specType === 'accessory' && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Compatibilité</Label>
                <Select value={accessoryForm.compatibility} onValueChange={(v) => onAccessoryChange({ ...accessoryForm, compatibility: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPATIBILITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Matériau</Label>
                <Select value={accessoryForm.material} onValueChange={(v) => onAccessoryChange({ ...accessoryForm, material: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACC_MATERIALS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Couleur</Label>
                <Select value={accessoryForm.color} onValueChange={(v) => onAccessoryChange({ ...accessoryForm, color: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ProductSpecsForm;
