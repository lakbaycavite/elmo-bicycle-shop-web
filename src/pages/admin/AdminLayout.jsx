import Sidebar from '../../components/Sidebar';

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-white flex">
    <Sidebar userType="admin" />
    <div className="flex-1 lg:ml-0 pt-16 lg:pt-0 px-4 lg:px-0">
      {children}
    </div>
  </div>
);

export default AdminLayout; 