import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CategoryForm from "@/components/admin/CategoryForm";

export default function CreateCategoryPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Add category"
        description="Create a new collection for the storefront."
      />
      <CategoryForm />
    </div>
  );
}
