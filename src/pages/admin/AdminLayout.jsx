import Sidebar from '../../components/Sidebar';

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-white flex">
    <Sidebar userType="admin" />
    <div className="flex-1">{children}</div>
  </div>
);

export default AdminLayout; 