import { supabase } from "./src/lib/supabase.js";

async function checkProducts() {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      return;
    }

    console.log("Total products:", products?.length || 0);

    products?.forEach((product) => {
      console.log("\n--- Product:", product.name, "---");
      console.log("ID:", product.id);
      console.log("Image URL:", product.image_url);
      console.log("Images array:", product.images);
      console.log("Has color variants:", product.has_color_variants);
      console.log("Colors:", product.colors);

      if (product.has_color_variants && product.colors) {
        const colors = Array.isArray(product.colors) ? product.colors : [];
        console.log("Color variants count:", colors.length);
        colors.forEach((color, index) => {
          console.log(
            `  Color ${index + 1}:`,
            color.name,
            "Images:",
            color.images?.length || 0
          );
        });
      }

      const totalImages =
        (product.images?.length || 0) + (product.image_url ? 1 : 0);
      if (product.has_color_variants && product.colors) {
        const colorImages = Array.isArray(product.colors)
          ? product.colors.reduce(
              (sum, color) => sum + (color.images?.length || 0),
              0
            )
          : 0;
        console.log("Total images (from colors):", colorImages);
      } else {
        console.log("Total images (regular):", totalImages);
      }
    });
  } catch (err) {
    console.error("Script error:", err);
  }
}

checkProducts();
