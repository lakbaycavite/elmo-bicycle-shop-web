import AdminLayout from './AdminLayout';

function Dashboard() {
  return (
    <AdminLayout>
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-2xl text-gray-900">This is admin dashboard</h1>
      </div>
    </AdminLayout>
  );
}

export default Dashboard; 