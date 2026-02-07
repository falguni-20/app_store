import { useAuthStore } from "../store/authStore";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome {user?.name}</p>
    </div>
  );
}
