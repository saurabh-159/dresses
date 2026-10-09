import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";

export default function CreateProductPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Add product"
        description="Fill in details, photos, and attribute combinations."
      />
      <ProductForm />
    </div>
  );
}
