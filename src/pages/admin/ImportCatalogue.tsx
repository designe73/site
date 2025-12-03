import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportStats {
  rowsParsed: number;
  categoriesProcessed: number;
  vehiclesProcessed: number;
  productsCreated: number;
  linksCreated: number;
}

const ImportCatalogue = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<ImportStats | null>(null);
  const { toast } = useToast();

  const handleImportFromFile = async () => {
    setLoading(true);
    setError('');
    setStats(null);
    setProgress(10);

    try {
      // Fetch the CSV file from public folder
      const response = await fetch('/data/catalogue_pieces_complet.csv');
      if (!response.ok) {
        throw new Error('Impossible de charger le fichier CSV');
      }
      
      const csvData = await response.text();
      setProgress(30);

      // Call the edge function
      const { data, error: fnError } = await supabase.functions.invoke('import-catalogue', {
        body: { csvData },
      });

      setProgress(100);

      if (fnError) {
        throw fnError;
      }

      if (data?.success) {
        setStats(data.stats);
        toast({
          title: 'Import réussi',
          description: `${data.stats.productsCreated} produits créés, ${data.stats.vehiclesProcessed} véhicules traités`,
        });
      } else {
        throw new Error(data?.error || 'Erreur lors de l\'import');
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Une erreur est survenue');
      toast({
        variant: 'destructive',
        title: 'Erreur d\'import',
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setStats(null);
    setProgress(10);

    try {
      const csvData = await file.text();
      setProgress(30);

      const { data, error: fnError } = await supabase.functions.invoke('import-catalogue', {
        body: { csvData },
      });

      setProgress(100);

      if (fnError) {
        throw fnError;
      }

      if (data?.success) {
        setStats(data.stats);
        toast({
          title: 'Import réussi',
          description: `${data.stats.productsCreated} produits créés, ${data.stats.vehiclesProcessed} véhicules traités`,
        });
      } else {
        throw new Error(data?.error || 'Erreur lors de l\'import');
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-roboto-condensed font-bold text-foreground">Import Catalogue</h1>
        <p className="text-muted-foreground mt-1">Importez vos véhicules et pièces depuis un fichier CSV</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Import from existing file */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Catalogue pré-chargé
            </CardTitle>
            <CardDescription>
              Importer le catalogue complet déjà présent sur le serveur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Le fichier <code className="bg-muted px-1 rounded">catalogue_pieces_complet.csv</code> contient :
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Marques : Hyundai, Kia, Nissan, Toyota...</li>
              <li>Modèles avec motorisations</li>
              <li>Pièces avec références internes</li>
              <li>Catégories : Filtration, Freinage, Moteur...</li>
            </ul>
            <Button
              onClick={handleImportFromFile}
              disabled={loading}
              className="w-full bg-gradient-orange hover:opacity-90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Import en cours...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importer le catalogue
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Upload custom file */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Import personnalisé
            </CardTitle>
            <CardDescription>
              Téléchargez votre propre fichier CSV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Format requis (séparateur point-virgule) :
            </p>
            <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
              Marque;Modele;Annee_Debut;Annee_Fin;Cylindree;Moteur;Puissance;Categorie_Piece;Nom_Piece;Reference_Interne
            </code>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 border-border">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Cliquez pour sélectionner</span>
                  </p>
                  <p className="text-xs text-muted-foreground">CSV uniquement</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                Traitement en cours, veuillez patienter...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Stats */}
      {stats && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Import terminé avec succès
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.rowsParsed}</div>
                <div className="text-sm text-muted-foreground">Lignes traitées</div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.categoriesProcessed}</div>
                <div className="text-sm text-muted-foreground">Catégories</div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.vehiclesProcessed}</div>
                <div className="text-sm text-muted-foreground">Véhicules</div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.productsCreated}</div>
                <div className="text-sm text-muted-foreground">Produits créés</div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.linksCreated}</div>
                <div className="text-sm text-muted-foreground">Liens créés</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImportCatalogue;
