import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, RefreshCw, X, Palette } from "lucide-react";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabase";
import type { Database, ColorVariant } from "../../lib/supabase";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  has_color_variants: boolean;
  is_sold_out: boolean;
  stock_quantity: number | null;
}

interface ColorWithImages extends ColorVariant {
  selectedFiles: File[];
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // For products without color variants
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // For products with color variants
  const [colorVariants, setColorVariants] = useState<ColorWithImages[]>([]);
  const [hasColorVariants, setHasColorVariants] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductFormData>();

  useEffect(() => {
    fetchProducts();
  }, []);

  // Image upload functionality
  const uploadImages = async (files: File[]): Promise<string[]> => {
    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()
          .toString(36)
          .substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      alert("Please select only image files (JPEG, PNG, WebP)");
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert("Please select images smaller than 5MB");
      return;
    }

    setSelectedFiles(files);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Color variant management functions
  const addColorVariant = () => {
    setColorVariants((prev) => [
      ...prev,
      {
        name: "",
        hex: "#000000",
        images: [],
        selectedFiles: [],
        is_sold_out: false,
        stock_quantity: null,
      },
    ]);
  };

  const removeColorVariant = (index: number) => {
    setColorVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateColorVariant = (
    index: number,
    field: keyof ColorWithImages,
    value: any
  ) => {
    setColorVariants((prev) =>
      prev.map((color, i) =>
        i === index ? { ...color, [field]: value } : color
      )
    );
  };

  const handleColorFileSelect = (
    colorIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      alert("Please select only image files (JPEG, PNG, WebP)");
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert("Please select images smaller than 5MB");
      return;
    }

    updateColorVariant(colorIndex, "selectedFiles", files);
  };

  const removeColorSelectedFile = (colorIndex: number, fileIndex: number) => {
    const currentFiles = colorVariants[colorIndex].selectedFiles;
    updateColorVariant(
      colorIndex,
      "selectedFiles",
      currentFiles.filter((_, i) => i !== fileIndex)
    );
  };

  const removeColorUploadedImage = (colorIndex: number, imageIndex: number) => {
    const currentImages = colorVariants[colorIndex].images;
    updateColorVariant(
      colorIndex,
      "images",
      currentImages.filter((_, i) => i !== imageIndex)
    );
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      let allImageUrls: string[] = [];
      let colors: ColorVariant[] = [];

      if (data.has_color_variants) {
        // Handle color variants
        if (colorVariants.length === 0) {
          alert("Veuillez ajouter au moins une variante de couleur");
          setSubmitting(false);
          return;
        }

        // Validate color variants
        for (let i = 0; i < colorVariants.length; i++) {
          const variant = colorVariants[i];
          if (!variant.name.trim()) {
            alert(`Veuillez nommer la couleur ${i + 1}`);
            setSubmitting(false);
            return;
          }
          if (
            variant.selectedFiles.length === 0 &&
            variant.images.length === 0
          ) {
            alert(
              `Veuillez ajouter au moins une image pour la couleur "${variant.name}"`
            );
            setSubmitting(false);
            return;
          }
        }

        // Upload images for each color variant
        for (let i = 0; i < colorVariants.length; i++) {
          const variant = colorVariants[i];
          let variantImages = [...variant.images];

          if (variant.selectedFiles.length > 0) {
            const newImageUrls = await uploadImages(variant.selectedFiles);
            variantImages = [...variantImages, ...newImageUrls];
          }

          colors.push({
            name: variant.name,
            hex: variant.hex,
            images: variantImages,
            is_sold_out: variant.is_sold_out || false,
            stock_quantity: variant.stock_quantity || null,
          });

          allImageUrls.push(...variantImages);
        }
      } else {
        // Handle single variant (no color options)
        let productImages = [...uploadedImages];
        if (selectedFiles.length > 0) {
          const newImageUrls = await uploadImages(selectedFiles);
          productImages = [...productImages, ...newImageUrls];
        }

        if (productImages.length === 0) {
          alert("Veuillez ajouter au moins une image du produit");
          setSubmitting(false);
          return;
        }

        allImageUrls = productImages;
      }

      const productData = {
        name: data.name,
        description: data.description,
        price: data.price,
        image_url: allImageUrls[0], // First image as main image
        images: allImageUrls,
        has_color_variants: data.has_color_variants,
        colors: colors.length > 0 ? colors : null,
        is_sold_out: data.is_sold_out || false,
        stock_quantity: data.stock_quantity,
      };

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;

        setProducts(
          products.map((p) =>
            p.id === editingProduct.id ? { ...p, ...productData } : p
          )
        );
      } else {
        // Create new product
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert([productData as ProductInsert])
          .select()
          .single();

        if (error) throw error;

        setProducts([newProduct, ...products]);
      }

      setShowForm(false);
      setEditingProduct(null);
      reset();
      setUploadedImages([]);
      setSelectedFiles([]);
      setColorVariants([]);
      setHasColorVariants(false);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Erreur lors de l'enregistrement du produit. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setValue("name", product.name);
    setValue("description", product.description);
    setValue("price", product.price);
    setValue("has_color_variants", product.has_color_variants);
    setValue("is_sold_out", product.is_sold_out || false);
    setValue("stock_quantity", product.stock_quantity);

    setHasColorVariants(product.has_color_variants);

    if (product.has_color_variants && product.colors) {
      // Set color variants for editing
      setColorVariants(
        product.colors.map((color) => ({
          ...color,
          selectedFiles: [],
        }))
      );
      setUploadedImages([]);
      setSelectedFiles([]);
    } else {
      // Set regular images for editing
      if (product.images && product.images.length > 0) {
        setUploadedImages(product.images);
      } else if (product.image_url) {
        setUploadedImages([product.image_url]);
      }
      setColorVariants([]);
      setSelectedFiles([]);
    }

    setShowForm(true);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) throw error;

      setProducts(products.filter((p) => p.id !== product.id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setUploadedImages([]);
    setSelectedFiles([]);
    setColorVariants([]);
    setHasColorVariants(false);
    reset();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
    }).format(price);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
            <p className="text-gray-600">Gérez votre catalogue de montres</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchProducts}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Produit
            </button>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleCancel}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingProduct
                        ? "Modifier le Produit"
                        : "Ajouter un Nouveau Produit"}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Nom du Produit *
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register("name", {
                          required: "Le nom est requis",
                          minLength: {
                            value: 3,
                            message:
                              "Le nom doit contenir au moins 3 caractères",
                          },
                        })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Nom de la montre"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Description *
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        {...register("description", {
                          required: "La description est requise",
                          minLength: {
                            value: 10,
                            message:
                              "La description doit contenir au moins 10 caractères",
                          },
                        })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Description du produit"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Prix (MAD) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        id="price"
                        {...register("price", {
                          required: "Le prix est requis",
                          min: {
                            value: 0.01,
                            message: "Le prix doit être supérieur à 0",
                          },
                        })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="0.00"
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.price.message}
                        </p>
                      )}
                    </div>

                    {/* Color Variants Option */}
                    <div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="has_color_variants"
                          {...register("has_color_variants")}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setValue("has_color_variants", checked);
                            setHasColorVariants(checked);
                            if (!checked) {
                              setColorVariants([]);
                            }
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="has_color_variants"
                          className="text-sm font-medium text-gray-700"
                        >
                          Ce produit a plusieurs couleurs
                        </label>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Cochez cette option si vous voulez proposer cette montre
                        en plusieurs couleurs
                      </p>
                    </div>

                    {/* Sold Out Status */}
                    <div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="is_sold_out"
                          {...register("is_sold_out")}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="is_sold_out"
                          className="text-sm font-medium text-gray-700"
                        >
                          Produit en rupture de stock
                        </label>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Marquer ce produit comme épuisé (non disponible à la commande)
                      </p>
                    </div>

                    {/* Stock Quantity */}
                    <div>
                      <label
                        htmlFor="stock_quantity"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Quantité en stock (optionnel)
                      </label>
                      <input
                        type="number"
                        min="0"
                        id="stock_quantity"
                        {...register("stock_quantity", {
                          min: {
                            value: 0,
                            message: "La quantité ne peut pas être négative",
                          },
                          setValueAs: (value) => value === "" ? null : parseInt(value) || null,
                        })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Laisser vide si non suivi"
                      />
                      {errors.stock_quantity && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.stock_quantity.message}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        Laisser vide pour ne pas suivre le stock
                      </p>
                    </div>

                    {/* Image Upload Section - Conditional based on color variants */}
                    {hasColorVariants ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Couleurs et Images *
                        </label>

                        {colorVariants.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="border border-gray-200 rounded-lg p-4 mb-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-md font-medium text-gray-800">
                                Couleur {colorIndex + 1}
                              </h4>
                              <button
                                type="button"
                                onClick={() => removeColorVariant(colorIndex)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Nom de la couleur *
                                </label>
                                <input
                                  type="text"
                                  value={color.name}
                                  onChange={(e) =>
                                    updateColorVariant(
                                      colorIndex,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Ex: Noir, Or, Argent..."
                                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Code couleur
                                </label>
                                <input
                                  type="color"
                                  value={color.hex}
                                  onChange={(e) =>
                                    updateColorVariant(
                                      colorIndex,
                                      "hex",
                                      e.target.value
                                    )
                                  }
                                  className="block w-full h-10 border border-gray-300 rounded-md"
                                />
                              </div>
                            </div>

                            {/* Sold out status and stock for this color */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`color_sold_out_${colorIndex}`}
                                    checked={color.is_sold_out || false}
                                    onChange={(e) =>
                                      updateColorVariant(
                                        colorIndex,
                                        "is_sold_out",
                                        e.target.checked
                                      )
                                    }
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                  />
                                  <label
                                    htmlFor={`color_sold_out_${colorIndex}`}
                                    className="text-sm font-medium text-gray-700"
                                  >
                                    En rupture de stock
                                  </label>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Stock (optionnel)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={color.stock_quantity || ""}
                                  onChange={(e) =>
                                    updateColorVariant(
                                      colorIndex,
                                      "stock_quantity",
                                      e.target.value ? parseInt(e.target.value) : null
                                    )
                                  }
                                  placeholder="Quantité disponible"
                                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                />
                              </div>
                            </div>

                            {/* Image upload for this color */}
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Images pour{" "}
                                {color.name || `Couleur ${colorIndex + 1}`} *
                              </label>
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) =>
                                  handleColorFileSelect(colorIndex, e)
                                }
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                              />
                            </div>

                            {/* Selected files preview */}
                            {color.selectedFiles.length > 0 && (
                              <div className="mb-3">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                  Images sélectionnées:
                                </h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {color.selectedFiles.map(
                                    (file, fileIndex) => (
                                      <div
                                        key={fileIndex}
                                        className="relative group"
                                      >
                                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                          <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${fileIndex + 1}`}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeColorSelectedFile(
                                              colorIndex,
                                              fileIndex
                                            )
                                          }
                                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Uploaded images preview */}
                            {color.images.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                  Images actuelles:
                                </h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {color.images.map((imageUrl, imageIndex) => (
                                    <div
                                      key={imageIndex}
                                      className="relative group"
                                    >
                                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                          src={imageUrl}
                                          alt={`${color.name} ${
                                            imageIndex + 1
                                          }`}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeColorUploadedImage(
                                            colorIndex,
                                            imageIndex
                                          )
                                        }
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addColorVariant}
                          className="w-full flex items-center justify-center px-4 py-3 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors"
                        >
                          <Palette className="h-4 w-4 mr-2" />
                          Ajouter une couleur
                        </button>

                        {colorVariants.length === 0 && (
                          <p className="text-sm text-red-600 mt-2">
                            Au moins une couleur est requise
                          </p>
                        )}
                      </div>
                    ) : (
                      /* Regular image upload for single variant products */
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Images du Produit *
                        </label>

                        {/* File Input */}
                        <div className="mb-4">
                          <input
                            type="file"
                            id="images"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Sélectionnez une ou plusieurs images (JPEG, PNG,
                            WebP). Max 5MB par image.
                          </p>
                        </div>

                        {/* Selected Files Preview */}
                        {selectedFiles.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Images sélectionnées:
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {selectedFiles.map((file, index) => (
                                <div key={index} className="relative group">
                                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeSelectedFile(index)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                  <p className="mt-1 text-xs text-gray-600 truncate">
                                    {file.name}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Uploaded Images Preview */}
                        {uploadedImages.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Images actuelles:
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {uploadedImages.map((imageUrl, index) => (
                                <div key={index} className="relative group">
                                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                      src={imageUrl}
                                      alt={`Image ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeUploadedImage(index)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {uploadedImages.length === 0 &&
                          selectedFiles.length === 0 && (
                            <p className="text-sm text-red-600">
                              Au moins une image est requise
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={submitting || uploadingImages}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploadingImages
                      ? "Téléchargement..."
                      : submitting
                      ? "Enregistrement..."
                      : editingProduct
                      ? "Modifier"
                      : "Créer"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Aucun produit pour le moment
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par ajouter votre première montre au catalogue.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Votre Premier Produit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow ${
                product.is_sold_out ? 'opacity-75' : ''
              }`}
            >
              <div className="aspect-square bg-gray-200 overflow-hidden relative">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center`;
                  }}
                />
                {product.is_sold_out && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ÉPUISÉ
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-primary-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.stock_quantity !== null && (
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock_quantity}
                    </span>
                  )}
                </div>
                {/* Color variants sold out status */}
                {product.has_color_variants && product.colors && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {product.colors.map((color, index) => (
                        <div
                          key={index}
                          className={`w-4 h-4 rounded-full border-2 ${
                            color.is_sold_out 
                              ? 'border-red-500 opacity-50' 
                              : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={`${color.name}${color.is_sold_out ? ' - Épuisé' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
