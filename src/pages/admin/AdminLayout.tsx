import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="p-10 border-4 border-red-500 min-h-screen">
      <h1 className="text-3xl font-bold text-red-600 mb-4">MODE DEBUG ADMIN</h1>
      <p>Si vous voyez ceci, le Router fonctionne !</p>
      <hr className="my-4"/>
      <div className="bg-gray-100 p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;