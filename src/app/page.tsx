import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/login"); // Atau "/dashboard" jika ingin langsung dashboard
  return null;
}