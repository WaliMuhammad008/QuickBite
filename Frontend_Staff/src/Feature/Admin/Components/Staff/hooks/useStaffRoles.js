import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../../../../utils/apiHelper";

export const DEFAULT_ROLES = [
  "Admin",
  "Manager",
  "Cashier",
  "Chef",
  "Rider",
  "Waiter",
];

export function useStaffRoles() {
  const queryClient = useQueryClient();

  const { data: roles = DEFAULT_ROLES, isLoading } = useQuery({
    queryKey: ["staff_roles"],
    queryFn: async () => {
      try {
        const response = await apiFetch("get_staff_roles.php");
        const result = await response.json();
        if (result.success && Array.isArray(result.roles) && result.roles.length > 0) {
          return result.roles;
        }
      } catch (err) {
        console.error("Error fetching staff roles:", err);
      }
      return DEFAULT_ROLES;
    },
    staleTime: 60 * 1000,
  });

  const invalidateRoles = () => {
    queryClient.invalidateQueries({ queryKey: ["staff_roles"] });
  };

  return { roles, isLoading, invalidateRoles };
}
