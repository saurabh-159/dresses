import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AttributeForm from "@/components/admin/AttributeForm";

export default function CreateAttributePage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Add attribute"
        description="Create a new option group for products."
      />
      <AttributeForm />
    </div>
  );
}
