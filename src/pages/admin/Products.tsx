import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Pencil, Trash2, Search, X, Car, CheckSquare, Square, Filter, RotateCcw, ImageIcon, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/formatPrice';
import { compressImage, formatFileSize } from '@/lib/imageCompression';
import { toast } from 'sonner';
import ProductSpecsForm, {
  SpecType,
  TireSpecForm,
  BatterySpecForm,
  MechanicalSpecForm,
  OilSpecForm,
  AccessorySpecForm,
} from '@/components/admin/ProductSpecsForm';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  brand: string | null;
  reference: string | null;
  stock: number;
  is_featured: boolean | null;
  is_promo: boolean | null;
  category_id: string | null;
  description: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  engine: string | null;
}

interface CategorySpecType {
  category_id: string;
  spec_type: string;
}

const emptyTireForm: TireSpecForm = {
  width: '', height: '', diameter: '', season: '', load_index: '', speed_index: '', runflat: false
};

const emptyBatteryForm: BatterySpecForm = {
  amperage: '', start_power: '', terminal_position: '', technology: '', length_mm: '', width_mm: '', height_mm: ''
};

const emptyMechanicalForm: MechanicalSpecForm = {
  assembly_side: '', system_type: '', material: '', condition: ''
};

const emptyOilForm: OilSpecForm = {
  viscosity: '', oil_type: '', manufacturer_norm: '', capacity: ''
};

const emptyAccessoryForm: AccessorySpecForm = {
  compatibility: '', material: '', color: ''
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categorySpecTypes, setCategorySpecTypes] = useState<CategorySpecType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  
  // Bulk edit state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    price: '',
    stock: '',
    category_id: '',
    is_featured: false,
    is_promo: false,
  });
  const [bulkUpdateFields, setBulkUpdateFields] = useState({
    price: false,
    stock: false,
    category_id: false,
    is_featured: false,
    is_promo: false,
  });

  // Advanced filters state
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [filterStockStatus, setFilterStockStatus] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'yes' | 'no'>('all');
  const [filterPromo, setFilterPromo] = useState<'all' | 'yes' | 'no'>('all');
  const [filterHasImage, setFilterHasImage] = useState<'all' | 'with_image' | 'without_image'>('all');
  
  // Inline image edit state
  const [editingImageProductId, setEditingImageProductId] = useState<string | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState('');
  
  // Spec forms state
  const [specType, setSpecType] = useState<SpecType>(null);
  const [tireForm, setTireForm] = useState<TireSpecForm>(emptyTireForm);
  const [batteryForm, setBatteryForm] = useState<BatterySpecForm>(emptyBatteryForm);
  const [mechanicalForm, setMechanicalForm] = useState<MechanicalSpecForm>(emptyMechanicalForm);
  const [oilForm, setOilForm] = useState<OilSpecForm>(emptyOilForm);
  const [accessoryForm, setAccessoryForm] = useState<AccessorySpecForm>(emptyAccessoryForm);
  
  // Image search state
  const [searchingImageFor, setSearchingImageFor] = useState<string | null>(null);
  const [bulkImageSearching, setBulkImageSearching] = useState(false);
  const [bulkImageProgress, setBulkImageProgress] = useState({ current: 0, total: 0 });
  
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    original_price: '',
    image_url: '',
    brand: '',
    reference: '',
    stock: '0',
    category_id: '',
    is_featured: false,
    is_promo: false,
  });

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name');
    setCategories(data || []);
  };

  const fetchVehicles = async () => {
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .order('brand', { ascending: true });
    setVehicles(data || []);
  };

  const fetchCategorySpecTypes = async () => {
    const { data } = await supabase.from('category_spec_types').select('*');
    setCategorySpecTypes(data || []);
  };

  const fetchProductVehicles = async (productId: string) => {
    const { data } = await supabase
      .from('product_vehicles')
      .select('vehicle_id')
      .eq('product_id', productId);
    return data?.map(pv => pv.vehicle_id) || [];
  };

  const fetchProductSpecs = async (productId: string, type: SpecType) => {
    if (!type) return;

    if (type === 'tire') {
      const { data } = await supabase.from('tire_specs').select('*').eq('product_id', productId).maybeSingle();
      if (data) {
        setTireForm({
          width: data.width?.toString() || '',
          height: data.height?.toString() || '',
          diameter: data.diameter?.toString() || '',
          season: data.season || '',
          load_index: data.load_index || '',
          speed_index: data.speed_index || '',
          runflat: data.runflat || false,
        });
      }
    } else if (type === 'battery') {
      const { data } = await supabase.from('battery_specs').select('*').eq('product_id', productId).maybeSingle();
      if (data) {
        setBatteryForm({
          amperage: data.amperage?.toString() || '',
          start_power: data.start_power?.toString() || '',
          terminal_position: data.terminal_position || '',
          technology: data.technology || '',
          length_mm: data.length_mm?.toString() || '',
          width_mm: data.width_mm?.toString() || '',
          height_mm: data.height_mm?.toString() || '',
        });
      }
    } else if (type === 'mechanical') {
      const { data } = await supabase.from('mechanical_specs').select('*').eq('product_id', productId).maybeSingle();
      if (data) {
        setMechanicalForm({
          assembly_side: data.assembly_side || '',
          system_type: data.system_type || '',
          material: data.material || '',
          condition: data.condition || '',
        });
      }
    } else if (type === 'oil') {
      const { data } = await supabase.from('oil_specs').select('*').eq('product_id', productId).maybeSingle();
      if (data) {
        setOilForm({
          viscosity: data.viscosity || '',
          oil_type: data.oil_type || '',
          manufacturer_norm: data.manufacturer_norm || '',
          capacity: data.capacity || '',
        });
      }
    } else if (type === 'accessory') {
      const { data } = await supabase.from('accessory_specs').select('*').eq('product_id', productId).maybeSingle();
      if (data) {
        setAccessoryForm({
          compatibility: data.compatibility || '',
          material: data.material || '',
          color: data.color || '',
        });
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchVehicles();
    fetchCategorySpecTypes();
  }, []);

  // Update spec type when category changes
  useEffect(() => {
    const catSpecType = categorySpecTypes.find(cst => cst.category_id === form.category_id);
    setSpecType(catSpecType?.spec_type as SpecType || null);
  }, [form.category_id, categorySpecTypes]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const saveSpecs = async (productId: string, type: SpecType) => {
    if (!type) return;

    if (type === 'tire') {
      await supabase.from('tire_specs').delete().eq('product_id', productId);
      await supabase.from('tire_specs').insert({
        product_id: productId,
        width: tireForm.width ? parseInt(tireForm.width) : null,
        height: tireForm.height ? parseInt(tireForm.height) : null,
        diameter: tireForm.diameter ? parseInt(tireForm.diameter) : null,
        season: tireForm.season || null,
        load_index: tireForm.load_index || null,
        speed_index: tireForm.speed_index || null,
        runflat: tireForm.runflat,
      });
    } else if (type === 'battery') {
      await supabase.from('battery_specs').delete().eq('product_id', productId);
      await supabase.from('battery_specs').insert({
        product_id: productId,
        amperage: batteryForm.amperage ? parseInt(batteryForm.amperage) : null,
        start_power: batteryForm.start_power ? parseInt(batteryForm.start_power) : null,
        terminal_position: batteryForm.terminal_position || null,
        technology: batteryForm.technology || null,
        length_mm: batteryForm.length_mm ? parseInt(batteryForm.length_mm) : null,
        width_mm: batteryForm.width_mm ? parseInt(batteryForm.width_mm) : null,
        height_mm: batteryForm.height_mm ? parseInt(batteryForm.height_mm) : null,
      });
    } else if (type === 'mechanical') {
      await supabase.from('mechanical_specs').delete().eq('product_id', productId);
      await supabase.from('mechanical_specs').insert({
        product_id: productId,
        assembly_side: mechanicalForm.assembly_side || null,
        system_type: mechanicalForm.system_type || null,
        material: mechanicalForm.material || null,
        condition: mechanicalForm.condition || null,
      });
    } else if (type === 'oil') {
      await supabase.from('oil_specs').delete().eq('product_id', productId);
      await supabase.from('oil_specs').insert({
        product_id: productId,
        viscosity: oilForm.viscosity || null,
        oil_type: oilForm.oil_type || null,
        manufacturer_norm: oilForm.manufacturer_norm || null,
        capacity: oilForm.capacity || null,
      });
    } else if (type === 'accessory') {
      await supabase.from('accessory_specs').delete().eq('product_id', productId);
      await supabase.from('accessory_specs').insert({
        product_id: productId,
        compatibility: accessoryForm.compatibility || null,
        material: accessoryForm.material || null,
        color: accessoryForm.color || null,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: form.name,
      slug: form.slug || generateSlug(form.name),
      description: form.description || null,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      image_url: form.image_url || null,
      brand: form.brand || null,
      reference: form.reference || null,
      stock: parseInt(form.stock),
      category_id: form.category_id || null,
      is_featured: form.is_featured,
      is_promo: form.is_promo,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      
      if (error) {
        toast.error('Erreur lors de la modification');
        return;
      }

      // Update product vehicles
      await supabase.from('product_vehicles').delete().eq('product_id', editingProduct.id);
      if (selectedVehicleIds.length > 0) {
        const vehicleLinks = selectedVehicleIds.map(vehicleId => ({
          product_id: editingProduct.id,
          vehicle_id: vehicleId,
        }));
        await supabase.from('product_vehicles').insert(vehicleLinks);
      }

      // Save specs
      await saveSpecs(editingProduct.id, specType);

      toast.success('Produit modifié');
      setDialogOpen(false);
      fetchProducts();
    } else {
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();
      
      if (error || !newProduct) {
        toast.error('Erreur lors de la création');
        return;
      }

      // Add product vehicles
      if (selectedVehicleIds.length > 0) {
        const vehicleLinks = selectedVehicleIds.map(vehicleId => ({
          product_id: newProduct.id,
          vehicle_id: vehicleId,
        }));
        await supabase.from('product_vehicles').insert(vehicleLinks);
      }

      // Save specs
      await saveSpecs(newProduct.id, specType);

      toast.success('Produit créé');
      setDialogOpen(false);
      fetchProducts();
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      image_url: product.image_url || '',
      brand: product.brand || '',
      reference: product.reference || '',
      stock: product.stock.toString(),
      category_id: product.category_id || '',
      is_featured: product.is_featured || false,
      is_promo: product.is_promo || false,
    });
    
    const vehicleIds = await fetchProductVehicles(product.id);
    setSelectedVehicleIds(vehicleIds);

    // Fetch spec type and specs
    const catSpecType = categorySpecTypes.find(cst => cst.category_id === product.category_id);
    const type = catSpecType?.spec_type as SpecType || null;
    setSpecType(type);
    if (type) {
      await fetchProductSpecs(product.id, type);
    }

    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce produit ?')) {
      // Delete related data
      await supabase.from('product_vehicles').delete().eq('product_id', id);
      await supabase.from('tire_specs').delete().eq('product_id', id);
      await supabase.from('battery_specs').delete().eq('product_id', id);
      await supabase.from('mechanical_specs').delete().eq('product_id', id);
      await supabase.from('oil_specs').delete().eq('product_id', id);
      await supabase.from('accessory_specs').delete().eq('product_id', id);
      
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        toast.error('Erreur lors de la suppression');
      } else {
        toast.success('Produit supprimé');
        fetchProducts();
      }
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setSelectedVehicleIds([]);
    setVehicleSearch('');
    setSpecType(null);
    setTireForm(emptyTireForm);
    setBatteryForm(emptyBatteryForm);
    setMechanicalForm(emptyMechanicalForm);
    setOilForm(emptyOilForm);
    setAccessoryForm(emptyAccessoryForm);
    setForm({
      name: '',
      slug: '',
      description: '',
      price: '',
      original_price: '',
      image_url: '',
      brand: '',
      reference: '',
      stock: '0',
      category_id: '',
      is_featured: false,
      is_promo: false,
    });
  };

  const handleSearchImage = async (product: Product) => {
    if (!product.reference) {
      toast.error('Ce produit n\'a pas de référence');
      return;
    }
    
    setSearchingImageFor(product.id);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-oscaro-image', {
        body: { reference: product.reference, productId: product.id }
      });
      
      if (error) throw error;
      
      if (data?.images?.length > 0) {
        toast.success(`${data.images.length} image(s) trouvée(s) et mise(s) à jour`);
        fetchProducts();
      } else {
        toast.info('Aucune image trouvée pour cette référence');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la recherche d\'images');
    } finally {
      setSearchingImageFor(null);
    }
  };

  const handleBulkImageSearch = async () => {
    const productsWithoutImages = products.filter(p => !p.image_url && p.reference);
    
    if (productsWithoutImages.length === 0) {
      toast.info('Tous les produits avec référence ont déjà une image');
      return;
    }

    setBulkImageSearching(true);
    const totalProducts = productsWithoutImages.length;
    setBulkImageProgress({ current: 0, total: totalProducts });
    
    let successCount = 0;
    let failCount = 0;

    // Process in batches of 10 using the batch endpoint
    const batchSize = 10;
    for (let i = 0; i < totalProducts; i += batchSize) {
      const batch = productsWithoutImages.slice(i, i + batchSize).map(p => ({
        id: p.id,
        reference: p.reference!
      }));
      
      setBulkImageProgress({ current: Math.min(i + batchSize, totalProducts), total: totalProducts });
      
      try {
        const { data, error } = await supabase.functions.invoke('scrape-oscaro-batch', {
          body: { products: batch }
        });
        
        if (!error && data?.summary) {
          successCount += data.summary.successCount;
          failCount += data.summary.failCount;
        } else {
          failCount += batch.length;
        }
      } catch {
        failCount += batch.length;
      }
    }

    setBulkImageSearching(false);
    setBulkImageProgress({ current: 0, total: 0 });
    fetchProducts();
    
    toast.success(`Recherche terminée: ${successCount} images trouvées, ${failCount} échecs`);
  };

  // Bulk image URL update for selected products
  const handleBulkImageUrlUpdate = async (imageUrl: string) => {
    if (selectedProductIds.length === 0) return;
    
    const { error } = await supabase
      .from('products')
      .update({ image_url: imageUrl || null })
      .in('id', selectedProductIds);

    if (error) {
      toast.error('Erreur lors de la modification');
    } else {
      toast.success(`${selectedProductIds.length} produits modifiés`);
      setSelectedProductIds([]);
      fetchProducts();
    }
  };

  // Bulk Oscaro search for selected products
  const handleSelectedProductsImageSearch = async () => {
    const selectedWithRef = products.filter(p => 
      selectedProductIds.includes(p.id) && p.reference
    );
    
    if (selectedWithRef.length === 0) {
      toast.error('Aucun produit sélectionné avec référence');
      return;
    }

    setBulkImageSearching(true);
    setBulkImageProgress({ current: 0, total: selectedWithRef.length });
    
    const batch = selectedWithRef.map(p => ({ id: p.id, reference: p.reference! }));
    
    try {
      const { data, error } = await supabase.functions.invoke('scrape-oscaro-batch', {
        body: { products: batch }
      });
      
      setBulkImageProgress({ current: selectedWithRef.length, total: selectedWithRef.length });
      
      if (!error && data?.summary) {
        toast.success(`${data.summary.successCount} images trouvées, ${data.summary.failCount} échecs`);
      } else {
        toast.error('Erreur lors de la recherche');
      }
    } catch {
      toast.error('Erreur lors de la recherche');
    }

    setBulkImageSearching(false);
    setBulkImageProgress({ current: 0, total: 0 });
    setSelectedProductIds([]);
    fetchProducts();
  };

  const toggleVehicle = (vehicleId: string) => {
    setSelectedVehicleIds(prev => 
      prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllProducts = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const handleBulkEdit = async () => {
    if (selectedProductIds.length === 0) {
      toast.error('Sélectionnez des produits');
      return;
    }

    const updates: Record<string, unknown> = {};
    
    if (bulkUpdateFields.price && bulkForm.price) {
      updates.price = parseFloat(bulkForm.price);
    }
    if (bulkUpdateFields.stock && bulkForm.stock) {
      updates.stock = parseInt(bulkForm.stock);
    }
    if (bulkUpdateFields.category_id && bulkForm.category_id) {
      updates.category_id = bulkForm.category_id;
    }
    if (bulkUpdateFields.is_featured) {
      updates.is_featured = bulkForm.is_featured;
    }
    if (bulkUpdateFields.is_promo) {
      updates.is_promo = bulkForm.is_promo;
    }

    if (Object.keys(updates).length === 0) {
      toast.error('Sélectionnez au moins un champ à modifier');
      return;
    }

    const { error } = await supabase
      .from('products')
      .update(updates)
      .in('id', selectedProductIds);

    if (error) {
      toast.error('Erreur lors de la modification en masse');
      return;
    }

    toast.success(`${selectedProductIds.length} produits modifiés`);
    setBulkDialogOpen(false);
    setSelectedProductIds([]);
    setBulkForm({ price: '', stock: '', category_id: '', is_featured: false, is_promo: false });
    setBulkUpdateFields({ price: false, stock: false, category_id: false, is_featured: false, is_promo: false });
    fetchProducts();
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    
    if (!confirm(`Supprimer ${selectedProductIds.length} produits ?`)) return;

    for (const id of selectedProductIds) {
      await supabase.from('product_vehicles').delete().eq('product_id', id);
      await supabase.from('tire_specs').delete().eq('product_id', id);
      await supabase.from('battery_specs').delete().eq('product_id', id);
      await supabase.from('mechanical_specs').delete().eq('product_id', id);
      await supabase.from('oil_specs').delete().eq('product_id', id);
      await supabase.from('accessory_specs').delete().eq('product_id', id);
    }

    const { error } = await supabase.from('products').delete().in('id', selectedProductIds);
    
    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success(`${selectedProductIds.length} produits supprimés`);
      setSelectedProductIds([]);
      fetchProducts();
    }
  };

  const getVehicleLabel = (vehicle: Vehicle) => {
    return `${vehicle.brand} ${vehicle.model} ${vehicle.year}${vehicle.engine ? ` - ${vehicle.engine}` : ''}`;
  };

  const resetFilters = () => {
    setFilterCategory('');
    setFilterPriceMin('');
    setFilterPriceMax('');
    setFilterStockStatus('all');
    setFilterFeatured('all');
    setFilterPromo('all');
    setFilterHasImage('all');
  };

  const hasActiveFilters = filterCategory || filterPriceMin || filterPriceMax || 
    filterStockStatus !== 'all' || filterFeatured !== 'all' || filterPromo !== 'all' || filterHasImage !== 'all';

  const filteredProducts = products.filter(p => {
    // Search filter
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.reference?.toLowerCase().includes(search.toLowerCase());
    
    // Category filter
    const matchesCategory = !filterCategory || p.category_id === filterCategory;
    
    // Price filters
    const matchesPriceMin = !filterPriceMin || p.price >= parseFloat(filterPriceMin);
    const matchesPriceMax = !filterPriceMax || p.price <= parseFloat(filterPriceMax);
    
    // Stock filter
    let matchesStock = true;
    if (filterStockStatus === 'out_of_stock') matchesStock = p.stock === 0;
    else if (filterStockStatus === 'low_stock') matchesStock = p.stock > 0 && p.stock <= 5;
    else if (filterStockStatus === 'in_stock') matchesStock = p.stock > 5;
    
    // Featured filter
    let matchesFeatured = true;
    if (filterFeatured === 'yes') matchesFeatured = p.is_featured === true;
    else if (filterFeatured === 'no') matchesFeatured = p.is_featured !== true;
    
    // Promo filter
    let matchesPromo = true;
    if (filterPromo === 'yes') matchesPromo = p.is_promo === true;
    else if (filterPromo === 'no') matchesPromo = p.is_promo !== true;
    
    // Image filter
    let matchesImage = true;
    if (filterHasImage === 'with_image') matchesImage = !!p.image_url;
    else if (filterHasImage === 'without_image') matchesImage = !p.image_url;
    
    return matchesSearch && matchesCategory && matchesPriceMin && matchesPriceMax && 
      matchesStock && matchesFeatured && matchesPromo && matchesImage;
  });

  const filteredVehicles = vehicles.filter(v => 
    getVehicleLabel(v).toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const selectedVehicles = vehicles.filter(v => selectedVehicleIds.includes(v.id));

  return (
    <>
      <Helmet>
        <title>Produits | Admin AutoPièces</title>
      </Helmet>

      <div className="p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <h1 className="font-roboto-condensed text-2xl lg:text-3xl font-bold">Produits</h1>
          <div className="flex flex-wrap gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={handleBulkImageSearch}
                  disabled={bulkImageSearching}
                >
                  {bulkImageSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {bulkImageProgress.current}/{bulkImageProgress.total}
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Rechercher images
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Rechercher les images Oscaro pour tous les produits sans image
              </TooltipContent>
            </Tooltip>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter un produit
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prix (CFA) *</Label>
                    <Input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prix barré (CFA)</Label>
                    <Input
                      type="number"
                      value={form.original_price}
                      onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Marque</Label>
                    <Input
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Référence</Label>
                    <Input
                      value={form.reference}
                      onChange={(e) => setForm({ ...form, reference: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>URL de l'image</Label>
                  <Input
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Attributs spécifiques */}
                <ProductSpecsForm
                  specType={specType}
                  tireForm={tireForm}
                  batteryForm={batteryForm}
                  mechanicalForm={mechanicalForm}
                  oilForm={oilForm}
                  accessoryForm={accessoryForm}
                  onTireChange={setTireForm}
                  onBatteryChange={setBatteryForm}
                  onMechanicalChange={setMechanicalForm}
                  onOilChange={setOilForm}
                  onAccessoryChange={setAccessoryForm}
                />

                {/* Véhicules compatibles */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Véhicules compatibles
                  </Label>
                  
                  {selectedVehicles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedVehicles.map(vehicle => (
                        <Badge 
                          key={vehicle.id} 
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {getVehicleLabel(vehicle)}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => toggleVehicle(vehicle.id)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Input
                    placeholder="Rechercher un véhicule..."
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                  />
                  
                  <ScrollArea className="h-40 border rounded-md p-2">
                    {filteredVehicles.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucun véhicule trouvé
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {filteredVehicles.map(vehicle => (
                          <div 
                            key={vehicle.id}
                            className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                            onClick={() => toggleVehicle(vehicle.id)}
                          >
                            <Checkbox 
                              checked={selectedVehicleIds.includes(vehicle.id)}
                              onCheckedChange={() => toggleVehicle(vehicle.id)}
                            />
                            <span className="text-sm">{getVehicleLabel(vehicle)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.is_featured}
                      onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
                    />
                    <Label>Produit vedette</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.is_promo}
                      onCheckedChange={(v) => setForm({ ...form, is_promo: v })}
                    />
                    <Label>En promotion</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="btn-primary">
                    {editingProduct ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedProductIds.length > 0 && (
          <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {selectedProductIds.length} produit(s) sélectionné(s)
              </span>
              <div className="flex gap-2">
                <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4 mr-2" />
                      Modifier en masse
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modification en masse</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={bulkUpdateFields.price}
                          onCheckedChange={(v) => setBulkUpdateFields({ ...bulkUpdateFields, price: !!v })}
                        />
                        <div className="flex-1 space-y-2">
                          <Label>Prix (CFA)</Label>
                          <Input
                            type="number"
                            value={bulkForm.price}
                            onChange={(e) => setBulkForm({ ...bulkForm, price: e.target.value })}
                            disabled={!bulkUpdateFields.price}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={bulkUpdateFields.stock}
                          onCheckedChange={(v) => setBulkUpdateFields({ ...bulkUpdateFields, stock: !!v })}
                        />
                        <div className="flex-1 space-y-2">
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            value={bulkForm.stock}
                            onChange={(e) => setBulkForm({ ...bulkForm, stock: e.target.value })}
                            disabled={!bulkUpdateFields.stock}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={bulkUpdateFields.category_id}
                          onCheckedChange={(v) => setBulkUpdateFields({ ...bulkUpdateFields, category_id: !!v })}
                        />
                        <div className="flex-1 space-y-2">
                          <Label>Catégorie</Label>
                          <Select 
                            value={bulkForm.category_id} 
                            onValueChange={(v) => setBulkForm({ ...bulkForm, category_id: v })}
                            disabled={!bulkUpdateFields.category_id}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={bulkUpdateFields.is_featured}
                          onCheckedChange={(v) => setBulkUpdateFields({ ...bulkUpdateFields, is_featured: !!v })}
                        />
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={bulkForm.is_featured}
                            onCheckedChange={(v) => setBulkForm({ ...bulkForm, is_featured: v })}
                            disabled={!bulkUpdateFields.is_featured}
                          />
                          <Label>Produit vedette</Label>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={bulkUpdateFields.is_promo}
                          onCheckedChange={(v) => setBulkUpdateFields({ ...bulkUpdateFields, is_promo: !!v })}
                        />
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={bulkForm.is_promo}
                            onCheckedChange={(v) => setBulkForm({ ...bulkForm, is_promo: v })}
                            disabled={!bulkUpdateFields.is_promo}
                          />
                          <Label>En promotion</Label>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleBulkEdit} className="btn-primary">
                          Appliquer
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectedProductsImageSearch}
                  disabled={bulkImageSearching}
                >
                  {bulkImageSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {bulkImageProgress.current}/{bulkImageProgress.total}
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Chercher images
                    </>
                  )}
                </Button>
                
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
                
                <Button variant="ghost" size="sm" onClick={() => setSelectedProductIds([])}>
                  <X className="h-4 w-4 mr-2" />
                  Désélectionner
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4 mb-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "btn-primary" : ""}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    !
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={resetFilters}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Catégorie</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Prix min (CFA)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filterPriceMin}
                    onChange={(e) => setFilterPriceMin(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Prix max (CFA)</Label>
                  <Input
                    type="number"
                    placeholder="∞"
                    value={filterPriceMax}
                    onChange={(e) => setFilterPriceMax(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Stock</Label>
                  <Select value={filterStockStatus} onValueChange={(v) => setFilterStockStatus(v as typeof filterStockStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="in_stock">En stock (&gt;5)</SelectItem>
                      <SelectItem value="low_stock">Stock faible (1-5)</SelectItem>
                      <SelectItem value="out_of_stock">Rupture (0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Vedette</Label>
                  <Select value={filterFeatured} onValueChange={(v) => setFilterFeatured(v as typeof filterFeatured)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="yes">Oui</SelectItem>
                      <SelectItem value="no">Non</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Promo</Label>
                  <Select value={filterPromo} onValueChange={(v) => setFilterPromo(v as typeof filterPromo)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="yes">Oui</SelectItem>
                      <SelectItem value="no">Non</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Image</Label>
                  <Select value={filterHasImage} onValueChange={(v) => setFilterHasImage(v as typeof filterHasImage)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="with_image">Avec image</SelectItem>
                      <SelectItem value="without_image">Sans image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {hasActiveFilters && (
              <div className="text-sm text-muted-foreground">
                {filteredProducts.length} produit(s) trouvé(s)
              </div>
            )}
          </div>
        </Card>

        <Card className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleAllProducts}
                  >
                    {selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucun produit trouvé
                  </TableCell>
                </TableRow>
              ) : (
              filteredProducts.map((product) => {
                  const category = categories.find(c => c.id === product.category_id);
                  return (
                    <TableRow key={product.id} className={selectedProductIds.includes(product.id) ? 'bg-primary/5' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProductIds.includes(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className="w-12 h-12 bg-muted rounded overflow-hidden cursor-pointer relative group"
                              onClick={() => {
                                setEditingImageProductId(product.id);
                                setEditingImageUrl(product.image_url || '');
                              }}
                            >
                              {product.image_url ? (
                                <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <ImageIcon className="h-5 w-5" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Cliquer pour modifier l'image</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.reference || '-'}</TableCell>
                      <TableCell>{category?.name || '-'}</TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>
                        <span className={product.stock > 0 ? 'text-success' : 'text-destructive'}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleSearchImage(product)}
                                disabled={searchingImageFor === product.id || !product.reference}
                              >
                                {searchingImageFor === product.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ImageIcon className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Chercher image Oscaro</TooltipContent>
                          </Tooltip>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Image Edit Dialog */}
        <Dialog open={!!editingImageProductId} onOpenChange={(open) => !open && setEditingImageProductId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier l'image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {editingImageUrl && (
                <div className="w-full h-48 bg-muted rounded overflow-hidden">
                  <img src={editingImageUrl} alt="" className="w-full h-full object-contain" />
                </div>
              )}
              
              {/* Local file upload */}
              <div className="space-y-2">
                <Label>Télécharger une image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !editingImageProductId) return;
                    
                    toast.loading('Compression et upload en cours...');
                    
                    try {
                      // Compress image before upload
                      const originalSize = file.size;
                      const compressedFile = await compressImage(file, {
                        maxWidth: 800,
                        maxHeight: 800,
                        quality: 0.85,
                        format: 'image/webp',
                      });
                      const compressedSize = compressedFile.size;
                      
                      const fileName = `${editingImageProductId}-${Date.now()}.webp`;
                      
                      const { data, error } = await supabase.storage
                        .from('product-images')
                        .upload(fileName, compressedFile, { 
                          upsert: true,
                          contentType: 'image/webp'
                        });
                      
                      if (error) {
                        toast.dismiss();
                        toast.error('Erreur lors de l\'upload');
                        console.error(error);
                        return;
                      }
                      
                      const { data: urlData } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(data.path);
                      
                      setEditingImageUrl(urlData.publicUrl);
                      toast.dismiss();
                      
                      const savedPercent = Math.round((1 - compressedSize / originalSize) * 100);
                      toast.success(`Image uploadée (${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)}, -${savedPercent}%)`);
                    } catch (err) {
                      toast.dismiss();
                      toast.error('Erreur lors de la compression');
                      console.error(err);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Les images sont automatiquement compressées en WebP
                </p>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>URL de l'image</Label>
                <Input
                  value={editingImageUrl}
                  onChange={(e) => setEditingImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              {editingImageProductId && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const product = products.find(p => p.id === editingImageProductId);
                      if (product) handleSearchImage(product);
                    }}
                    disabled={searchingImageFor === editingImageProductId || !products.find(p => p.id === editingImageProductId)?.reference}
                  >
                    {searchingImageFor === editingImageProductId ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Chercher Oscaro
                  </Button>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingImageProductId(null)}>
                  Annuler
                </Button>
                <Button 
                  className="btn-primary"
                  onClick={async () => {
                    if (!editingImageProductId) return;
                    const { error } = await supabase
                      .from('products')
                      .update({ image_url: editingImageUrl || null })
                      .eq('id', editingImageProductId);
                    if (error) {
                      toast.error('Erreur lors de la modification');
                    } else {
                      toast.success('Image modifiée');
                      setEditingImageProductId(null);
                      fetchProducts();
                    }
                  }}
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Products;
