import { Check, Clock, Package, Truck, Home, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderTimelineProps {
  status: string;
  createdAt: string;
}

const ORDER_STEPS = [
  { key: 'pending', label: 'En attente', icon: Clock, description: 'Commande reçue' },
  { key: 'confirmed', label: 'Confirmée', icon: Check, description: 'Commande confirmée' },
  { key: 'processing', label: 'Préparation', icon: Package, description: 'En cours de préparation' },
  { key: 'shipped', label: 'Expédiée', icon: Truck, description: 'En cours de livraison' },
  { key: 'delivered', label: 'Livrée', icon: Home, description: 'Commande livrée' },
];

const getStepIndex = (status: string): number => {
  const index = ORDER_STEPS.findIndex(step => step.key === status);
  return index >= 0 ? index : 0;
};

export const OrderTimeline = ({ status, createdAt }: OrderTimelineProps) => {
  const currentIndex = getStepIndex(status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="flex items-center gap-3 text-destructive">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <X className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Commande annulée</p>
            <p className="text-sm text-muted-foreground">
              {new Date(createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-muted rounded-full" />
        
        {/* Progress bar filled */}
        <div 
          className="absolute top-6 left-6 h-1 bg-primary rounded-full transition-all duration-500"
          style={{ width: `calc(${(currentIndex / (ORDER_STEPS.length - 1)) * 100}% - 24px)` }}
        />
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {ORDER_STEPS.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = step.icon;
            
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    isCompleted 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "bg-background border-muted text-muted-foreground",
                    isCurrent && "ring-4 ring-primary/20 scale-110"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-3 text-center">
                  <p className={cn(
                    "text-sm font-medium",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
