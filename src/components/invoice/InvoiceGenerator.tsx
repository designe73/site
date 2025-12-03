import { useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatPrice } from '@/lib/formatPrice';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';

interface InvoiceItem {
  name: string;
  reference: string | null;
  quantity: number;
  price: number;
}

interface InvoiceData {
  invoiceNumber: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  items: InvoiceItem[];
  total: number;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  logoUrl: string | null;
  footerText: string | null;
}

interface InvoiceGeneratorProps {
  data: InvoiceData;
}

export const InvoiceGenerator = ({ data }: InvoiceGeneratorProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const downloadAsImage = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = `facture-${data.invoiceNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={downloadAsImage}>
          <Download className="h-4 w-4 mr-2" />
          Télécharger la facture
        </Button>
      </div>

      <div
        ref={invoiceRef}
        className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto text-black"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b pb-6">
          <div>
            {data.logoUrl ? (
              <img src={data.logoUrl} alt="Logo" className="h-16 object-contain mb-2" />
            ) : (
              <h1 className="text-2xl font-bold text-orange-500">{data.companyName}</h1>
            )}
            <p className="text-sm text-gray-600">{data.companyAddress}</p>
            <p className="text-sm text-gray-600">Tél: {data.companyPhone}</p>
            <p className="text-sm text-gray-600">{data.companyEmail}</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-800">FACTURE</h2>
            <p className="text-lg font-semibold text-orange-500">N° {data.invoiceNumber}</p>
            <p className="text-sm text-gray-600">
              Date: {format(new Date(data.orderDate), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>

        {/* Customer info */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-800 mb-2">Facturé à :</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-medium">{data.customerName}</p>
            <p className="text-sm text-gray-600">{data.customerAddress}</p>
            <p className="text-sm text-gray-600">{data.customerCity}</p>
            <p className="text-sm text-gray-600">Tél: {data.customerPhone}</p>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="text-left p-3">Article</th>
              <th className="text-center p-3">Qté</th>
              <th className="text-right p-3">Prix unit.</th>
              <th className="text-right p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="p-3">
                  <p className="font-medium">{item.name}</p>
                  {item.reference && (
                    <p className="text-xs text-gray-500">Réf: {item.reference}</p>
                  )}
                </td>
                <td className="text-center p-3">{item.quantity}</td>
                <td className="text-right p-3">{formatPrice(item.price)}</td>
                <td className="text-right p-3 font-medium">
                  {formatPrice(item.quantity * item.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 border-t">
              <span className="font-semibold">Sous-total:</span>
              <span>{formatPrice(data.total)}</span>
            </div>
            <div className="flex justify-between py-3 bg-orange-500 text-white px-4 rounded">
              <span className="font-bold">TOTAL TTC:</span>
              <span className="font-bold text-lg">{formatPrice(data.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment info */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <p className="font-semibold text-gray-800 mb-1">Mode de paiement</p>
          <p className="text-sm text-gray-600">Paiement à la livraison</p>
        </div>

        {/* Footer */}
        {data.footerText && (
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            {data.footerText}
          </div>
        )}

        <div className="text-center text-xs text-gray-400 mt-4">
          Merci pour votre confiance !
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
