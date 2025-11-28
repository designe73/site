import { Link } from 'react-router-dom';
import { Truck, Shield, Headphones, CreditCard } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Livraison rapide',
    description: 'Gratuite dès 50 000 CFA',
  },
  {
    icon: Shield,
    title: 'Garantie qualité',
    description: 'Pièces certifiées',
  },
  {
    icon: Headphones,
    title: 'Support 24/7',
    description: 'À votre écoute',
  },
  {
    icon: CreditCard,
    title: 'Paiement sécurisé',
    description: 'Mobile money & CB',
  },
];

const PromoBanner = () => {
  return (
    <section className="py-8">
      <div className="bg-gradient-orange rounded-xl p-8 text-primary-foreground">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <feature.icon className="h-10 w-10 mb-3" />
              <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
              <p className="text-sm opacity-90">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
